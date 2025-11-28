const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

require("dotenv").config();

// Gerar arquivo de configuração com a URL da API
// Se API_BASE_URL não estiver definida, detecta automaticamente
let API_BASE_URL = process.env.API_BASE_URL;

if (!API_BASE_URL) {
  // Se estiver rodando em produção, requer VPS_IP configurado
  if (process.env.NODE_ENV === "production") {
    const VPS_IP = process.env.VPS_IP;
    const BACKEND_PORT = process.env.BACKEND_PORT || "4010";

    if (!VPS_IP) {
      console.error(
        "❌ Erro: VPS_IP não está definido. Configure a variável de ambiente VPS_IP em produção."
      );
      process.exit(1);
    }

    API_BASE_URL = `http://${VPS_IP}:${BACKEND_PORT}`;
  } else {
    // Fallback para localhost em desenvolvimento
    API_BASE_URL = "https://logistica.copapel.com.br/api";
  }
}

const configContent = `window.APP_CONFIG = {
  API_BASE_URL: "${API_BASE_URL}"
};`;

const configPath = path.join(__dirname, "public", "javascripts", "config.js");

// Só escreve o arquivo se o conteúdo for diferente (evita loop infinito do nodemon)
if (
  !fs.existsSync(configPath) ||
  fs.readFileSync(configPath, "utf8") !== configContent
) {
  fs.writeFileSync(configPath, configContent, "utf8");
}

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

const PORT = process.env.PORT || 3060;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API Base URL: ${API_BASE_URL}`);
});
