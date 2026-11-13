import React from 'react';
import { FileDown } from 'lucide-react';

interface NavbarProps {
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onDownloadPdf, isGeneratingPdf }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          أركان العقارية · CODEX
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#showcase-3d"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            المجسم ثلاثي الأبعاد
          </a>
          <a
            href="#units"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            الوحدات السكنية
          </a>
          <a
            href="#admin-panel"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            لوحة التحكم
          </a>
          <a
            href="#smart-alerts"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            التنبيهات الفورية
          </a>
          <a
            href="#codex-team"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            فريق CODEX
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileDown className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'جاري التجهيز...' : 'ملف الشركة PDF'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
