require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

const db = mysql
  .createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "expense_tracker",
  })
  .promise();


function requireLogin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Please login first" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired. Please login again." });
  }
}

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));


app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const hash = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash]);
    res.json({ message: "Registered successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This email is already registered" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: rows[0].id, email: rows[0].email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({
      message: "Login successful",
      token,
      userId: rows[0].id,
      email: rows[0].email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/budget/:userId", requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT amount FROM budgets WHERE user_id = ?", [req.userId]);
    res.json({ amount: rows.length ? rows[0].amount : 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/budget", requireLogin, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!(Number(amount) > 0)) {
      return res.status(400).json({ message: "Please enter a valid budget" });
    }
    await db.query(
      "INSERT INTO budgets (user_id, amount) VALUES (?, ?) ON DUPLICATE KEY UPDATE amount = ?",
      [req.userId, amount, amount]
    );
    res.json({ message: "Budget saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/transaction", requireLogin, async (req, res) => {
  try {
    const { type, title, amount, category, date } = req.body;
    if (!(["income", "expense"].includes(type) && title && Number(amount) > 0)) {
      return res.status(400).json({ message: "Please fill in all details" });
    }
    await db.query(
      "INSERT INTO transactions (user_id, type, title, amount, category, date) VALUES (?, ?, ?, ?, ?, ?)",
      [req.userId, type, title, amount, category || null, date]
    );
    res.json({ message: "Transaction saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/transactions/:userId", requireLogin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.delete("/transaction/:id", requireLogin, async (req, res) => {
  try {
    await db.query("DELETE FROM transactions WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.userId,
    ]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running: http://localhost:3000");
});