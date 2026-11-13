import React, { useState } from 'react';
import { LogIn, ShieldCheck, UserPlus, X } from 'lucide-react';
import { UserAccount } from '../types/realEstate';

interface AuthModalProps {
  isOpen: boolean;
  reasonMessage?: string | null;
  onClose: () => void;
  onAuthenticated: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  reasonMessage,
  onClose,
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@') || password.trim().length < 4) {
      setError('يرجى إدخال بريد إلكتروني صحيح وكلمة مرور لا تقل عن 4 أحرف.');
      return;
    }
    if (mode === 'register' && name.trim().length < 2) {
      setError('يرجى إدخال الاسم الكامل لإتمام التسجيل.');
      return;
    }

    onAuthenticated({
      id: `usr-${Date.now()}`,
      name: mode === 'register' ? name.trim() : email.split('@')[0] || 'مستخدم أركان',
      email: email.trim(),
      phone: phone.trim() || '01000000000',
    });
  };

  const handleQuickDemoLogin = () => {
    onAuthenticated({
      id: 'usr-demo-1',
      name: 'كريم محمد',
      email: 'karim.demo@codex-arkan.eg',
      phone: '01012345678',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="تسجيل الدخول الاختياري"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h2 className="font-display text-base font-bold text-slate-900">
              {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            aria-label="إغلاق نافذة تسجيل الدخول"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {reasonMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
              {reasonMessage}
            </div>
          )}

          {/* Switch Mode */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              تسجيل دخول
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الثلاثي"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">رقم الموبايل</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full px-3 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                required
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all duration-150 cursor-pointer"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>دخول إلى الحساب</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء الحساب والمتابعة</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 hover:-translate-y-0.5 rounded-lg transition-all duration-150 cursor-pointer"
            >
              دخول تجريبي سريع (بدون كلمة مرور)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
