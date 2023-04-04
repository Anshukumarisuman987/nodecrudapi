var sql = require("mssql");

var dbconfig = {
    user: "root",
    password: "",
    server: "localhost",
    database: "crudapi",

};

var database = new sql.ConnectionPool(dbconfig);

database
  .connect()
  .then(function () {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err.message);
  });

module.exports = database;