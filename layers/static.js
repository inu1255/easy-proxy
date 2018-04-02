const express = require("express");

module.exports = function({ value }) {
    console.log(`    静态文件层: ${value}`);
    return express.static(value, { index: ["index.html", "index.htm"] });
};