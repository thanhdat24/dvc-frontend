import { FetchResult } from "../types";

export const fetchAllDossiers = async (): Promise<FetchResult & { needToken?: boolean }> => {
  try {
    const res = await fetch("/api/dossiers", {
      method: "GET",
      credentials: "include",
    });

    if (res.status === 401) {
      const j = await res.json().catch(() => ({}));
      return { dat: [], sau: [], error: "Cần nhập token hoặc token đã hết hạn.", unauthorized: true, ...(j || {}) };
    }

    if (!res.ok) {
      return { dat: [], sau: [], error: "Lỗi kết nối backend.", networkError: true };
    }

    const data = await res.json();
    return {
      dat: Array.isArray(data?.dat) ? data.dat : [],
      sau: Array.isArray(data?.sau) ? data.sau : [],
    };
  } catch {
    return { dat: [], sau: [], error: "Lỗi mạng.", networkError: true };
  }
};
