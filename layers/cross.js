module.exports = function({ value }) {
    console.log(`    跨域访问层: ${value}`);
    return function(req, res, next) {
        const origin = req.headers["origin"];
        if (origin) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Credentials", "true");
			res.setHeader("Access-Control-Allow-Headers", "content-type");
			console.log(`cross  --> ${req.originalUrl} <${origin}>`);
        }
        next();
    };
};