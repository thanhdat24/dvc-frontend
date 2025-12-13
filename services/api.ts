import { API_ALL, API_DAT, API_SAU, DEFAULT_API_BASE_URL } from '../constants';
import { DossierItem, FetchResult } from '../types';

// Helper: demo data
const getRandomCount = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const toBearer = (token: string) => {
  const t = (token || '').trim();
  if (!t) return '';
  return t.toLowerCase().startsWith('bearer ') ? t : `Bearer ${t}`;
};

type NormalizedList = DossierItem[];

const normalizeToList = async (response: Response, url: string): Promise<NormalizedList> => {
  const contentType = response.headers.get('content-type') || '';
  const rawText = await response.text();

  if (!contentType.includes('application/json')) {
    // backend đôi khi trả text/html khi lỗi
    throw new Error(`INVALID_JSON_${url}__${rawText.slice(0, 200)}`);
  }

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`INVALID_JSON_${url}__${rawText.slice(0, 200)}`);
  }

  // Normalize
  if (data && Array.isArray(data.content)) return data.content;
  if (Array.isArray(data)) return data;

  // Nếu backend gộp trả {dat:[], sau:[]}, hàm này không dùng
  throw new Error('INVALID_STRUCTURE');
};

const fetchList = async (url: string, authHeader: string): Promise<DossierItem[]> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: authHeader },
  });

  if (response.status === 401 || response.status === 403) {
    const err: any = new Error('TOKEN_INVALID');
    err.status = response.status;
    throw err;
  }

  if (!response.ok) {
    const err: any = new Error(`HTTP_ERROR_${response.status}`);
    err.status = response.status;
    throw err;
  }

  return normalizeToList(response, url);
};

/**
 * Fetch all dossiers:
 * - If useMock: return fake lists
 * - Else:
 *    1) Try API_ALL (aggregate) first (if exists)
 *    2) Fallback to Promise.all(API_DAT, API_SAU)
 */
export const fetchAllDossiers = async (
  token: string,
  baseUrl: string = DEFAULT_API_BASE_URL,
  useMock: boolean = false
): Promise<FetchResult & { unauthorized?: boolean; networkError?: boolean }> => {
  // DEMO MODE
  if (useMock) {
    await sleep(600 + Math.random() * 800);

    const makeFakeItem = (prefix: string, i: number): any => ({
      id: `${prefix}-${i + 1}`,
      soHoSo: `${prefix}-${1000 + i}`,
      trichYeu: `Hồ sơ demo ${prefix} #${i + 1}`,
      trangThai: ['Mới', 'Đang xử lý', 'Hoàn thành'][i % 3],
    });

    const datCount = getRandomCount(5, 25);
    const sauCount = getRandomCount(5, 25);

    return {
      dat: Array.from({ length: datCount }, (_, i) => makeFakeItem('DAT', i)),
      sau: Array.from({ length: sauCount }, (_, i) => makeFakeItem('SAU', i)),
    };
  }

  const authHeader = toBearer(token);
  if (!authHeader) {
    return {
      dat: [],
      sau: [],
      error: 'Vui lòng nhập Token (F12) trước khi tra cứu.',
      unauthorized: true,
    };
  }

  try {
    // baseUrl để tương thích với setup của bạn (nếu dùng same-origin thì baseUrl = "")
    // constants API_* đã build sẵn từ DEFAULT_API_BASE_URL, nhưng nếu bạn muốn override bằng baseUrl truyền vào:
    const cleanBase = (baseUrl || '').replace(/\/$/, '');
    const apiAll = cleanBase ? `${cleanBase}/api/dossiers` : API_ALL;
    const apiDat = cleanBase ? `${cleanBase}/api/dat` : API_DAT;
    const apiSau = cleanBase ? `${cleanBase}/api/sau` : API_SAU;

    // 1) Try aggregate endpoint first (fastest)
    try {
      const r = await fetch(apiAll, {
        method: 'GET',
        headers: { Authorization: authHeader },
      });

      if (r.status === 401 || r.status === 403) {
        return {
          dat: [],
          sau: [],
          error: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng lấy token mới (F12).',
          unauthorized: true,
        };
      }

      if (r.ok) {
        const data = await r.json().catch(() => null);
        // Expect { dat: [], sau: [] } from aggregate
        if (data && Array.isArray(data.dat) && Array.isArray(data.sau)) {
          return { dat: data.dat, sau: data.sau };
        }
        // Nếu không đúng format thì rơi xuống fallback
      }
      // nếu 404/500/format sai => fallback
    } catch {
      // network -> fallback
    }

    // 2) Fallback: call 2 endpoints in parallel
    const [datData, sauData] = await Promise.all([
      fetchList(apiDat, authHeader),
      fetchList(apiSau, authHeader),
    ]);

    return { dat: datData, sau: sauData };
  } catch (error: any) {
    // Unauthorized
    if (error?.message === 'TOKEN_INVALID') {
      return {
        dat: [],
        sau: [],
        error: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng lấy token mới (F12).',
        unauthorized: true,
      };
    }

    // Network errors
    const isNetworkError = error instanceof TypeError || String(error?.message || '').includes('Failed to fetch');

    // Format errors
    const msg = String(error?.message || '');

    if (msg.startsWith('INVALID_JSON') || msg === 'INVALID_STRUCTURE') {
      return {
        dat: [],
        sau: [],
        error: 'Dữ liệu trả về từ Server không đúng định dạng.',
        networkError: false,
      };
    }

    if (isNetworkError || msg.startsWith('HTTP_ERROR')) {
      return {
        dat: [],
        sau: [],
        error: 'Không thể kết nối đến Server. Vui lòng kiểm tra lại đường dẫn API hoặc Token.',
        networkError: true,
      };
    }

    return {
      dat: [],
      sau: [],
      error: 'Lỗi không xác định.',
    };
  }
};
