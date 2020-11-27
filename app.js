const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();


app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.listen(process.env.PORT || 8080 , function () {
  console.log("Server running at port 8080");
});
