// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const groupsRouter = require("./routes/groups");
const expensesRouter = require("./routes/expenses");
const invitesRouter = require("./routes/invites");

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API AcertÔ rodando" });
});

// Rotas principais
app.use("/groups", groupsRouter);
app.use("/expenses", expensesRouter);
app.use("/invites", invitesRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ API AcertÔ ouvindo na porta ${PORT}`);
});
