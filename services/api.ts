import { API_ALL } from '../constants';
import { DossierItem, FetchResult } from '../types';

const toBearer = (token: string) => {
  const t = (token || '').trim();
  if (!t) return '';
  return t.toLowerCase().startsWith('bearer ') ? t : `Bearer ${t}`;
};

const normalize = (data: any): DossierItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
};

export const fetchAllDossiers = async (
  token: string,
  baseUrl: string = "",
  useMock: boolean = false
): Promise<FetchResult & { unauthorized?: boolean; networkError?: boolean }> => {
  // demo mode (optional)
  if (useMock) {
    return { dat: [], sau: [] };
  }

  const authHeader = toBearer(token);
  if (!authHeader) {
    return { dat: [], sau: [], error: 'Vui lòng nhập Token (F12) trước khi tra cứu.', unauthorized: true };
  }

  try {
    const cleanBase = (baseUrl || '').replace(/\/$/, '');
    const url = cleanBase ? `${cleanBase}${API_ALL}` : API_ALL;

    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: authHeader },
    });

    if (res.status === 401 || res.status === 403) {
      return {
        dat: [],
        sau: [],
        error: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng lấy token mới (F12).',
        unauthorized: true,
      };
    }

    if (!res.ok) {
      return {
        dat: [],
        sau: [],
        error: 'Không thể kết nối đến Server. Vui lòng kiểm tra lại đường dẫn API hoặc Token.',
        networkError: true,
      };
    }

    const data = await res.json().catch(() => null);

    return {
      dat: normalize(data?.dat),
      sau: normalize(data?.sau),
      unauthorized: !!data?.unauthorized,
    };
  } catch (error) {
    const isNetworkError = error instanceof TypeError || String((error as any)?.message || '').includes('Failed to fetch');
    return {
      dat: [],
      sau: [],
      error: 'Không thể kết nối đến Server. Vui lòng kiểm tra lại đường dẫn API hoặc Token.',
      networkError: isNetworkError,
    };
  }
};
