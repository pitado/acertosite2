import express from "express";
import cors from "cors";
import { db } from "./db.js";
import groupsRouter from "./routes/groups.js";
import expensesRouter from "./routes/expenses.js";
import membersRouter from "./routes/members.js";

const app = express();
app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/health", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS now");
    res.json({ ok: true, db_time: rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Conectar rotas
app.use("/groups", groupsRouter);
app.use("/expenses", expensesRouter);
app.use("/members", membersRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend rodando na porta ${PORT}`));
