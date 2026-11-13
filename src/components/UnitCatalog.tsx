import React, { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  GitCompareArrows,
  Lock,
  MapPin,
  PlusCircle,
  Search,
  X,
} from 'lucide-react';
import { ListingType, PropertyUnit, UnitCategory } from '../types/realEstate';
import { EGYPT_REGIONS, formatCurrency } from '../data/mockProperties';

interface UnitCatalogProps {
  units: PropertyUnit[];
  selectedUnitId: string;
  compareIds: string[];
  onSelectUnit: (unit: PropertyUnit) => void;
  onOpenDetails: (unit: PropertyUnit) => void;
  onLaunchTour: (unit: PropertyUnit) => void;
  onOpenBooking: (unit: PropertyUnit) => void;
  onToggleCompare: (unitId: string) => void;
  onOpenComparisonModal: () => void;
  onClearCompare: () => void;
  onOpenSellProperty: () => void;
}

export const UnitCatalog: React.FC<UnitCatalogProps> = ({
  units,
  selectedUnitId,
  compareIds,
  onSelectUnit,
  onOpenDetails,
  onLaunchTour,
  onOpenBooking,
  onToggleCompare,
  onOpenComparisonModal,
  onClearCompare,
  onOpenSellProperty,
}) => {
  const [listingFilter, setListingFilter] = useState<'الكل' | ListingType>('الكل');
  const [categoryFilter, setCategoryFilter] = useState<'الكل' | UnitCategory>('الكل');
  const [regionFilter, setRegionFilter] = useState<string>('الكل');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    EGYPT_REGIONS.forEach((r) => set.add(r.city));
    units.forEach((u) => set.add(u.city));
    return Array.from(set);
  }, [units]);

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (listingFilter !== 'الكل' && u.listingType !== listingFilter) return false;
      if (categoryFilter !== 'الكل' && u.category !== categoryFilter) return false;
      if (regionFilter !== 'الكل' && u.city !== regionFilter) return false;
      if (onlyAvailable && u.status !== 'متاح') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${u.title} ${u.city} ${u.district} ${u.code} ${u.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [units, listingFilter, categoryFilter, regionFilter, onlyAvailable, searchQuery]);

  const categories: ('الكل' | UnitCategory)[] = [
    'الكل',
    'شقة ذكية',
    'بنتهاوس',
    'دوبلكس',
    'فيلا مستقلة',
  ];

  const comparedUnits = units.filter((u) => compareIds.includes(u.id));

  return (
    <section id="units" className="py-16 lg:py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-blue-700 mb-2">
              01. كتالوج الوحدات السكنية · {EGYPT_REGIONS.length} منطقة في مصر
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              استكشف وقارن الوحدات المتاحة في أنحاء مصر
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              اضغط على أي عقار لعرض تفاصيله الكاملة، أو اختر وحدتين للمقارنة جنباً إلى جنب، أو
              اعرض عقارك للبيع مباشرة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenSellProperty}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>اعرض عقارك للبيع</span>
            </button>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['الكل', 'للبيع', 'للإيجار'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setListingFilter(tab)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    listingFilter === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {tab === 'الكل' ? 'جميع العروض' : tab}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOnlyAvailable((v) => !v)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all duration-150 cursor-pointer whitespace-nowrap ${
                onlyAvailable
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              المتاح فقط
            </button>
          </div>
        </div>

        {/* Region Filter, Category Tabs & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat === 'الكل' ? 'كل الأنواع' : cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-blue-700 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                aria-label="تصفية حسب المنطقة في مصر"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full sm:w-52 pr-8 pl-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-700 focus:outline-none cursor-pointer"
              >
                <option value="الكل">كل المناطق ({EGYPT_REGIONS.length} منطقة في مصر)</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالحي أو اسم العقار..."
                className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Units Grid */}
        {filteredUnits.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 border border-slate-200 rounded-xl">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900">لا توجد وحدات مطابقة للبحث الحالي</p>
            <p className="text-xs text-slate-500 mt-1">جرّب اختيار منطقة أخرى أو مسح الفلاتر.</p>
            <button
              type="button"
              onClick={() => {
                setListingFilter('الكل');
                setCategoryFilter('الكل');
                setRegionFilter('الكل');
                setOnlyAvailable(false);
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-all"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map((unit) => {
              const isSelected = unit.id === selectedUnitId;
              const isCompared = compareIds.includes(unit.id);
              return (
                <article
                  key={unit.id}
                  onClick={() => {
                    onSelectUnit(unit);
                    onOpenDetails(unit);
                  }}
                  className={`group bg-white border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col hover:shadow-lg hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-blue-700 ring-1 ring-blue-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* 4:3 Image Container */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={unit.image}
                      alt={unit.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute bottom-3 right-3 bg-white/95 border border-slate-200 px-2.5 py-1 rounded text-[11px] font-semibold text-slate-900">
                      {unit.listingType} · {unit.category}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompare(unit.id);
                      }}
                      className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-all duration-150 cursor-pointer ${
                        isCompared
                          ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                          : 'bg-white/95 text-slate-800 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900'
                      }`}
                    >
                      <GitCompareArrows className="w-3.5 h-3.5" />
                      <span>{isCompared ? 'مختار للمقارنة' : 'مقارنة'}</span>
                    </button>
                  </div>

                  {/* Card Body — Zero-Pill Metadata */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                      <span className="font-mono-nums text-slate-500">{unit.code}</span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          unit.status === 'متاح'
                            ? 'text-emerald-700'
                            : unit.status === 'محجوز'
                              ? 'text-amber-700'
                              : 'text-slate-500'
                        }`}
                      >
                        {unit.status === 'متاح' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : unit.status === 'محجوز' ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                        <span>{unit.status}</span>
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                      {unit.title}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span>{unit.city}</span>
                      <span aria-hidden="true">·</span>
                      <span>{unit.district}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{unit.areaSqm} م²</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{unit.bedrooms} غرف</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">طابق {unit.floor}</span>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {unit.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-baseline justify-between gap-2">
                      <div>
                        <span className="font-mono-nums text-lg font-bold text-slate-900">
                          {formatCurrency(unit.price)}
                        </span>
                        <span className="text-xs text-slate-500 mr-1">
                          ج.م {unit.listingType === 'للإيجار' ? '/ سنوياً' : ''}
                        </span>
                      </div>
                      <span className="text-[11px] text-blue-700 font-medium">عرض التفاصيل ←</span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUnit(unit);
                          onLaunchTour(unit);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>جولة 3D</span>
                      </button>

                      <button
                        type="button"
                        disabled={unit.status !== 'متاح'}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenBooking(unit);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-150 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed bg-white border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:-translate-y-0.5 whitespace-nowrap"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{unit.status === 'متاح' ? 'شراء / حجز' : unit.status}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Comparison Bar when 1 or 2 units selected */}
      {comparedUnits.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(640px,92vw)] bg-white border border-slate-300 rounded-xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <GitCompareArrows className="w-4 h-4 text-blue-700 shrink-0" />
            <div className="text-xs min-w-0">
              <p className="font-bold text-slate-900 truncate">
                مقارنة الوحدات ({comparedUnits.length} / 2)
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {comparedUnits.map((u) => u.title).join('  ↔  ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={comparedUnits.length < 2}
              onClick={onOpenComparisonModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-45 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              {comparedUnits.length < 2 ? 'اختر وحدة ثانية' : 'عرض المقارنة الآن'}
            </button>
            <button
              type="button"
              onClick={onClearCompare}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="مسح المقارنة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
