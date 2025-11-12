import express from "express";
import { db } from "../db.js";

const router = express.Router();

// Listar todos os grupos
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM groups ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar grupo
router.post("/", async (req, res) => {
  const { name, description, owner_email, role_date } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO groups (name, description, owner_email, role_date) VALUES (?, ?, ?, ?)",
      [name, description, owner_email, role_date]
    );
    res.status(201).json({ id: result.insertId, name, description, owner_email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar grupo
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM groups WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
