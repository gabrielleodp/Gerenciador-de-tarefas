const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

// GET /api/tarefas?usuarioId=xxx — Lista tarefas de um usuário
router.get("/", async (req, res) => {
  const { usuarioId, concluida } = req.query;

  if (!usuarioId) {
    return res.status(400).json({ erro: "Query param 'usuarioId' é obrigatório" });
  }

  const filtro = { usuarioId };
  if (concluida !== undefined) {
    filtro.concluida = concluida === "true";
  }

  try {
    const tarefas = await prisma.tarefa.findMany({
      where: filtro,
      orderBy: { dataPrevista: "asc" },
    });
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/tarefas/:id — Busca uma tarefa pelo ID
router.get("/:id", async (req, res) => {
  try {
    const tarefa = await prisma.tarefa.findUnique({ where: { id: req.params.id } });
    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/tarefas — Cria uma nova tarefa
router.post("/", async (req, res) => {
  const { usuarioId, titulo, dataPrevista } = req.body;

  if (!usuarioId || !titulo) {
    return res.status(400).json({ erro: "Campos obrigatórios: usuarioId, titulo" });
  }

  try {
    const tarefa = await prisma.tarefa.create({
      data: {
        usuarioId,
        titulo,
        dataPrevista: dataPrevista ? new Date(dataPrevista) : null,
      },
    });
    res.status(201).json(tarefa);
  } catch (err) {
    if (err.code === "P2003") return res.status(404).json({ erro: "Usuário não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

// PUT /api/tarefas/:id — Atualiza uma tarefa
router.put("/:id", async (req, res) => {
  const { titulo, dataPrevista, concluida } = req.body;
  try {
    const tarefa = await prisma.tarefa.update({
      where: { id: req.params.id },
      data: {
        titulo,
        dataPrevista: dataPrevista ? new Date(dataPrevista) : undefined,
        concluida,
      },
    });
    res.json(tarefa);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /api/tarefas/:id/concluir — Marca a tarefa como concluída
router.patch("/:id/concluir", async (req, res) => {
  try {
    const tarefa = await prisma.tarefa.update({
      where: { id: req.params.id },
      data: { concluida: true },
    });
    res.json(tarefa);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/tarefas/:id — Remove uma tarefa
router.delete("/:id", async (req, res) => {
  try {
    await prisma.tarefa.delete({ where: { id: req.params.id } });
    res.json({ mensagem: "Tarefa removida com sucesso" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
