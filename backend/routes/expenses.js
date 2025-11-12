import express from "express";
import { db } from "../db.js";

const router = express.Router();

// Listar despesas de um grupo
router.get("/:groupId", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM expenses WHERE group_id = ? ORDER BY created_at DESC",
      [req.params.groupId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar despesa
router.post("/:groupId", async (req, res) => {
  const { title, amount, buyer, category, date_iso } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO expenses (group_id, title, amount, buyer, category, date_iso) VALUES (?, ?, ?, ?, ?, ?)",
      [req.params.groupId, title, amount, buyer, category, date_iso]
    );
    res.status(201).json({ id: result.insertId, title, amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
