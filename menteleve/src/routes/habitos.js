const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

// GET /api/habitos?usuarioId=xxx — Lista hábitos de um usuário
router.get("/", async (req, res) => {
  const { usuarioId, frequencia } = req.query;

  if (!usuarioId) {
    return res.status(400).json({ erro: "Query param 'usuarioId' é obrigatório" });
  }

  const filtro = { usuarioId };
  if (frequencia) filtro.frequencia = frequencia;

  try {
    const habitos = await prisma.habito.findMany({
      where: filtro,
      include: { registros: { orderBy: { data: "desc" }, take: 7 } },
      orderBy: { criadoEm: "desc" },
    });
    res.json(habitos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/habitos/:id — Busca um hábito pelo ID com todos os registros
router.get("/:id", async (req, res) => {
  try {
    const habito = await prisma.habito.findUnique({
      where: { id: req.params.id },
      include: { registros: { orderBy: { data: "desc" } } },
    });
    if (!habito) return res.status(404).json({ erro: "Hábito não encontrado" });
    res.json(habito);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/habitos — Cria um novo hábito
router.post("/", async (req, res) => {
  const { usuarioId, nome, frequencia } = req.body;

  if (!usuarioId || !nome || !frequencia) {
    return res.status(400).json({ erro: "Campos obrigatórios: usuarioId, nome, frequencia (diaria | semanal)" });
  }

  if (!["diaria", "semanal"].includes(frequencia)) {
    return res.status(400).json({ erro: "frequencia deve ser 'diaria' ou 'semanal'" });
  }

  try {
    const habito = await prisma.habito.create({
      data: { usuarioId, nome, frequencia },
    });
    res.status(201).json(habito);
  } catch (err) {
    if (err.code === "P2003") return res.status(404).json({ erro: "Usuário não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

// PUT /api/habitos/:id — Atualiza um hábito
router.put("/:id", async (req, res) => {
  const { nome, frequencia } = req.body;

  if (frequencia && !["diaria", "semanal"].includes(frequencia)) {
    return res.status(400).json({ erro: "frequencia deve ser 'diaria' ou 'semanal'" });
  }

  try {
    const habito = await prisma.habito.update({
      where: { id: req.params.id },
      data: { nome, frequencia },
    });
    res.json(habito);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Hábito não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/habitos/:id — Remove um hábito
router.delete("/:id", async (req, res) => {
  try {
    await prisma.habito.delete({ where: { id: req.params.id } });
    res.json({ mensagem: "Hábito removido com sucesso" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Hábito não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

// ─── Registros de Hábito ────────────────────────────────────────────────────

// GET /api/habitos/:id/registros — Lista registros de um hábito
router.get("/:id/registros", async (req, res) => {
  try {
    const registros = await prisma.registroHabito.findMany({
      where: { habitoId: req.params.id },
      orderBy: { data: "desc" },
    });
    res.json(registros);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/habitos/:id/registros — Registra conclusão de um hábito em uma data
router.post("/:id/registros", async (req, res) => {
  const { data, concluido } = req.body;

  if (!data) {
    return res.status(400).json({ erro: "Campo obrigatório: data (ISO 8601)" });
  }

  try {
    const registro = await prisma.registroHabito.create({
      data: {
        habitoId: req.params.id,
        data: new Date(data),
        concluido: concluido ?? false,
      },
    });
    res.status(201).json(registro);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ erro: "Já existe um registro para esse hábito nesta data" });
    }
    if (err.code === "P2003") return res.status(404).json({ erro: "Hábito não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /api/habitos/registros/:registroId — Atualiza status de um registro
router.patch("/registros/:registroId", async (req, res) => {
  const { concluido } = req.body;
  if (concluido === undefined) {
    return res.status(400).json({ erro: "Campo obrigatório: concluido (boolean)" });
  }
  try {
    const registro = await prisma.registroHabito.update({
      where: { id: req.params.registroId },
      data: { concluido },
    });
    res.json(registro);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Registro não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
