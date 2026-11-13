import React, { useState } from 'react';
import { CheckCircle2, ImagePlus, Send, Trash2, X } from 'lucide-react';
import {
  ListingType,
  ModelVariant,
  PropertyUnit,
  ReviewRequest,
  UnitCategory,
  UserAccount,
} from '../types/realEstate';
import { EGYPT_REGIONS } from '../data/mockProperties';
import towerImg from '../assets/images/property_tower_residence_1794608761673.jpg';
import penthouseImg from '../assets/images/property_penthouse_exterior_1794608760741.jpg';
import villaImg from '../assets/images/property_garden_villa_1794608762696.jpg';

interface SellPropertyModalProps {
  isOpen: boolean;
  user: UserAccount | null;
  onClose: () => void;
  onSubmitReviewRequest: (req: ReviewRequest) => void;
}

export const SellPropertyModal: React.FC<SellPropertyModalProps> = ({
  isOpen,
  user,
  onClose,
  onSubmitReviewRequest,
}) => {
  const [title, setTitle] = useState('');
  const [regionId, setRegionId] = useState(EGYPT_REGIONS[0].id);
  const [category, setCategory] = useState<UnitCategory>('شقة ذكية');
  const [listingType, setListingType] = useState<ListingType>('للبيع');
  const [modelVariant, setModelVariant] = useState<ModelVariant>('apartment');
  const [price, setPrice] = useState('5500000');
  const [areaSqm, setAreaSqm] = useState('185');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [floor, setFloor] = useState('4');
  const [description, setDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [submittedReqId, setSubmittedReqId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files)
      .slice(0, 6 - uploadedImages.length)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setUploadedImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numPrice = Number(price);
    const numArea = Number(areaSqm);
    if (!title.trim() || Number.isNaN(numPrice) || numPrice <= 0) {
      setError('يرجى إدخال عنوان واضح للعقار وسعر صحيح.');
      return;
    }

    const region = EGYPT_REGIONS.find((r) => r.id === regionId) || EGYPT_REGIONS[0];
    const fallbackImg =
      modelVariant === 'penthouse'
        ? penthouseImg
        : modelVariant === 'villa'
          ? villaImg
          : towerImg;

    const finalGallery = uploadedImages.length > 0 ? uploadedImages : [fallbackImg];

    const proposedUnit: PropertyUnit = {
      id: `unit-usr-${Date.now()}`,
      code: `USR-EG-${Math.floor(100 + Math.random() * 899)}`,
      title: title.trim(),
      city: region.city,
      district: region.district,
      category,
      listingType,
      status: 'متاح',
      price: numPrice,
      pricePeriod: listingType === 'للإيجار' ? 'سنوياً' : 'إجمالي',
      areaSqm: Number.isNaN(numArea) || numArea <= 0 ? 180 : numArea,
      bedrooms: Number(bedrooms) || 3,
      bathrooms: Number(bathrooms) || 2,
      floor: Number(floor) || 1,
      wing: `طرح المالك (${user.name})`,
      image: finalGallery[0],
      gallery: finalGallery,
      description:
        description.trim() ||
        `عقار مقدم من المالك في ${region.city} (${region.district}) بمساحة ${numArea} م² وجاهز للمعاينة ثلاثية الأبعاد.`,
      features: [
        `موقع مميز في ${region.district}`,
        'معاينة 3D تفاعلية',
        'طلب مراجعة موثق من المالك',
      ],
      defaultFinish: 'oak',
      modelVariant,
      masterplanZone: category === 'فيلا مستقلة' ? 'villa-east' : 'tower',
      towerFloorIndex: Math.floor(Math.random() * 6),
      ownerName: user.name,
      updatedAt: 'الآن',
    };

    const reqId = `REQ-${Math.floor(10000 + Math.random() * 89999)}`;
    const reviewReq: ReviewRequest = {
      id: reqId,
      requestType: 'بيع عقار',
      status: 'قيد المراجعة',
      submittedBy: user.name,
      submittedEmail: user.email,
      submittedPhone: user.phone,
      createdAt: 'الآن',
      notes: description.trim() || 'طلب إدراج عقار جديد للمعاينة والموافقة.',
      proposedUnit,
    };

    onSubmitReviewRequest(reviewReq);
    setSubmittedReqId(reqId);
  };

  const resetAndClose = () => {
    setSubmittedReqId(null);
    setTitle('');
    setDescription('');
    setUploadedImages([]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="بيع عقارك وإرسال طلب مراجعة"
    >
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl my-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              اعرض عقارك للبيع وأرسل طلب للمراجعة
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              المعلن: {user.name} ({user.email})
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedReqId ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">
              تم إرسال طلب بيع العقار للمراجعة بنجاح
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              رقم طلب المراجعة:{' '}
              <strong className="font-mono-nums text-slate-900">{submittedReqId}</strong>. يمكنك
              الآن مراجعته واعتماده مباشرة من{' '}
              <strong>لوحة التحكم &gt; طلبات المراجعة</strong> ليظهر في الكتالوج فوراً.
            </p>
            <button
              type="button"
              onClick={resetAndClose}
              className="mt-6 px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 rounded-lg transition-all cursor-pointer"
            >
              تم، العودة للمنصة
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                صور العقار (يمكنك إضافة حتى 6 صور من جهازك)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="w-24 h-24 border-2 border-dashed border-slate-300 hover:border-blue-700 bg-slate-50 hover:bg-blue-50/40 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] text-slate-600 cursor-pointer transition-all">
                  <ImagePlus className="w-5 h-5 text-blue-700" />
                  <span>إضافة صور</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {uploadedImages.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group"
                  >
                    <img src={src} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 left-1 p-1 bg-slate-900/80 text-white rounded-md opacity-90 hover:bg-red-600 transition-colors cursor-pointer"
                      aria-label="حذف الصورة"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  عنوان الإعلان العقاري
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: شقة فاخرة بحديقة خاصة في التجمع الخامس"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  المنطقة في مصر (24 منطقة)
                </label>
                <select
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                >
                  {EGYPT_REGIONS.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">نوع العقار</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const cat = e.target.value as UnitCategory;
                    setCategory(cat);
                    setModelVariant(
                      cat === 'فيلا مستقلة'
                        ? 'villa'
                        : cat === 'بنتهاوس'
                          ? 'penthouse'
                          : cat === 'دوبلكس'
                            ? 'duplex'
                            : 'apartment'
                    );
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                >
                  <option value="شقة ذكية">شقة ذكية</option>
                  <option value="دوبلكس">دوبلكس</option>
                  <option value="بنتهاوس">بنتهاوس</option>
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
                  السعر المطلوب (ج.م)
                </label>
                <input
                  type="number"
                  min={50000}
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  المساحة (م²)
                </label>
                <input
                  type="number"
                  min={40}
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">الغرف</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">الحمامات</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">الطابق</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  وصف العقار والملاحظات لفريق المراجعة
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اذكر حالة التشطيب، الإطلالة، المرافق القريبة، وأي تفاصيل تهم المشتري..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all duration-150 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال طلب البيع للمراجعة</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
