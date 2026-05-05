const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

// GET /api/metas?usuarioId=xxx — Lista metas de um usuário
router.get("/", async (req, res) => {
  const { usuarioId, concluida } = req.query;

  if (!usuarioId) {
    return res.status(400).json({ erro: "Query param 'usuarioId' é obrigatório" });
  }

  const filtro = { usuarioId };
  if (concluida !== undefined) filtro.concluida = concluida === "true";

  try {
    const metas = await prisma.meta.findMany({
      where: filtro,
      orderBy: { prazo: "asc" },
    });
    res.json(metas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/metas/:id — Busca uma meta pelo ID
router.get("/:id", async (req, res) => {
  try {
    const meta = await prisma.meta.findUnique({ where: { id: req.params.id } });
    if (!meta) return res.status(404).json({ erro: "Meta não encontrada" });
    res.json(meta);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/metas — Cria uma nova meta
router.post("/", async (req, res) => {
  const { usuarioId, titulo, prazo, progressoPct } = req.body;

  if (!usuarioId || !titulo || !prazo) {
    return res.status(400).json({ erro: "Campos obrigatórios: usuarioId, titulo, prazo" });
  }

  if (progressoPct !== undefined && (progressoPct < 0 || progressoPct > 100)) {
    return res.status(400).json({ erro: "progressoPct deve estar entre 0 e 100" });
  }

  try {
    const meta = await prisma.meta.create({
      data: {
        usuarioId,
        titulo,
        prazo: new Date(prazo),
        progressoPct: progressoPct ?? 0,
      },
    });
    res.status(201).json(meta);
  } catch (err) {
    if (err.code === "P2003") return res.status(404).json({ erro: "Usuário não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

// PUT /api/metas/:id — Atualiza uma meta
router.put("/:id", async (req, res) => {
  const { titulo, prazo, progressoPct, concluida } = req.body;

  if (progressoPct !== undefined && (progressoPct < 0 || progressoPct > 100)) {
    return res.status(400).json({ erro: "progressoPct deve estar entre 0 e 100" });
  }

  try {
    const meta = await prisma.meta.update({
      where: { id: req.params.id },
      data: {
        titulo,
        prazo: prazo ? new Date(prazo) : undefined,
        progressoPct,
        concluida,
      },
    });
    res.json(meta);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Meta não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /api/metas/:id/progresso — Atualiza apenas o progresso da meta
router.patch("/:id/progresso", async (req, res) => {
  const { progressoPct } = req.body;

  if (progressoPct === undefined || progressoPct < 0 || progressoPct > 100) {
    return res.status(400).json({ erro: "progressoPct é obrigatório e deve estar entre 0 e 100" });
  }

  try {
    const meta = await prisma.meta.update({
      where: { id: req.params.id },
      data: {
        progressoPct,
        concluida: progressoPct === 100,
      },
    });
    res.json(meta);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Meta não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/metas/:id — Remove uma meta
router.delete("/:id", async (req, res) => {
  try {
    await prisma.meta.delete({ where: { id: req.params.id } });
    res.json({ mensagem: "Meta removida com sucesso" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Meta não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
