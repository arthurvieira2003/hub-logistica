const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

app.use("/javascripts", (req, res, next) => {
  if (req.path.endsWith(".js")) {
    const filePath = path.join(__dirname, "public", "javascripts", req.path);

    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/javascript");
    }
  }
  next();
});

app.use(express.static("public"));
app.use("/javascripts", express.static("public/javascripts"));
app.use("/styles", express.static("public/styles"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/login.html");
});

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html");
});

app.get("/administration", (req, res) => {
  res.sendFile(__dirname + "/public/html/administration.html");
});

app.listen(3060, () => {
  console.log("Servidor rodando na porta 3060");
});
