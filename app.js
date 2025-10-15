const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

// Middleware para verificar se arquivos JavaScript existem
app.use("/javascripts", (req, res, next) => {
  console.log(`📁 [Servidor] Requisição para: ${req.path}`);

  if (req.path.endsWith(".js")) {
    const filePath = path.join(__dirname, "public", "javascripts", req.path);
    console.log(`🔍 [Servidor] Verificando arquivo: ${filePath}`);

    if (fs.existsSync(filePath)) {
      console.log(`✅ [Servidor] Arquivo encontrado: ${req.path}`);
      res.setHeader("Content-Type", "application/javascript");
    } else {
      console.error(`❌ [Servidor] Arquivo não encontrado: ${req.path}`);
      console.error(`❌ [Servidor] Caminho completo: ${filePath}`);
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
