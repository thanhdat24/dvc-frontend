import React, { useState } from "react";
import { CheckCircle, KeyRound, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  error?: string;
  onClose?: () => void; // optional
  onSaveToken: (token: string) => Promise<void>;
};

const TokenModal: React.FC<Props> = ({ isOpen, isLoading, error, onClose, onSaveToken }) => {
  const [token, setToken] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Nhập Bearer Token</h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Token sẽ được lưu trên server (MongoDB) và dùng cho mọi thiết bị sau khi bạn đăng nhập.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bearer Token</label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono h-28 resize-none"
            placeholder="eyJhbGciOiJIUzI1NiIsIn..."
          />
          <p className="mt-2 text-xs text-gray-500">
            Nếu token hết hạn, hệ thống sẽ yêu cầu bạn nhập token mới.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => onSaveToken(token)}
            disabled={isLoading || !token.trim()}
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isLoading ? "Đang lưu..." : "Lưu token"}
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          * Token được mã hoá trước khi lưu DB. Không lưu trên localStorage.
        </p>
      </div>
    </div>
  );
};

export default TokenModal;
