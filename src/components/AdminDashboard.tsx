import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  Lock,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  ListingType,
  PropertyUnit,
  ReviewRequest,
  UnitCategory,
  UnitStatus,
} from '../types/realEstate';
import { EGYPT_REGIONS, formatCurrency } from '../data/mockProperties';
import towerImg from '../assets/images/property_tower_residence_1794608761673.jpg';
import penthouseImg from '../assets/images/property_penthouse_exterior_1794608760741.jpg';
import villaImg from '../assets/images/property_garden_villa_1794608762696.jpg';

interface AdminDashboardProps {
  units: PropertyUnit[];
  reviewRequests: ReviewRequest[];
  onUpdateUnitStatus: (unitId: string, status: UnitStatus) => void;
  onUpdateUnitListingType: (unitId: string, listingType: ListingType) => void;
  onUpdateUnitPrice: (unitId: string, newPrice: number) => void;
  onAddUnit: (newUnit: PropertyUnit) => void;
  onApproveReview: (requestId: string) => void;
  onRejectReview: (requestId: string) => void;
  onLaunchTour: (unit: PropertyUnit) => void;
  onResetDemo: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  units,
  reviewRequests,
  onUpdateUnitStatus,
  onUpdateUnitListingType,
  onUpdateUnitPrice,
  onAddUnit,
  onApproveReview,
  onRejectReview,
  onLaunchTour,
  onResetDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'units' | 'reviews'>('units');
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'الكل' | UnitStatus>('الكل');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState<string>('');

  // New Unit Form State
  const [title, setTitle] = useState('');
  const [regionId, setRegionId] = useState(EGYPT_REGIONS[0].id);
  const [category, setCategory] = useState<UnitCategory>('شقة ذكية');
  const [listingType, setListingType] = useState<ListingType>('للبيع');
  const [price, setPrice] = useState('6500000');
  const [areaSqm, setAreaSqm] = useState('190');
  const [bedrooms, setBedrooms] = useState('3');
  const [formNotice, setFormNotice] = useState<string | null>(null);

  const availableUnits = units.filter((u) => u.status === 'متاح').length;
  const pendingReviewsCount = reviewRequests.filter((r) => r.status === 'قيد المراجعة').length;
  const salePortfolioValue = units
    .filter((u) => u.listingType === 'للبيع')
    .reduce((sum, u) => sum + u.price, 0);

  const visibleUnits = units.filter((u) =>
    statusFilter === 'الكل' ? true : u.status === statusFilter
  );

  const handleSavePrice = (unitId: string) => {
    const num = Number(priceDraft);
    if (!Number.isNaN(num) && num > 0) {
      onUpdateUnitPrice(unitId, num);
    }
    setEditingPriceId(null);
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(price);
    const numericArea = Number(areaSqm);
    const numericBeds = Number(bedrooms);

    if (!title.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setFormNotice('يرجى إدخال اسم الوحدة وسعر صحيح.');
      return;
    }

    const region = EGYPT_REGIONS.find((r) => r.id === regionId) || EGYPT_REGIONS[0];
    const imageByCat =
      category === 'بنتهاوس'
        ? penthouseImg
        : category === 'فيلا مستقلة'
          ? villaImg
          : towerImg;

    const created: PropertyUnit = {
      id: `unit-${Date.now()}`,
      code: `EG-NEW-${units.length + 101}`,
      title: title.trim(),
      district: region.district,
      city: region.city,
      category,
      listingType,
      status: 'متاح',
      price: numericPrice,
      pricePeriod: listingType === 'للإيجار' ? 'سنوياً' : 'إجمالي',
      areaSqm: Number.isNaN(numericArea) || numericArea <= 0 ? 180 : numericArea,
      bedrooms: Number.isNaN(numericBeds) || numericBeds <= 0 ? 3 : numericBeds,
      bathrooms: Math.max(2, numericBeds),
      floor: category === 'فيلا مستقلة' ? 1 : 7,
      wing: category === 'فيلا مستقلة' ? 'الحي الشرقي للفلل' : 'البرج الشمالي',
      image: imageByCat,
      gallery: [imageByCat],
      description:
        'وحدة سكنية مضافة حديثاً عبر لوحة التحكم اللحظية مع جاهزية كاملة للجولة ثلاثية الأبعاد والحجز الإلكتروني.',
      features: ['جولة 3D تفاعلية', 'تعاقد إلكتروني فوري', 'تشطيب فاخر'],
      defaultFinish: 'marble',
      modelVariant:
        category === 'فيلا مستقلة'
          ? 'villa'
          : category === 'بنتهاوس'
            ? 'penthouse'
            : category === 'دوبلكس'
              ? 'duplex'
              : 'apartment',
      masterplanZone: category === 'فيلا مستقلة' ? 'villa-east' : 'tower',
      towerFloorIndex: units.length % 6,
      updatedAt: 'الآن',
    };

    onAddUnit(created);
    setTitle('');
    setShowAddForm(false);
    setFormNotice(null);
  };

