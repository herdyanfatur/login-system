
const sequelize = require("sequelize");

const db = new sequelize("nodelogin","root","herdyan", {
    dialect: "mysql"
});

db.sync({});

module.exports = db;