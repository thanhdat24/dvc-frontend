// /api/dossiers.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const { API_DAT, API_SAU } = process.env;
  if (!API_DAT || !API_SAU) {
    return res.status(500).json({ error: "API_DAT/API_SAU not configured in env" });
  }

  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const fetchOne = async (url) => {
    const r = await fetch(url, {
      method: "GET",
      headers: { Authorization: authHeader },
    });
    const rawText = await r.text();

    if (!r.ok) {
      return { ok: false, status: r.status, body: rawText?.slice(0, 500) || null };
    }

    try {
      return { ok: true, status: 200, data: JSON.parse(rawText) };
    } catch (e) {
      return { ok: false, status: 502, body: rawText?.slice(0, 500) || null };
    }
  };

  try {
    const [datRes, sauRes] = await Promise.all([fetchOne(API_DAT), fetchOne(API_SAU)]);

    // Nếu 1 trong 2 bị 401/403 thì báo unauthorized để FE hiển thị cảnh báo
    const unauthorized =
      (!datRes.ok && (datRes.status === 401 || datRes.status === 403)) ||
      (!sauRes.ok && (sauRes.status === 401 || sauRes.status === 403));

    // Normalize giống logic FE của bạn: ưu tiên array hoặc .content
    const toList = (x) => {
      if (!x) return [];
      if (Array.isArray(x)) return x;
      if (Array.isArray(x.content)) return x.content;
      return [];
    };

    // Nếu token sai -> trả 401 để FE bắt nhanh
    if (unauthorized) {
      return res.status(401).json({ error: "Unauthorized", unauthorized: true, dat: [], sau: [] });
    }

    // Nếu có lỗi khác thì vẫn trả 200 nhưng kèm flags (FE vẫn render được)
    return res.status(200).json({
      unauthorized: false,
      dat: datRes.ok ? toList(datRes.data) : [],
      sau: sauRes.ok ? toList(sauRes.data) : [],
      errors: {
        dat: datRes.ok ? null : { status: datRes.status, body: datRes.body },
        sau: sauRes.ok ? null : { status: sauRes.status, body: sauRes.body },
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal error calling APIs",
      message: err.message,
    });
  }
}
