import React, { useState } from 'react';
import InputForm from './components/InputForm';
import DossierTable from './components/DossierTable';
import { fetchAllDossiers } from './services/api';
import { DossierItem } from './types';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [datData, setDatData] = useState<DossierItem[]>([]);
  const [sauData, setSauData] = useState<DossierItem[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  const handleFetch = async (token: string) => {
    setLoading(true);
    setError('');
    setDatData([]);
    setSauData([]);

    const result = await fetchAllDossiers(token);

    if (result.error) {
      setError(result.error);
    } else {
      setDatData(result.dat);
      setSauData(result.sau);
    }

    setHasFetched(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  D
                </div>
                <span className="text-xl font-bold text-gray-800 tracking-tight">
                  Tra Cứu Hồ Sơ DVC
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                v3.0 Vercel Backend
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Input Form */}
          <InputForm onFetch={handleFetch} isLoading={loading} />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-sm animate-fade-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ICONS.AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mt-6 flex items-center space-x-3 text-sm text-gray-600 animate-pulse">
              <ICONS.Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tải dữ liệu từ API Đạt & Sáu...</span>
            </div>
          )}

          {/* Data Tables */}
          {hasFetched && !loading && !error && (
            <div className="animate-fade-in space-y-8 mt-6">
              <DossierTable title="Danh sách hồ sơ (API Đạt)" data={datData} />
              <DossierTable title="Danh sách hồ sơ (API Sáu)" data={sauData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
