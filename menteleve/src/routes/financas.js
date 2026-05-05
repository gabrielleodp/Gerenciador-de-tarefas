const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

// GET /api/financas?usuarioId=xxx — Lista movimentações de um usuário
router.get("/", async (req, res) => {
  const { usuarioId, tipo } = req.query;

  if (!usuarioId) {
    return res.status(400).json({ erro: "Query param 'usuarioId' é obrigatório" });
  }

  const filtro = { usuarioId };
  if (tipo) {
    if (!["entrada", "saida"].includes(tipo)) {
      return res.status(400).json({ erro: "tipo deve ser 'entrada' ou 'saida'" });
    }
    filtro.tipo = tipo;
  }

  try {
    const financas = await prisma.financa.findMany({
      where: filtro,
      orderBy: { data: "desc" },
    });
    res.json(financas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/financas/saldo?usuarioId=xxx — Retorna o saldo calculado dinamicamente
router.get("/saldo", async (req, res) => {
  const { usuarioId } = req.query;

  if (!usuarioId) {
    return res.status(400).json({ erro: "Query param 'usuarioId' é obrigatório" });
  }

  try {
    const [entradas, saidas] = await Promise.all([
      prisma.financa.aggregate({
        where: { usuarioId, tipo: "entrada" },
        _sum: { valor: true },
      }),
      prisma.financa.aggregate({
        where: { usuarioId, tipo: "saida" },
        _sum: { valor: true },
      }),
    ]);

    const totalEntradas = entradas._sum.valor ?? 0;
    const totalSaidas = saidas._sum.valor ?? 0;
    const saldo = totalEntradas - totalSaidas;

    res.json({
      usuarioId,
      totalEntradas,
      totalSaidas,
      saldo: parseFloat(saldo.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/financas/:id — Busca uma movimentação pelo ID
router.get("/:id", async (req, res) => {
  try {
    const financa = await prisma.financa.findUnique({ where: { id: req.params.id } });
    if (!financa) return res.status(404).json({ erro: "Movimentação não encontrada" });
    res.json(financa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/financas — Registra uma nova movimentação
router.post("/", async (req, res) => {
  const { usuarioId, tipo, valor, descricao, data } = req.body;

  if (!usuarioId || !tipo || valor === undefined || !data) {
    return res.status(400).json({ erro: "Campos obrigatórios: usuarioId, tipo, valor, data" });
  }

  if (!["entrada", "saida"].includes(tipo)) {
    return res.status(400).json({ erro: "tipo deve ser 'entrada' ou 'saida'" });
  }

  if (valor <= 0) {
    return res.status(400).json({ erro: "valor deve ser maior que zero" });
  }

  try {
    const financa = await prisma.financa.create({
      data: {
        usuarioId,
        tipo,
        valor: parseFloat(valor),
        descricao: descricao ?? null,
        data: new Date(data),
      },
    });
    res.status(201).json(financa);
  } catch (err) {
    if (err.code === "P2003") return res.status(404).json({ erro: "Usuário não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

// PUT /api/financas/:id — Atualiza uma movimentação
router.put("/:id", async (req, res) => {
  const { tipo, valor, descricao, data } = req.body;

  if (tipo && !["entrada", "saida"].includes(tipo)) {
    return res.status(400).json({ erro: "tipo deve ser 'entrada' ou 'saida'" });
  }

  if (valor !== undefined && valor <= 0) {
    return res.status(400).json({ erro: "valor deve ser maior que zero" });
  }

  try {
    const financa = await prisma.financa.update({
      where: { id: req.params.id },
      data: {
        tipo,
        valor: valor !== undefined ? parseFloat(valor) : undefined,
        descricao,
        data: data ? new Date(data) : undefined,
      },
    });
    res.json(financa);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Movimentação não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/financas/:id — Remove uma movimentação
router.delete("/:id", async (req, res) => {
  try {
    await prisma.financa.delete({ where: { id: req.params.id } });
    res.json({ mensagem: "Movimentação removida com sucesso" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Movimentação não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
