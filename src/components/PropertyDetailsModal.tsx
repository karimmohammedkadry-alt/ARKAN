import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  GitCompareArrows,
  Lock,
  MapPin,
  X,
} from 'lucide-react';
import { PropertyUnit } from '../types/realEstate';
import { formatCurrency } from '../data/mockProperties';

interface PropertyDetailsModalProps {
  unit: PropertyUnit | null;
  isCompared: boolean;
  onClose: () => void;
  onLaunchTour: (unit: PropertyUnit) => void;
  onOpenBooking: (unit: PropertyUnit) => void;
  onToggleCompare: (unitId: string) => void;
}

const VARIANT_LABELS: Record<PropertyUnit['modelVariant'], string> = {
  penthouse: 'تصميم بنتهاوس مزدوج الارتفاع بسقف زجاجي وتراس لا متناهي',
  villa: 'تصميم فيلا أرضية بحديقة خاصة وأشجار زيتون ومسبح خارجي',
  duplex: 'تصميم دوبلكس بسلم معماري عائم وميزانين علوي مفتوح',
  apartment: 'تصميم شقة ذكية عصرية بنوافذ بانورامية وشرفة مدينة',
};

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  unit,
  isCompared,
  onClose,
  onLaunchTour,
  onOpenBooking,
  onToggleCompare,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!unit) return null;

  const photos = unit.gallery && unit.gallery.length > 0 ? unit.gallery : [unit.image];
  const activePhoto = photos[activePhotoIdx] || unit.image;
  const pricePerSqm = Math.round(unit.price / Math.max(unit.areaSqm, 1));

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`تفاصيل ${unit.title}`}
    >
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl my-auto">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono-nums">{unit.code}</span>
              <span aria-hidden="true">·</span>
              <span>{unit.category}</span>
              <span aria-hidden="true">·</span>
              <span>{unit.listingType}</span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 truncate">
              {unit.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-150 cursor-pointer"
            aria-label="إغلاق التفاصيل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[82vh] overflow-y-auto">
          {/* Gallery Column */}
          <div className="lg:col-span-6 p-6 bg-slate-50 border-b lg:border-b-0 lg:border-l border-slate-200 flex flex-col gap-3">
            <div className="aspect-[4/3] bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={activePhoto}
                alt={unit.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {photos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {photos.map((src, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      idx === activePhotoIdx
                        ? 'border-blue-700 scale-[1.02]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${unit.title} ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-900 mb-1">نمط المعاينة ثلاثية الأبعاد:</p>
              <p>{VARIANT_LABELS[unit.modelVariant]}</p>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-6 p-6 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">السعر المطلوب</p>
                  <p className="font-mono-nums text-2xl font-bold text-slate-900">
                    {formatCurrency(unit.price)}{' '}
                    <span className="text-sm font-normal text-slate-600">
                      ج.م {unit.listingType === 'للإيجار' ? '/ سنوياً' : ''}
                    </span>
                  </p>
                  <p className="font-mono-nums text-xs text-slate-500 mt-0.5">
                    سعر المتر: {formatCurrency(pricePerSqm)} ج.م/م²
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    unit.status === 'متاح'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : unit.status === 'محجوز'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {unit.status === 'متاح' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : unit.status === 'محجوز' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{unit.status}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  {unit.city} — {unit.district} · {unit.wing}
                </span>
              </div>

              {/* Tabular Spec Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-2">
                  <p className="font-mono-nums text-base font-bold text-slate-900">
                    {unit.areaSqm} م²
                  </p>
                  <p className="text-[11px] text-slate-500">المساحة</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-2">
                  <p className="font-mono-nums text-base font-bold text-slate-900">
                    {unit.bedrooms}
                  </p>
                  <p className="text-[11px] text-slate-500">غرف النوم</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-2">
                  <p className="font-mono-nums text-base font-bold text-slate-900">
                    {unit.bathrooms}
                  </p>
                  <p className="text-[11px] text-slate-500">الحمامات</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-2">
                  <p className="font-mono-nums text-base font-bold text-slate-900">{unit.floor}</p>
                  <p className="text-[11px] text-slate-500">الطابق</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-1.5">وصف العقار</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {unit.description}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">المميزات والتجهيزات</h3>
                <ul className="grid grid-cols-2 gap-1.5 text-xs text-slate-700">
                  {unit.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons with Enhanced Hover */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLaunchTour(unit);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة 3D وتخصيص الألوان والأثاث</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleCompare(unit.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border rounded-lg transition-all duration-150 hover:-translate-y-0.5 cursor-pointer whitespace-nowrap ${
                  isCompared
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:shadow-sm'
                }`}
              >
                <GitCompareArrows className="w-4 h-4" />
                <span>{isCompared ? 'في المقارنة' : 'أضف للمقارنة'}</span>
              </button>

              {unit.status === 'متاح' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBooking(unit);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>شراء / حجز وتقديم طلب مراجعة</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
