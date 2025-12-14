import { getDb } from "../_db.js";
import jwt from "jsonwebtoken";
import { compare } from "bcryptjs";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Missing username/password" });

  const db = await getDb();
  const users = db.collection("users");

  const user = await users.findOne({ username });
  if (!user) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const ok = await compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const payload = { id: String(user._id), username: user.username };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

  return res.status(200).json({ token });
}
