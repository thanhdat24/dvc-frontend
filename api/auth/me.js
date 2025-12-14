import { verifyAuth } from "../_auth.js";

export default function handler(req, res) {
  const user = verifyAuth(req);
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED" });

  return res.status(200).json({
    id: user.id,
    username: user.username,
  });
}
