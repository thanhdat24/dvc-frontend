import React, { useState } from "react";
import { CheckCircle, Lock, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  error?: string;
  onClose?: () => void; // optional (nếu bạn muốn cho đóng)
  onLogin: (username: string, password: string) => Promise<void>;
};

const LoginModal: React.FC<Props> = ({ isOpen, isLoading, error, onClose, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Đăng nhập</h2>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Nhập tài khoản được admin cấp để sử dụng hệ thống.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="vd: dvc"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="••••••••"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) onLogin(username, password);
              }}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => onLogin(username, password)}
            disabled={isLoading || !username.trim() || !password.trim()}
            className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          * Phiên đăng nhập được lưu bằng cookie (không lưu mật khẩu trên máy).
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
