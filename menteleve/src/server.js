const express = require("express");
const app = express();

app.use(express.json());

// Rotas
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/tarefas", require("./routes/tarefas"));
app.use("/api/habitos", require("./routes/habitos"));
app.use("/api/metas", require("./routes/metas"));
app.use("/api/financas", require("./routes/financas"));

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    projeto: "MenteLeve API",
    versao: "1.0.0",
    rotas: [
      "/api/usuarios",
      "/api/tarefas",
      "/api/habitos",
      "/api/metas",
      "/api/financas",
    ],
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor", detalhe: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MenteLeve API rodando em http://localhost:${PORT}`);
});

module.exports = app;
