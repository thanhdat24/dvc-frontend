import { API_DAT, API_SAU } from '../constants';
import { DossierItem, FetchResult } from '../types';

// Gọi Vercel backend, truyền token người dùng
const doFetch = async (url: string, token: string): Promise<DossierItem[]> => {
  if (!token) {
    throw new Error('Vui lòng nhập Token (F12) trước khi tra cứu.');
  }

  const authHeader = token.toLowerCase().startsWith('bearer ')
    ? token
    : `Bearer ${token}`;

  console.log(`Fetching backend: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      // Backend Vercel sẽ đọc header này và forward sang apidvc
      Authorization: authHeader,
    },
  });

  // Token sai / hết hạn
  if (response.status === 401 || response.status === 403) {
    throw new Error('TOKEN_INVALID');
  }

  if (!response.ok) {
    throw new Error(`HTTP_ERROR_${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    console.warn(
      `Invalid content type from backend (${url}):`,
      text.substring(0, 100),
    );
    throw new Error('INVALID_JSON');
  }

  const data = await response.json();

  // Normalize dữ liệu trả về từ backend
  if (data && Array.isArray(data.content)) {
    return data.content;
  }
  if (Array.isArray(data)) {
    return data;
  }

  throw new Error('INVALID_STRUCTURE');
};

const fetchSingleList = async (
  url: string,
  token: string,
): Promise<DossierItem[]> => {
  try {
    return await doFetch(url, token);
  } catch (error: any) {
    if (error?.message === 'TOKEN_INVALID') {
      throw new Error(
        'Token không hợp lệ hoặc đã hết hạn. Vui lòng lấy token mới (F12).',
      );
    }
    throw error;
  }
};

export const fetchAllDossiers = async (token: string): Promise<FetchResult> => {
  try {
    // Gọi 2 API backend song song
    const [datData, sauData] = await Promise.all([
      fetchSingleList(API_DAT, token),
      fetchSingleList(API_SAU, token),
    ]);

    return {
      dat: datData,
      sau: sauData,
    };
  } catch (error) {
    let msg = 'Lỗi không xác định.';
    if (error instanceof Error) {
      msg = error.message;

      if (msg.includes('Failed to fetch') || msg.startsWith('HTTP_ERROR')) {
        msg =
          'Không thể kết nối đến Server. Vui lòng kiểm tra lại đường dẫn API hoặc Token.';
      }

      if (msg === 'INVALID_JSON' || msg === 'INVALID_STRUCTURE') {
        msg = 'Dữ liệu trả về từ Server không đúng định dạng.';
      }
    }

    return {
      dat: [],
      sau: [],
      error: msg,
    };
  }
};
