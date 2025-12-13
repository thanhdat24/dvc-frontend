export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const { API_DAT, API_SAU } = process.env;
  if (!API_DAT || !API_SAU) return res.status(500).json({ error: "API_DAT/API_SAU not configured in env" });

  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const fetchOne = async (url) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 9000);
    try {
      const r = await fetch(url, { method: "GET", headers: { Authorization: authHeader }, signal: controller.signal });
      const raw = await r.text();
      if (!r.ok) return { ok: false, status: r.status, raw: raw?.slice(0, 500) || null };
      try {
        return { ok: true, status: 200, data: JSON.parse(raw) };
      } catch {
        return { ok: false, status: 502, raw: raw?.slice(0, 500) || null };
      }
    } finally {
      clearTimeout(t);
    }
  };

  const toList = (x) => {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    if (Array.isArray(x.content)) return x.content;
    return [];
  };

  try {
    const [datRes, sauRes] = await Promise.all([fetchOne(API_DAT), fetchOne(API_SAU)]);

    const unauthorized =
      (!datRes.ok && (datRes.status === 401 || datRes.status === 403)) ||
      (!sauRes.ok && (sauRes.status === 401 || sauRes.status === 403));

    if (unauthorized) {
      return res.status(401).json({ unauthorized: true, dat: [], sau: [] });
    }

    return res.status(200).json({
      unauthorized: false,
      dat: datRes.ok ? toList(datRes.data) : [],
      sau: sauRes.ok ? toList(sauRes.data) : [],
      // optional: để debug
      errors: {
        dat: datRes.ok ? null : { status: datRes.status },
        sau: sauRes.ok ? null : { status: sauRes.status },
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal error calling APIs", message: err.message });
  }
}