  return (
    <section id="admin-panel" className="py-16 lg:py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-blue-700 mb-2">
              02. لوحة تحكم إدارة العقارات وطلبات المراجعة
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              إدارة لحظية للوحدات واعتماد طلبات البيع والشراء
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              حدّث حالة الوحدات أو راجع طلبات المستخدمين لبيع عقاراتهم أو شرائها واعتمد نشرها
              فوراً داخل الكتالوج والمجسم ثلاثي الأبعاد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('units');
                setShowAddForm((v) => !v);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'إلغاء الإضافة' : 'طرح وحدة جديدة'}</span>
            </button>
            <button
              type="button"
              onClick={onResetDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:-translate-y-0.5 rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط التجربة</span>
            </button>
          </div>
        </div>

        {/* 4-Column Tabular KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">إجمالي الوحدات (24 منطقة)</p>
            <p className="mt-2 font-mono-nums text-2xl font-bold text-slate-900">{units.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">وحدات متاحة الآن</p>
            <p className="mt-2 font-mono-nums text-2xl font-bold text-emerald-700">
              {availableUnits}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">طلبات بيع وشراء للمراجعة</p>
            <p className="mt-2 font-mono-nums text-2xl font-bold text-amber-700">
              {pendingReviewsCount} قيد المراجعة
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs text-slate-500">قيمة محفظة التمليك (ج.م)</p>
            <p className="mt-2 font-mono-nums text-xl sm:text-2xl font-bold text-slate-900">
              {formatCurrency(salePortfolioValue)}
            </p>
          </div>
        </div>

        {/* Workspace Mode Switcher */}
        <div className="flex items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('units')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'units'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>جدول الوحدات ({units.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>طلبات المراجعة — بيع وشراء ({reviewRequests.length})</span>
            </button>
          </div>
        </div>

        {/* Add New Unit Form */}
        {showAddForm && activeTab === 'units' && (
          <form
            onSubmit={handleCreateUnit}
            className="mb-8 bg-white border border-slate-200 rounded-xl p-6"
          >
            <h3 className="font-display text-base font-bold text-slate-900 mb-4">
              إضافة وحدة سكنية جديدة في مصر
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">اسم الوحدة</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: جناح التجمع الخامس"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">المنطقة</label>
                <select
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                >
                  {EGYPT_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">نوع الوحدة</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as UnitCategory)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                >
                  <option value="شقة ذكية">شقة ذكية</option>
                  <option value="بنتهاوس">بنتهاوس</option>
                  <option value="دوبلكس">دوبلكس</option>
                  <option value="فيلا مستقلة">فيلا مستقلة</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">نوع العرض</label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value as ListingType)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                >
                  <option value="للبيع">للبيع</option>
                  <option value="للإيجار">للإيجار</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  السعر (ج.م)
                </label>
                <input
                  type="number"
                  min={10000}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">المساحة (م²)</label>
                <input
                  type="number"
                  min={50}
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">عدد الغرف</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>
            {formNotice && <p className="mt-3 text-xs text-red-600">{formNotice}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 cursor-pointer"
              >
                حفظ ونشر الوحدة فوراً
              </button>
            </div>
          </form>
        )}

        {activeTab === 'units' ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <SlidersHorizontal className="w-4 h-4 text-blue-700" />
                <span>جدول التحكم المباشر بالوحدات</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['الكل', 'متاح', 'محجوز', 'مباع'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-right border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-4">الرمز</th>
                    <th className="py-3 px-4">الوحدة والموقع</th>
                    <th className="py-3 px-4">المساحة</th>
                    <th className="py-3 px-4">نوع العرض</th>
                    <th className="py-3 px-4">السعر (ج.م)</th>
                    <th className="py-3 px-4">الحالة اللحظية</th>
                    <th className="py-3 px-4">معاينة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {visibleUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono-nums text-slate-500 whitespace-nowrap">
                        {unit.code}
                      </td>
                      <td className="py-2.5 px-4">
                        <p className="font-semibold text-slate-900">{unit.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {unit.city} · {unit.district} · {unit.category}
                        </p>
                      </td>
                      <td className="py-2.5 px-4 font-mono-nums text-slate-700 whitespace-nowrap">
                        {unit.areaSqm} م²
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <select
                          aria-label={`تغيير نوع عرض ${unit.title}`}
                          value={unit.listingType}
                          onChange={(e) =>
                            onUpdateUnitListingType(unit.id, e.target.value as ListingType)
                          }
                          className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:border-blue-700 focus:outline-none cursor-pointer"
                        >
                          <option value="للبيع">للبيع</option>
                          <option value="للإيجار">للإيجار</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4 font-mono-nums whitespace-nowrap">
                        {editingPriceId === unit.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={priceDraft}
                              onChange={(e) => setPriceDraft(e.target.value)}
                              className="w-28 px-2 py-1 text-xs border border-blue-700 rounded bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(unit.id)}
                              className="px-2 py-1 text-[11px] font-semibold bg-blue-700 text-white rounded cursor-pointer"
                            >
                              حفظ
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPriceId(unit.id);
                              setPriceDraft(String(unit.price));
                            }}
                            className="font-semibold text-slate-900 hover:text-blue-700 underline decoration-dotted underline-offset-4 cursor-pointer"
                            title="اضغط لتعديل السعر لحظياً"
                          >
                            {formatCurrency(unit.price)}
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {unit.status === 'متاح' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          ) : unit.status === 'محجوز' ? (
                            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <select
                            aria-label={`تحديث حالة ${unit.title}`}
                            value={unit.status}
                            onChange={(e) =>
                              onUpdateUnitStatus(unit.id, e.target.value as UnitStatus)
                            }
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border focus:outline-none cursor-pointer ${
                              unit.status === 'متاح'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : unit.status === 'محجوز'
                                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                                  : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            <option value="متاح">متاح</option>
                            <option value="محجوز">محجوز</option>
                            <option value="مباع">مباع</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onLaunchTour(unit)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>3D</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Review Requests Queue (Sell & Buy) */
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            {reviewRequests.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                لا توجد طلبات مراجعة حالياً.
              </div>
            ) : (
              reviewRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {req.proposedUnit?.image && (
                      <img
                        src={req.proposedUnit.image}
                        alt={req.proposedUnit.title}
                        className="w-20 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono-nums text-slate-500">{req.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-bold text-blue-700">{req.requestType}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold ${
                            req.status === 'معتمد'
                              ? 'text-emerald-700'
                              : req.status === 'مرفوض'
                                ? 'text-red-700'
                                : 'text-amber-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <h4 className="mt-1 font-display text-sm font-bold text-slate-900">
                        {req.proposedUnit
                          ? `${req.proposedUnit.title} (${req.proposedUnit.city} · ${req.proposedUnit.district})`
                          : req.targetUnitTitle}
                      </h4>

                      <p className="mt-1 text-xs text-slate-600">
                        مقدم الطلب: <strong>{req.submittedBy}</strong> ({req.submittedPhone}) ·{' '}
                        {req.createdAt}
                        {req.proposedUnit && (
                          <span className="font-mono-nums">
                            {' '}
                            · السعر: {formatCurrency(req.proposedUnit.price)} ج.م ·{' '}
                            {req.proposedUnit.areaSqm} م²
                          </span>
                        )}
                        {req.contractNumber && (
                          <span className="font-mono-nums">
                            {' '}
                            · عقد رقم: {req.contractNumber}
                          </span>
                        )}
                      </p>
                      {req.notes && <p className="mt-1 text-xs text-slate-500">{req.notes}</p>}
                    </div>
                  </div>

                  {req.status === 'قيد المراجعة' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onApproveReview(req.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 hover:-translate-y-0.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{req.requestType === 'بيع عقار' ? 'اعتماد ونشر' : 'اعتماد الشراء'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectReview(req.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>رفض</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};
