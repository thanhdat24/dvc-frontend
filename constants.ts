import {
  FileText,
  Key,
  Upload,
  ShieldCheck,
  AlertCircle,
  Terminal,
  Search,
  RefreshCw,
  WifiOff,
  Loader2
} from 'lucide-react';

/**
 * Nếu FE và BE chung 1 project Vercel: để "" (same-origin) => nhanh nhất, không CORS
 * Nếu FE và BE tách 2 project: để "https://dvc-backend.vercel.app"
 */
export const DEFAULT_API_BASE_URL = "https://dvc-backend.vercel.app";
// export const DEFAULT_API_BASE_URL = ""; // <-- dùng dòng này nếu FE+BE chung project

const cleanBase = DEFAULT_API_BASE_URL.replace(/\/$/, '');

// Các route backend
export const API_DAT = `${cleanBase}/api/dat`;
export const API_SAU = `${cleanBase}/api/sau`;

// (Tuỳ chọn - khuyên dùng) route gộp nếu bạn làm backend gộp 1 lần gọi
export const API_ALL = `${cleanBase}/api/dossiers`;

export const ICONS = {
  FileText,
  Key,
  Upload,
  ShieldCheck,
  AlertCircle,
  Terminal,
  Search,
  RefreshCw,
  WifiOff,
  Loader2
};
