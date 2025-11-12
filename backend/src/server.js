import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ---- Rotas de exemplo ----

// Grupos
app.get("/api/groups", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM groups ORDER BY created_at DESC");
  res.json(rows);
});

app.post("/api/groups", async (req, res) => {
  const { name, description, owner_email } = req.body;
  if (!name || !owner_email)
    return res.status(400).json({ error: "Nome e e-mail do dono são obrigatórios" });

  const [result] = await db.query(
    "INSERT INTO groups (name, description, owner_email) VALUES (?, ?, ?)",
    [name, description || null, owner_email]
  );
  res.json({ id: result.insertId });
});

// Membros
app.get("/api/groups/:id/members", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM group_members WHERE group_id = ?", [req.params.id]);
  res.json(rows);
});

app.post("/api/groups/:id/members", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "E-mail obrigatório" });
  await db.query("INSERT IGNORE INTO group_members (group_id, email) VALUES (?, ?)", [
    req.params.id,
    email
  ]);
  res.json({ ok: true });
});

// Despesas
app.get("/api/groups/:id/expenses", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM expenses WHERE group_id = ?", [req.params.id]);
  res.json(rows);
});

app.post("/api/groups/:id/expenses", async (req, res) => {
  const {
    title,
    amount,
    buyer,
    payer,
    split,
    category,
    subcategory,
    date_iso,
    paid
  } = req.body;
  const [result] = await db.query(
    "INSERT INTO expenses (group_id, title, amount, buyer, payer, split, category, subcategory, date_iso, paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [req.params.id, title, amount, buyer, payer, split, category, subcategory, date_iso, paid]
  );
  res.json({ id: result.insertId });
});

// Status
app.get("/", (req, res) => res.send("✅ API do AcertÔ rodando com MySQL!"));

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
