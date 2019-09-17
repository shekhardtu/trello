var express = require("express");

var path = require("path");
var bodyParser = require("body-parser");

app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static(path.join(__dirname, "dist")));

var port = process.env.PORT || 5000;

app.listen(port);

console.log("server started " + port);
