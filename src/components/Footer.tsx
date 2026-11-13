import React from 'react';
import { FileDown } from 'lucide-react';
import { SOCIAL_PROFILES } from '../data/mockProperties';

interface FooterProps {
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onDownloadPdf, isGeneratingPdf }) => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
          <div>
            <p className="font-display text-lg font-bold text-slate-900">
              أركان العقارية · من صناعة CODEX
            </p>
            <p className="mt-1 text-xs text-slate-500">
              منصة عقارية تجريبية ثلاثية الأبعاد لعرض الوحدات، التجول الافتراضي، والحجز الإلكتروني.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <a href="#showcase-3d" className="hover:text-slate-900">
              المجسم 3D
            </a>
            <a href="#units" className="hover:text-slate-900">
              الوحدات
            </a>
            <a href="#admin-panel" className="hover:text-slate-900">
              لوحة التحكم
            </a>
            <a href="#smart-alerts" className="hover:text-slate-900">
              التنبيهات
            </a>
            <a href="#codex-team" className="hover:text-slate-900">
              فريق CODEX
            </a>
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:text-blue-800"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>تحميل الملف التعريفي PDF</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 أركان العقارية — جميع الحقوق محفوظة · تطوير شركة CODEX للأنظمة المكانية</p>
          <div className="flex flex-wrap items-center gap-4">
            {SOCIAL_PROFILES.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 transition-colors"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
