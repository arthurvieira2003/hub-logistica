const express = require("express");
const app = express();

app.use(express.static("public"));
app.use("/javascripts", express.static("public/javascripts"));
app.use("/styles", express.static("public/styles"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/login.html");
});

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html");
});

app.listen(3060, () => {
  console.log("Servidor rodando na porta 3060");
});
