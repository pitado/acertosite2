// src/routes/expenses.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /expenses/:groupId  -> lista despesas do grupo
router.get("/:groupId", async (req, res) => {
  const groupId = req.params.groupId;

  try {
    const [rows] = await db.execute(
      `
      SELECT id, group_id, title, amount, buyer, payer, split,
             participants, category, subcategory,
             pix_key, location, date_iso, proof_url, paid, created_at
      FROM expenses
      WHERE group_id = ?
      ORDER BY date_iso DESC, created_at DESC
      `,
      [groupId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar despesas:", err);
    res.status(500).json({ error: "Erro ao listar despesas" });
  }
});

// POST /expenses/:groupId  -> cria nova despesa
router.post("/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  const body = req.body || {};

  if (!body.title) {
    return res.status(400).json({ error: "Título obrigatório" });
  }
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "Valor inválido" });
  }

  const payload = {
    group_id: groupId,
    title: String(body.title).trim(),
    amount,
    buyer: String(body.buyer || ""),
    payer: String(body.payer || ""),
    split: body.split || "equal_all",
    participants: Array.isArray(body.participants)
      ? JSON.stringify(body.participants)
      : null,
    category: body.category || null,
    subcategory: body.subcategory || null,
    pix_key: body.pix_key || null,
    location: body.location || null,
    date_iso: body.date_iso
      ? new Date(body.date_iso)
      : new Date(),
    proof_url: body.proof_url || null,
    paid: !!body.paid,
    created_at: new Date(),
  };

  try {
    const [result] = await db.execute(
      `
      INSERT INTO expenses
      (group_id, title, amount, buyer, payer, split, participants,
       category, subcategory, pix_key, location, date_iso, proof_url, paid, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.group_id,
        payload.title,
        payload.amount,
        payload.buyer,
        payload.payer,
        payload.split,
        payload.participants,
        payload.category,
        payload.subcategory,
        payload.pix_key,
        payload.location,
        payload.date_iso,
        payload.proof_url,
        payload.paid,
        payload.created_at,
      ]
    );

    const insertedId = result.insertId;
    res.status(201).json({ id: insertedId, ...payload });
  } catch (err) {
    console.error("Erro ao criar despesa:", err);
    res.status(500).json({ error: "Erro ao criar despesa" });
  }
});

// PATCH /expenses/:expenseId -> marcar pago / anexar comprovante etc.
router.patch("/:expenseId", async (req, res) => {
  const id = req.params.expenseId;
  const { paid, proofUrl } = req.body || {};

  const fields = [];
  const params = [];

  if (paid !== undefined) {
    fields.push("paid = ?");
    params.push(!!paid);
  }
  if (proofUrl !== undefined) {
    fields.push("proof_url = ?");
    params.push(proofUrl || null);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "Nada para atualizar" });
  }

  try {
    params.push(id);
    await db.execute(
      `UPDATE expenses SET ${fields.join(", ")} WHERE id = ?`,
      params
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao atualizar despesa:", err);
    res.status(500).json({ error: "Erro ao atualizar despesa" });
  }
});

// DELETE /expenses/:expenseId
router.delete("/:expenseId", async (req, res) => {
  const id = req.params.expenseId;
  try {
    await db.execute(`DELETE FROM expenses WHERE id = ?`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir despesa:", err);
    res.status(500).json({ error: "Erro ao excluir despesa" });
  }
});

module.exports = router;
