import express from "express";
import { db } from "../db.js";

const router = express.Router();

// Listar membros
router.get("/:groupId", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM group_members WHERE group_id = ? ORDER BY created_at DESC",
      [req.params.groupId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adicionar membro
router.post("/:groupId", async (req, res) => {
  const { email } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO group_members (group_id, email) VALUES (?, ?)",
      [req.params.groupId, email]
    );
    res.status(201).json({ id: result.insertId, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
