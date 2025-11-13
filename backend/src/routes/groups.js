// src/routes/groups.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /groups?ownerEmail=...
router.get("/", async (req, res) => {
  const ownerEmail = String(req.query.ownerEmail || "").toLowerCase();
  const q = String(req.query.q || "").toLowerCase();

  if (!ownerEmail) {
    return res.status(400).json({ error: "ownerEmail é obrigatório" });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT id, name, description, owner_email, role_date, created_at, updated_at
      FROM groups
      WHERE owner_email = ?
        AND (LOWER(name) LIKE CONCAT('%', ?, '%') OR ? = '')
      ORDER BY created_at DESC
      `,
      [ownerEmail, q, q]
    );

    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar grupos:", err);
    res.status(500).json({ error: "Erro ao listar grupos" });
  }
});

// POST /groups
router.post("/", async (req, res) => {
  const { ownerEmail, name, description, roleDateISO, emails } = req.body || {};
  const owner_email = String(ownerEmail || "").toLowerCase();

  if (!owner_email) {
    return res.status(400).json({ error: "ownerEmail é obrigatório" });
  }
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Nome do grupo é obrigatório" });
  }

  try {
    const now = new Date();
    const [result] = await db.execute(
      `
      INSERT INTO groups (name, description, owner_email, role_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        String(name).trim(),
        description ? String(description).trim() : null,
        owner_email,
        roleDateISO ? new Date(roleDateISO) : null,
        now,
        now,
      ]
    );

    const groupId = result.insertId; // PK auto-increment

    // opcional: salvar membros iniciais
    if (Array.isArray(emails) && emails.length > 0) {
      const values = emails
        .map((e) => String(e || "").trim().toLowerCase())
        .filter(Boolean)
        .map((email) => [groupId, email]);

      if (values.length > 0) {
        await db.query(
          `INSERT INTO group_members (group_id, email) VALUES ?`,
          [values]
        );
      }
    }

    res.status(201).json({ id: groupId });
  } catch (err) {
    console.error("Erro ao criar grupo:", err);
    res.status(500).json({ error: "Erro ao criar grupo" });
  }
});

// PATCH /groups/:id
router.patch("/:id", async (req, res) => {
  const groupId = req.params.id;
  const { name, description, roleDateISO, emails } = req.body || {};

  const fields = [];
  const params = [];

  if (name) {
    fields.push("name = ?");
    params.push(String(name).trim());
  }
  if (description !== undefined) {
    fields.push("description = ?");
    params.push(description ? String(description).trim() : null);
  }
  if (roleDateISO !== undefined) {
    fields.push("role_date = ?");
    params.push(roleDateISO ? new Date(roleDateISO) : null);
  }

  try {
    if (fields.length > 0) {
      fields.push("updated_at = ?");
      params.push(new Date());
      params.push(groupId);

      await db.execute(
        `UPDATE groups SET ${fields.join(", ")} WHERE id = ?`,
        params
      );
    }

    // emails: se vier array, reseta membros
    if (Array.isArray(emails)) {
      await db.execute(
        `DELETE FROM group_members WHERE group_id = ?`,
        [groupId]
      );

      const values = emails
        .map((e) => String(e || "").trim().toLowerCase())
        .filter(Boolean)
        .map((email) => [groupId, email]);

      if (values.length > 0) {
        await db.query(
          `INSERT INTO group_members (group_id, email) VALUES ?`,
          [values]
        );
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao atualizar grupo:", err);
    res.status(500).json({ error: "Erro ao atualizar grupo" });
  }
});

// DELETE /groups/:id
router.delete("/:id", async (req, res) => {
  const groupId = req.params.id;

  try {
    // apaga dependências primeiro (se tiver FK)
    await db.execute(`DELETE FROM expenses WHERE group_id = ?`, [groupId]);
    await db.execute(`DELETE FROM group_members WHERE group_id = ?`, [groupId]);
    await db.execute(`DELETE FROM groups WHERE id = ?`, [groupId]);

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir grupo:", err);
    res.status(500).json({ error: "Erro ao excluir grupo" });
  }
});

module.exports = router;
