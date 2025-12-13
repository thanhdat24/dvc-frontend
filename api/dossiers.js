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

  // ---- helpers ----
  const toList = (x) => {
    if (!x) return [];
    if (Array.isArray(x)) return x;
    if (Array.isArray(x.content)) return x.content;
    return [];
  };

  const fetchWithTimeout = async (url, timeoutMs = 25000) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const r = await fetch(url, {
        method: "GET",
        headers: { Authorization: authHeader },
        signal: controller.signal,
      });

      const raw = await r.text();

      if (!r.ok) {
        return { ok: false, status: r.status, raw: raw?.slice(0, 300) || null };
      }

      try {
        const data = JSON.parse(raw);
        return { ok: true, status: 200, data };
      } catch {
        return { ok: false, status: 502, raw: raw?.slice(0, 300) || null };
      }
    } catch (e) {
      // AbortError or network errors
      return { ok: false, status: 599, raw: String(e?.message || e) };
    } finally {
      clearTimeout(t);
    }
  };

  try {
    // chạy song song nhưng không để 1 cái fail làm fail hết
    const [datSettle, sauSettle] = await Promise.allSettled([
      fetchWithTimeout(API_DAT, 25000),
      fetchWithTimeout(API_SAU, 25000),
    ]);

    const datRes = datSettle.status === "fulfilled" ? datSettle.value : { ok: false, status: 599 };
    const sauRes = sauSettle.status === "fulfilled" ? sauSettle.value : { ok: false, status: 599 };

    const unauthorized =
      (!datRes.ok && (datRes.status === 401 || datRes.status === 403)) ||
      (!sauRes.ok && (sauRes.status === 401 || sauRes.status === 403));

    if (unauthorized) {
      return res.status(401).json({ unauthorized: true, dat: [], sau: [] });
    }

    // Trả dữ liệu cái nào OK thì trả, cái nào lỗi thì []
    return res.status(200).json({
      unauthorized: false,
      dat: datRes.ok ? toList(datRes.data) : [],
      sau: sauRes.ok ? toList(sauRes.data) : [],
      // để FE biết cái nào lỗi (optional)
      errors: {
        dat: datRes.ok ? null : { status: datRes.status },
        sau: sauRes.ok ? null : { status: sauRes.status },
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal error calling APIs",
      message: err?.message || String(err),
    });
  }
}
