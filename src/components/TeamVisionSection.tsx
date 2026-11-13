import React from 'react';
import { ExternalLink, FileDown, Share2 } from 'lucide-react';
import {
  CODEX_TEAM,
  CODEX_VISION_PILLARS,
  SOCIAL_PROFILES,
} from '../data/mockProperties';

interface TeamVisionSectionProps {
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
}

export const TeamVisionSection: React.FC<TeamVisionSectionProps> = ({
  onDownloadPdf,
  isGeneratingPdf,
}) => {
  return (
    <section id="codex-team" className="py-16 lg:py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CODEX Vision Header + PDF CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-14 border-b border-slate-200">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold text-blue-700 mb-2">
              04. من صناعة شركة CODEX · الرؤية التقنية والفريق
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              هندسة عقارية ثلاثية الأبعاد بتوقيع CODEX
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              طور فريق CODEX منصة أركان العقارية لتكون نموذجاً عملياً للتحول الرقمي في القطاع
              العقاري: مجسمات معمارية تفاعلية تعمل بسرعة عالية داخل المتصفح، تزامن فوري لحالة
              المخزون، وتعاقد إلكتروني موثق بدون تعقيد.
            </p>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                الملف التعريفي للشركة والمنصة (PDF)
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                حمّل نسخة كاملة بصيغة PDF تتضمن الرؤية التقنية لشركة CODEX، مؤشرات المحفظة
                العقارية، وملخص الوحدات المتاحة.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
              >
                <FileDown className="w-4 h-4" />
                <span>{isGeneratingPdf ? 'جاري إنشاء الملف...' : 'تحميل ملف الشركة PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Technical Vision Pillars (Editorial Numbering) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-b border-slate-200">
          {CODEX_VISION_PILLARS.map((pillar) => (
            <div key={pillar.index} className="bg-white border border-slate-200 rounded-xl p-6">
              <span className="font-mono-nums text-xs font-bold text-blue-700">
                {pillar.index}
              </span>
              <h3 className="mt-2 font-display text-base font-bold text-slate-900">
                {pillar.title}
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>

        {/* CODEX Engineering Team */}
        <div className="pt-12">
          <h3 className="font-display text-xl font-bold text-slate-900 mb-6">
            فريق التطوير والعمارة الرقمية — CODEX
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CODEX_TEAM.map((member) => (
              <article
                key={member.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-square bg-slate-100 overflow-hidden flex items-center justify-center">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <span className="font-display text-3xl font-bold text-slate-700">
                        {member.initials}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-[11px] font-semibold text-blue-700">{member.specialty}</p>
                  <h4 className="mt-1 font-display text-base font-bold text-slate-900">
                    {member.name}
                  </h4>
                  <p className="text-xs font-medium text-slate-500">{member.role}</p>
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Official Social Media Profiles */}
        <div className="mt-12 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-700" />
              <h3 className="font-display text-base font-bold text-slate-900">
                حسابات أركان و CODEX على منصات التواصل الاجتماعي
              </h3>
            </div>
            <span className="text-xs text-slate-500">تواصل مباشر مع فريقنا التقني والمبيعات</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {SOCIAL_PROFILES.map((profile) => (
              <a
                key={profile.id}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-sm border border-slate-200 rounded-lg transition-all duration-150"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{profile.name}</p>
                  <p className="text-[11px] font-mono-nums text-slate-500 truncate" dir="ltr">
                    {profile.handle}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
