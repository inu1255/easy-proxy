const path = require("path");
const fs = require("fs");

module.exports = function({ value }) {
    console.log(`    接口模拟层: ${value}`);
    return function(req, res, next) {
        let file = path.join(value, req.path + ".json");
        if (fs.existsSync(file)) {
			console.log(`mockapi--> ${req.originalUrl}`);
            let text = fs.readFileSync(file);
            let data = new Function("return " + text)();
            data = data.ret;
            while (data && !data.no && !data.status) {
                for (let k in data) {
                    data = data[k];
                    break;
                }
			}
			if (data.no) {
				res.writeHead(200, {
					"content-type": "application/json"
				});
				res.write(JSON.stringify(data));
			}else{
				res.writeHead(data.status, {
					"content-type": data["content-type"]
				});
				res.write(data.responseText);
			}
            res.end();
        } else next();
    };
};