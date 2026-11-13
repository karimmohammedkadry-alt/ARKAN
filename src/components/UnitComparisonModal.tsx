import React from 'react';
import { CheckCircle2, CreditCard, Eye, X } from 'lucide-react';
import { PropertyUnit } from '../types/realEstate';
import { formatCurrency } from '../data/mockProperties';

interface UnitComparisonModalProps {
  units: [PropertyUnit, PropertyUnit] | null;
  onClose: () => void;
  onLaunchTour: (unit: PropertyUnit) => void;
  onOpenBooking: (unit: PropertyUnit) => void;
}

export const UnitComparisonModal: React.FC<UnitComparisonModalProps> = ({
  units,
  onClose,
  onLaunchTour,
  onOpenBooking,
}) => {
  if (!units) return null;
  const [a, b] = units;

  const sqmPriceA = Math.round(a.price / Math.max(a.areaSqm, 1));
  const sqmPriceB = Math.round(b.price / Math.max(b.areaSqm, 1));

  const rows: Array<{
    label: string;
    valA: string;
    valB: string;
    highlight?: 'A' | 'B' | null;
  }> = [
    { label: 'المدينة والمنطقة', valA: `${a.city} · ${a.district}`, valB: `${b.city} · ${b.district}` },
    { label: 'نوع العقار والعرض', valA: `${a.category} (${a.listingType})`, valB: `${b.category} (${b.listingType})` },
    { label: 'الحالة الحالية', valA: a.status, valB: b.status },
    {
      label: 'السعر (ج.م)',
      valA: `${formatCurrency(a.price)} ج.م`,
      valB: `${formatCurrency(b.price)} ج.م`,
      highlight: a.price < b.price ? 'A' : b.price < a.price ? 'B' : null,
    },
    {
      label: 'المساحة الإجمالية',
      valA: `${a.areaSqm} م²`,
      valB: `${b.areaSqm} م²`,
      highlight: a.areaSqm > b.areaSqm ? 'A' : b.areaSqm > a.areaSqm ? 'B' : null,
    },
    {
      label: 'متوسط سعر المتر',
      valA: `${formatCurrency(sqmPriceA)} ج.م/م²`,
      valB: `${formatCurrency(sqmPriceB)} ج.م/م²`,
      highlight: sqmPriceA < sqmPriceB ? 'A' : sqmPriceB < sqmPriceA ? 'B' : null,
    },
    {
      label: 'عدد غرف النوم',
      valA: `${a.bedrooms} غرف`,
      valB: `${b.bedrooms} غرف`,
      highlight: a.bedrooms > b.bedrooms ? 'A' : b.bedrooms > a.bedrooms ? 'B' : null,
    },
    {
      label: 'عدد الحمامات',
      valA: `${a.bathrooms} حمامات`,
      valB: `${b.bathrooms} حمامات`,
    },
    {
      label: 'الطابق',
      valA: `طابق ${a.floor}`,
      valB: `طابق ${b.floor}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="مقارنة الوحدات السكنية"
    >
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl my-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              مقارنة المواصفات جنباً إلى جنب
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              يتم تمييز الأفضل سعراً أو الأكبر مساحة باللون الأزرق لسهولة القرار
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            aria-label="إغلاق المقارنة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Header Cards */}
          <div className="grid grid-cols-3 gap-4 pb-5 border-b border-slate-200 items-end">
            <div className="text-xs font-semibold text-slate-500">المواصفة / المعيار</div>
            {[a, b].map((u) => (
              <div key={u.id} className="space-y-2">
                <div className="aspect-[16/10] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={u.image}
                    alt={u.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-mono-nums text-[11px] text-slate-400">{u.code}</p>
                <h3 className="font-display text-sm font-bold text-slate-900 leading-snug">
                  {u.title}
                </h3>
              </div>
            ))}
          </div>

          {/* Specs Table Rows */}
          <div className="divide-y divide-slate-100">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-3 gap-4 py-3 text-xs items-center">
                <div className="font-semibold text-slate-600">{r.label}</div>
                <div
                  className={`font-mono-nums ${
                    r.highlight === 'A'
                      ? 'font-bold text-blue-700 bg-blue-50/70 px-2.5 py-1 rounded-md'
                      : 'text-slate-900'
                  }`}
                >
                  {r.valA}
                </div>
                <div
                  className={`font-mono-nums ${
                    r.highlight === 'B'
                      ? 'font-bold text-blue-700 bg-blue-50/70 px-2.5 py-1 rounded-md'
                      : 'text-slate-900'
                  }`}
                >
                  {r.valB}
                </div>
              </div>
            ))}

            {/* Features row */}
            <div className="grid grid-cols-3 gap-4 py-3.5 text-xs items-start">
              <div className="font-semibold text-slate-600">أبرز المميزات</div>
              {[a, b].map((u) => (
                <ul key={u.id} className="space-y-1 text-slate-700">
                  {u.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* Actions Row */}
          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-200">
            <div />
            {[a, b].map((u) => (
              <div key={u.id} className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLaunchTour(u);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all duration-150 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>جولة 3D</span>
                </button>
                {u.status === 'متاح' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBooking(u);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 hover:-translate-y-0.5 rounded-lg transition-all duration-150 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>شراء</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
