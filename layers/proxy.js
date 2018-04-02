const fetch = require("node-fetch");

module.exports = function({ value }) {
    console.log(`    代理转发层: ${value}`);
    return function(req, res, next) {
        let url = value + req.url.replace(/https?:\/\//, "").slice(req.hostname.length);
        console.log("forward-->", url);
        fetch(url, {
            method: req.method,
            headers: req.headers,
            body: req,
            compress: false
        }).then(s => {
            if (s.status < 300) {
                res.writeHead(s.status, s.headers.raw());
                s.buffer().then(buf => {
                    res.write(buf);
                    res.end();
                });
                // s.body.pipe(res);
            } else {
                next();
            }
        }).catch(err => {
            next();
        });
    };
};