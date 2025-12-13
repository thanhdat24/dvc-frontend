import React, { useEffect, useMemo, useState } from 'react';
import DossierTable from './components/DossierTable';
import { fetchAllDossiers } from './services/api';
import { DossierItem } from './types';
import { DEFAULT_API_BASE_URL, ICONS } from './constants';
import {
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Lock,
  LayoutDashboard,
  Database,
  Server,
  Info,
  Globe,
  FileText,
} from 'lucide-react';

type FetchResult = {
  dat: DossierItem[];
  sau: DossierItem[];
  unauthorized?: boolean;
  networkError?: boolean;
  error?: string;
};

const App: React.FC = () => {
  // Settings
  const [token, setToken] = useState<string>(() => localStorage.getItem('BEARER_TOKEN') || '');
  const [useMock, setUseMock] = useState<boolean>(() => localStorage.getItem('USE_MOCK') === 'true');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('THEME');
    return saved ? saved === 'dark' : false;
  });

  // Data
  const [loading, setLoading] = useState(false);
  const [datData, setDatData] = useState<DossierItem[]>([]);
  const [sauData, setSauData] = useState<DossierItem[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // Status flags
  const [unauthorized, setUnauthorized] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Apply Theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('THEME', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('THEME', 'light');
    }
  }, [darkMode]);

  // Initial load
  useEffect(() => {
    if (token || useMock) {
      handleRefresh();
    } else {
      setShowSettings(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSettingsSave = (newToken: string, newMockMode: boolean) => {
    const cleanedToken = newToken.trim();

    setToken(cleanedToken);
    setUseMock(newMockMode);

    localStorage.setItem('BEARER_TOKEN', cleanedToken);
    localStorage.setItem('USE_MOCK', String(newMockMode));

    setShowSettings(false);

    // reset
    setUnauthorized(false);
    setNetworkError(false);
    setErrorMsg('');

    setTimeout(() => handleRefresh(cleanedToken, newMockMode), 100);
  };

  const handleRefresh = async (currentToken: string = token, currentMock: boolean = useMock) => {
    if (!currentToken && !currentMock) return;

    setLoading(true);
    setErrorMsg('');
    setUnauthorized(false);
    setNetworkError(false);

    // optional: clear old data when loading
    setDatData([]);
    setSauData([]);
    setHasFetched(false);

    const result: FetchResult = await fetchAllDossiers(currentToken, DEFAULT_API_BASE_URL, currentMock);

    if (result?.unauthorized) setUnauthorized(true);
    if (result?.networkError) setNetworkError(true);

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      setDatData(result.dat || []);
      setSauData(result.sau || []);
    }

    setHasFetched(true);
    setLoading(false);
  };

  const totalDat = useMemo(() => datData.length, [datData]);
  const totalSau = useMemo(() => sauData.length, [sauData]);
  const totalAll = useMemo(() => totalDat + totalSau, [totalDat, totalSau]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans pb-12 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Tra Cứu Hồ Sơ DVC</h1>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:hidden">DVC</h1>

            {useMock && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-bold border border-yellow-200 dark:border-yellow-800">
                DEMO MODE
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-xs text-gray-400 dark:text-gray-500">Trạng thái API</span>
              {unauthorized ? (
                <span className="text-xs font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                  <Lock size={10} /> 401 Unauthorized
                </span>
              ) : networkError ? (
                <span className="text-xs font-bold text-orange-500 dark:text-orange-400 flex items-center gap-1">
                  <Globe size={10} /> Lỗi Kết Nối
                </span>
              ) : errorMsg ? (
                <span className="text-xs font-bold text-orange-500 dark:text-orange-400">Lỗi dữ liệu</span>
              ) : loading ? (
                <span className="text-xs font-bold text-blue-500 dark:text-blue-400">Đang tải...</span>
              ) : useMock ? (
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">Dữ liệu giả lập</span>
              ) : (
                <span className="text-xs font-bold text-green-500 dark:text-green-400">Sẵn sàng</span>
              )}
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
              {darkMode ? <ICONS.Sun className="w-5 h-5" /> : <ICONS.Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => handleRefresh()}
              disabled={loading || (!token && !useMock)}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                loading ? 'animate-spin text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              }`}
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Cấu hình</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Alerts */}
        {unauthorized && !useMock && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-bold">Lỗi Xác Thực (401)</h3>
                <p className="text-red-700 dark:text-red-200 text-sm mt-1">
                  Token hiện tại đã hết hạn hoặc không hợp lệ. Vui lòng cập nhật Bearer Token mới trong phần cấu hình.
                </p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                >
                  Cập nhật ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {networkError && !useMock && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-md shadow-sm">
            <div className="flex items-start">
              <Globe className="w-5 h-5 text-orange-500 dark:text-orange-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-orange-800 dark:text-orange-300 font-bold">Lỗi Kết Nối</h3>
                <p className="text-orange-700 dark:text-orange-200 text-sm mt-1">
                  Không thể kết nối tới Backend. Kiểm tra mạng hoặc đường dẫn API.
                </p>
                <button
                  onClick={() => handleSettingsSave(token, true)}
                  className="mt-3 text-sm font-bold text-orange-800 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-200 underline flex items-center gap-1"
                >
                  <Database className="w-4 h-4" /> Bật Chế độ Demo
                </button>
              </div>
            </div>
          </div>
        )}

        {errorMsg && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="flex items-start">
              <ICONS.AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-bold">Lỗi</h3>
                <p className="text-red-700 dark:text-red-200 text-sm mt-1">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* Global Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Tổng Hồ Sơ</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {useMock ? 'Dữ liệu giả lập (Demo)' : 'Tổng hợp từ API Đạt & Sáu'}
              </p>
            </div>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {loading ? '...' : totalAll.toLocaleString('vi-VN')}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 p-4 flex items-center gap-3 transition-colors">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">API Đạt</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{loading ? '...' : totalDat.toLocaleString('vi-VN')}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 p-4 flex items-center gap-3 transition-colors">
              <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30">
                <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">API Sáu</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{loading ? '...' : totalSau.toLocaleString('vi-VN')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-2 flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            <ICONS.Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang tải dữ liệu từ API Đạt & Sáu...</span>
          </div>
        )}

        {/* Tables */}
        {hasFetched && !loading && !errorMsg && (
          <div className="animate-fade-in space-y-8">
            <DossierTable title="Danh sách hồ sơ (API Đạt)" data={datData} />
            <DossierTable title="Danh sách hồ sơ (API Sáu)" data={sauData} />
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in flex flex-col max-h-[90vh] transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cấu hình hệ thống</h2>
              {(token || useMock) && (
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <span className="sr-only">Đóng</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="overflow-y-auto space-y-6 px-1 pb-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <Server className="w-5 h-5" />
                  <span className="font-semibold text-sm">Kết nối Backend</span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span>
                    API URL cố định: <strong className="font-mono text-gray-700 dark:text-gray-300">{DEFAULT_API_BASE_URL || '(same origin)'}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bearer Token</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono h-24 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                    defaultValue={token}
                    id="token-input"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Token được sử dụng để xác thực khi gọi API backend.
                  </p>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                    <Database className="w-5 h-5" />
                    <span className="font-semibold text-sm">Chế độ Demo</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="mock-toggle" defaultChecked={useMock} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bật chế độ này để test UI (không cần Token).
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => {
                  const tokenVal = (document.getElementById('token-input') as HTMLTextAreaElement).value;
                  const mockVal = (document.getElementById('mock-toggle') as HTMLInputElement).checked;
                  handleSettingsSave(tokenVal, mockVal);
                }}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;