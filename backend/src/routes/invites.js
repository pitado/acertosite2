// src/routes/invites.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /invites/:token/accept
router.post("/:token/accept", async (req, res) => {
  const token = req.params.token;
  const { email } = req.body || {};
  const normalized = String(email || "").trim().toLowerCase();

  if (!normalized || !normalized.includes("@")) {
    return res.status(400).json({ error: "E-mail inválido" });
  }

  try {
    const [invites] = await db.execute(
      `
      SELECT group_id, expires_at
      FROM invites
      WHERE token = ?
      LIMIT 1
      `,
      [token]
    );

    const invite = invites[0];
    if (!invite) {
      return res.status(404).json({ error: "Convite inválido" });
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return res.status(400).json({ error: "Convite expirado" });
    }

    await db.execute(
      `INSERT INTO group_members (group_id, email, created_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE email = email`,
      [invite.group_id, normalized, new Date()]
    );

    try {
      await db.execute(
        `INSERT INTO group_logs (group_id, message, created_at) VALUES (?, ?, ?)`,
        [invite.group_id, `Convite aceito por ${normalized}.`, new Date()]
      );
    } catch (logErr) {
      console.warn("Aviso: não foi possível registrar log do convite:", logErr);
    }

    res.status(201).json({ ok: true, group_id: invite.group_id });
  } catch (err) {
    console.error("Erro ao aceitar convite:", err);
    res.status(500).json({ error: "Erro ao aceitar convite" });
  }
});

module.exports = router;
