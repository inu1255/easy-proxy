const noginx = require("express-noginx");
const express = require("express");
const fetch = require("node-fetch");
const app = noginx.express();

let servers = require("./servers.json");

let filter = process.argv[2];
if (filter) {
    if (filter.startsWith("/")) {
        servers = servers.filter(x => new RegExp(filter.slice(1, filter.length - 1)).test(x.appid));
    } else {
        servers = servers.filter(x => x.appid.startsWith(filter));
    }
}

let port = process.argv.indexOf("--port");
port = process.argv[port > 0 ? port + 1 : -1] || "9999";

function addLayer(layer, host) {
    let checkHost;
    if (host.startsWith("/")) {
        let re = new RegExp(host.slice(1, host.length - 1));
        checkHost = x => re.test(x);
    } else {
        checkHost = x => {
            return x.split(":")[0] == host || x == host;
        };
    }
    try {
        let hander = require(`./layers/${layer.type}`);
        hander = hander(layer);
        return function(req, res, next) {
            if (checkHost(req.headers["host"])) {
                if (req.protocol === "https") {
                    req.originalUrl = req.url = "https://" + req.headers["host"] + req.url;
                }
                hander(req, res, next);
            } else {
                next();
            }
        };
    } catch (error) {
		console.log(`can not found layer ${layer.type}`);
    }
}

for (let server of servers) {
    console.log("====================================");
    console.log(`代理: ${server.name}(${server.appid})`);
    console.log(`域名: http://${server.host}/`);
    if (!server.host) {
        console.log("缺少host字段,忽略本代理");
        continue;
    }
    for (let layer of server.layers) {
        let hander = addLayer(layer, server.host);
        if (hander) {
            if (!layer.path) {
                app.use(hander);
            } else if (layer.path.startsWith("/")) {
                app.use(new RegExp(layer.path.slice(1, layer.path.length - 1)), hander);
            } else {
                app.use(layer.path, hander);
            }
        }
    }
}

app.listen(port, function() {
    console.log("http://localhost:" + port);
});