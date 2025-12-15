const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

require("dotenv").config();

let API_BASE_URL = process.env.API_BASE_URL;

const API_TOKEN = process.env.API_TOKEN;

const configContent = `window.APP_CONFIG = {
  API_BASE_URL: "${API_BASE_URL}",
  API_TOKEN: "${API_TOKEN}"
};`;

const configPath = path.join(__dirname, "public", "javascripts", "config.js");

if (
  !fs.existsSync(configPath) ||
  fs.readFileSync(configPath, "utf8") !== configContent
) {
  fs.writeFileSync(configPath, configContent, "utf8");
}

// Desabilitar cache para todos os arquivos estáticos
app.use(
  express.static("public", {
    setHeaders: (res, path) => {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    },
  })
);
app.use(
  "/javascripts",
  express.static("public/javascripts", {
    setHeaders: (res, path) => {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    },
  })
);
app.use(
  "/styles",
  express.static("public/styles", {
    setHeaders: (res, path) => {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    },
  })
);

app.get("/", (req, res) => {
  // Desabilitar cache para a página HTML
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.sendFile(__dirname + "/public/html/rastreamento.html");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API Base URL: ${API_BASE_URL}`);
});
