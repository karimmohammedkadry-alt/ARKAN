import React, { useState } from 'react';
import { Bell, Eye, FileDown, LogIn, LogOut, PlusCircle, User, X } from 'lucide-react';
import {
  AlertPreferences,
  BookingRecord,
  InstantNotification,
  ListingType,
  PropertyUnit,
  ReviewRequest,
  UnitStatus,
  UserAccount,
} from './types/realEstate';
import {
  DEFAULT_ALERT_PREFERENCES,
  EGYPT_REGIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REVIEW_REQUESTS,
  INITIAL_UNITS,
  formatCurrency,
} from './data/mockProperties';
import { Navbar } from './components/Navbar';
import { ThreeMasterplanHero } from './components/ThreeMasterplanHero';
import { UnitCatalog } from './components/UnitCatalog';
import { AdminDashboard } from './components/AdminDashboard';
import { SmartAlertsSection } from './components/SmartAlertsSection';
import { TeamVisionSection } from './components/TeamVisionSection';
import { Footer } from './components/Footer';
import { ThreeInteriorTourModal } from './components/ThreeInteriorTourModal';
import { PaymentBookingModal } from './components/PaymentBookingModal';
import { SupportChatbot } from './components/SupportChatbot';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { UnitComparisonModal } from './components/UnitComparisonModal';
import { AuthModal } from './components/AuthModal';
import { SellPropertyModal } from './components/SellPropertyModal';
import { generateCompanyProfilePdf } from './utils/pdfGenerator';

export default function App() {
  const [units, setUnits] = useState<PropertyUnit[]>(INITIAL_UNITS);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(INITIAL_UNITS[0].id);
  const [detailsUnit, setDetailsUnit] = useState<PropertyUnit | null>(null);
  const [tourUnit, setTourUnit] = useState<PropertyUnit | null>(null);
  const [bookingUnit, setBookingUnit] = useState<PropertyUnit | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    { type: 'sell' } | { type: 'buy'; unit: PropertyUnit } | null
  >(null);

  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>(INITIAL_REVIEW_REQUESTS);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [preferences, setPreferences] = useState<AlertPreferences>(DEFAULT_ALERT_PREFERENCES);
  const [notifications, setNotifications] = useState<InstantNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeToast, setActiveToast] = useState<InstantNotification | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const doesUnitMatchPreferences = (unit: PropertyUnit, prefs: AlertPreferences): boolean => {
    if (!prefs.enabled || unit.status !== 'متاح') return false;
    if (prefs.listingType !== 'الكل' && unit.listingType !== prefs.listingType) return false;
    if (prefs.preferredCity !== 'الكل' && unit.city !== prefs.preferredCity) return false;
    if (unit.bedrooms < prefs.minBedrooms) return false;
    if (unit.listingType === 'للبيع' && unit.price > prefs.maxBudgetSale) return false;
    if (unit.listingType === 'للإيجار' && unit.price > prefs.maxBudgetRent) return false;
    return true;
  };

  const pushInstantNotification = (unit: PropertyUnit, reason: string) => {
    const notif: InstantNotification = {
      id: `notif-${Date.now()}`,
      title: `تنبيه فوري: ${unit.title}`,
      message: `متاح الآن ${unit.listingType} في ${unit.city} (${unit.district}) بسعر ${formatCurrency(unit.price)} ج.م.`,
      unitId: unit.id,
      timestamp: 'الآن',
      read: false,
      matchReason: reason,
    };
    setNotifications((prev) => [notif, ...prev]);
    setActiveToast(notif);
    window.setTimeout(() => {
      setActiveToast((curr) => (curr?.id === notif.id ? null : curr));
    }, 6500);
  };

  // Optional Login Gate for Sell & Buy actions
  const handleRequireAuthForSell = () => {
    if (currentUser) {
      setSellModalOpen(true);
    } else {
      setAuthReason(
        'التصفح والمعاينة ثلاثية الأبعاد متاحان بدون حساب، ولكن لإضافة صور وعرض عقارك للبيع وإرسال طلب المراجعة يلزم تسجيل الدخول أولاً.'
      );
      setPendingAction({ type: 'sell' });
      setAuthModalOpen(true);
    }
  };

  const handleRequireAuthForBuy = (unit: PropertyUnit) => {
    if (currentUser) {
      setBookingUnit(unit);
    } else {
      setAuthReason(
        `لإتمام شراء أو حجز "${unit.title}" وإرسال طلب المراجعة باسمك يرجى تسجيل الدخول أولاً.`
      );
      setPendingAction({ type: 'buy', unit });
      setAuthModalOpen(true);
    }
  };

  const handleAuthenticated = (user: UserAccount) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    setAuthReason(null);
    if (pendingAction?.type === 'sell') {
      setSellModalOpen(true);
    } else if (pendingAction?.type === 'buy') {
      setBookingUnit(pendingAction.unit);
    }
    setPendingAction(null);
  };

  const handleToggleCompare = (unitId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(unitId)) return prev.filter((id) => id !== unitId);
      if (prev.length >= 2) return [prev[1], unitId];
      return [...prev, unitId];
    });
  };

  const handleUpdateUnitStatus = (unitId: string, status: UnitStatus) => {
    let updatedUnit: PropertyUnit | undefined;
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          updatedUnit = { ...u, status, updatedAt: 'الآن' };
          return updatedUnit;
        }
        return u;
      })
    );

    if (updatedUnit && status === 'متاح' && doesUnitMatchPreferences(updatedUnit, preferences)) {
      pushInstantNotification(updatedUnit, 'تمت إتاحة الوحدة وطابقت تفضيلاتك');
    }
  };

  const handleUpdateUnitListingType = (unitId: string, listingType: ListingType) => {
    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId
          ? {
              ...u,
              listingType,
              pricePeriod: listingType === 'للإيجار' ? 'سنوياً' : 'إجمالي',
              updatedAt: 'الآن',
            }
          : u
      )
    );
  };

  const handleUpdateUnitPrice = (unitId: string, newPrice: number) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, price: newPrice, updatedAt: 'الآن' } : u))
    );
  };

  const handleAddUnit = (newUnit: PropertyUnit) => {
    setUnits((prev) => [newUnit, ...prev]);
    setSelectedUnitId(newUnit.id);
    if (doesUnitMatchPreferences(newUnit, preferences)) {
      pushInstantNotification(newUnit, 'وحدة جديدة مطابقة لتفضيلاتك');
    }
  };

  const handleSubmitSellReview = (req: ReviewRequest) => {
    setReviewRequests((prev) => [req, ...prev]);
  };

  const handleApproveReview = (requestId: string) => {
    const req = reviewRequests.find((r) => r.id === requestId);
    if (!req) return;

    setReviewRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'معتمد' } : r))
    );

    if (req.requestType === 'بيع عقار' && req.proposedUnit) {
      const publishedUnit: PropertyUnit = {
        ...req.proposedUnit,
        status: 'متاح',
        updatedAt: 'معتمد الآن',
      };
      setUnits((prev) => [publishedUnit, ...prev]);
      setSelectedUnitId(publishedUnit.id);
      if (doesUnitMatchPreferences(publishedUnit, preferences)) {
        pushInstantNotification(publishedUnit, 'تم اعتماد ونشر عقار ملاك مطابق لتفضيلاتك');
      }
    } else if (req.requestType === 'طلب شراء' && req.targetUnitId) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === req.targetUnitId ? { ...u, status: 'مباع', updatedAt: 'تم الاعتماد' } : u
        )
      );
    }
  };

  const handleRejectReview = (requestId: string) => {
    const req = reviewRequests.find((r) => r.id === requestId);
    setReviewRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'مرفوض' } : r))
    );
    if (req?.requestType === 'طلب شراء' && req.targetUnitId) {
      setUnits((prev) =>
        prev.map((u) => (u.id === req.targetUnitId ? { ...u, status: 'متاح', updatedAt: 'الآن' } : u))
      );
    }
  };

  const handleSimulateMatchingOffer = () => {
    const city =
      preferences.preferredCity === 'الكل' ? 'القاهرة الجديدة' : preferences.preferredCity;
    const region = EGYPT_REGIONS.find((r) => r.city === city) || EGYPT_REGIONS[0];
    const listingType: ListingType =
      preferences.listingType === 'الكل' ? 'للبيع' : preferences.listingType;
    const targetPrice =
      listingType === 'للبيع'
        ? Math.min(preferences.maxBudgetSale, 7400000)
        : Math.min(preferences.maxBudgetRent, 480000);

    const newOffer: PropertyUnit = {
      id: `unit-sim-${Date.now()}`,
      code: `EG-ALT-${units.length + 10}`,
      title: `جناح ${region.city} المميز المطابق لتفضيلاتك`,
      district: region.district,
      city: region.city,
      category: 'شقة ذكية',
      listingType,
      status: 'متاح',
      price: targetPrice,
      pricePeriod: listingType === 'للإيجار' ? 'سنوياً' : 'إجمالي',
      areaSqm: 205,
      bedrooms: Math.max(preferences.minBedrooms, 3),
      bathrooms: 3,
      floor: 8,
      wing: 'البرج الشمالي',
      image: INITIAL_UNITS[1].image,
      gallery: [INITIAL_UNITS[1].image, INITIAL_UNITS[0].image],
      description:
        'عرض عقاري تم طرحه للتو في مصر ويطابق معايير البحث والتنبيهات المسجلة في ملفك الشخصي.',
      features: ['جولة 3D فورية', 'مطابق لميزانيتك', 'جاهز للتعاقد الإلكتروني'],
      defaultFinish: 'marble',
      modelVariant: 'apartment',
      masterplanZone: 'tower',
      towerFloorIndex: 3,
      updatedAt: 'الآن',
    };

    setUnits((prev) => [newOffer, ...prev]);
    setSelectedUnitId(newOffer.id);
    pushInstantNotification(newOffer, 'طابق ميزانيتك، المنطقة، وعدد الغرف');
  };

  const handleConfirmBooking = (record: BookingRecord, notes: string) => {
    setBookings((prev) => [record, ...prev]);
    setUnits((prev) =>
      prev.map((u) => (u.id === record.unitId ? { ...u, status: 'محجوز', updatedAt: 'الآن' } : u))
    );
    const purchaseReview: ReviewRequest = {
      id: `REQ-BUY-${Math.floor(1000 + Math.random() * 8999)}`,
      requestType: 'طلب شراء',
      status: 'قيد المراجعة',
      submittedBy: record.buyerName,
      submittedEmail: record.buyerEmail,
      submittedPhone: record.buyerPhone,
      createdAt: 'الآن',
      notes: notes || 'طلب شراء وحجز إلكتروني بانتظار اعتماد الإدارة النهائي.',
      targetUnitId: record.unitId,
      targetUnitTitle: `${record.unitTitle} (${record.unitCode})`,
      contractNumber: record.contractNumber,
      amountPaid: record.amountPaid,
    };
    setReviewRequests((prev) => [purchaseReview, ...prev]);
  };

  const handleLaunchTourById = (unitId: string) => {
    const found = units.find((u) => u.id === unitId);
    if (found) {
      setSelectedUnitId(found.id);
      setTourUnit(found);
    }
  };

  const handleResetDemo = () => {
    setUnits(INITIAL_UNITS);
    setSelectedUnitId(INITIAL_UNITS[0].id);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReviewRequests(INITIAL_REVIEW_REQUESTS);
    setBookings([]);
    setCompareIds([]);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateCompanyProfilePdf(units);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const featuredUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const availableCount = units.filter((u) => u.status === 'متاح').length;
  const comparedUnitsPair: [PropertyUnit, PropertyUnit] | null =
    compareIds.length === 2
      ? ([
          units.find((u) => u.id === compareIds[0]),
          units.find((u) => u.id === compareIds[1]),
        ].filter(Boolean) as PropertyUnit[]).length === 2
        ? ([
            units.find((u) => u.id === compareIds[0])!,
            units.find((u) => u.id === compareIds[1])!,
          ] as [PropertyUnit, PropertyUnit])
        : null
      : null;

  return (
    <div id="top" className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar onDownloadPdf={handleDownloadPdf} isGeneratingPdf={isGeneratingPdf} />

      <main className="flex-1">
        {/* Hero Split + Interactive 3D Architectural Masterplan */}
        <section id="showcase-3d" className="py-10 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Optional Login & Quick Sell Bar right inside Hero Workspace */}
            <div className="mb-8 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                تغطية شاملة لأكثر من <strong className="text-slate-900">24 منطقة في مصر</strong>{' '}
                بجولات 3D قابلة للتخصيص
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRequireAuthForSell}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 hover:-translate-y-0.5 rounded-lg transition-all duration-150 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-700" />
                  <span>بيع عقارك</span>
                </button>

                {currentUser ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                    <User className="w-3.5 h-3.5 text-blue-700" />
                    <span className="font-semibold text-slate-900">{currentUser.name}</span>
                    <button
                      type="button"
                      onClick={() => setCurrentUser(null)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-red-700 mr-1 cursor-pointer"
                      title="تسجيل الخروج"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>خروج</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthReason(null);
                      setPendingAction(null);
                      setAuthModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 hover:-translate-y-0.5 rounded-lg transition-all duration-150 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>تسجيل الدخول (اختياري)</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              {/* Narrative Column */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <p className="text-xs font-semibold text-blue-700 mb-3">
                  منصة العقارات ثلاثية الأبعاد · تطوير CODEX
                </p>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 leading-[1.22] tracking-tight">
                  تجوّل داخل بيتك ثلاثياً، غيّر ألوان الحوائط وأضف الأثاث قبل الشراء
                </h1>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  استعرض عقارات للبيع والإيجار في أكثر من 24 منطقة بمصر، قارن بين الوحدات جنباً
                  إلى جنب، أو اعرض عقارك للبيع وأرسل طلبات البيع والشراء للمراجعة الفورية.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTourUnit(featuredUnit)}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" />
                    <span>ابدأ المعاينة 3D الواقعية</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 hover:-translate-y-0.5 rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>ملف الشركة PDF</span>
                  </button>
                </div>

                {bookings.length > 0 && (
                  <div className="mt-6 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                    تم إرسال <strong className="font-mono-nums">{bookings.length}</strong> طلب شراء
                    وحجز إلكتروني للمراجعة (آخر عقد:{' '}
                    <span className="font-mono-nums font-bold">{bookings[0].contractNumber}</span>).
                  </div>
                )}
              </div>

              {/* Interactive 3D Viewport */}
              <div className="lg:col-span-7">
                <ThreeMasterplanHero
                  units={units}
                  selectedUnitId={selectedUnitId}
                  onSelectUnit={(u) => setSelectedUnitId(u.id)}
                  onLaunchTour={(u) => setTourUnit(u)}
                  onOpenBooking={handleRequireAuthForBuy}
                />
              </div>
            </div>

            {/* Full-Width 4-Column Metric Strip below Hero Split */}
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-slate-200">
              <div>
                <p className="font-mono-nums text-2xl font-bold text-slate-900">
                  {EGYPT_REGIONS.length} منطقة
                </p>
                <p className="mt-1 text-xs text-slate-500">تغطية عقارية في القاهرة والساحل والمدن</p>
              </div>
              <div>
                <p className="font-mono-nums text-2xl font-bold text-slate-900">
                  {availableCount} / {units.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">وحدات متاحة ومحدثة لحظياً</p>
              </div>
              <div>
                <p className="font-mono-nums text-2xl font-bold text-slate-900">تخصيص 3D</p>
                <p className="mt-1 text-xs text-slate-500">تغيير ألوان الحوائط وإضافة الأثاث</p>
              </div>
              <div>
                <p className="font-mono-nums text-2xl font-bold text-slate-900">24/7</p>
                <p className="mt-1 text-xs text-slate-500">مراجعة طلبات البيع والشراء والدعم المباشر</p>
              </div>
            </div>
          </div>
        </section>

        <UnitCatalog
          units={units}
          selectedUnitId={selectedUnitId}
          compareIds={compareIds}
          onSelectUnit={(u) => setSelectedUnitId(u.id)}
          onOpenDetails={(u) => setDetailsUnit(u)}
          onLaunchTour={(u) => setTourUnit(u)}
          onOpenBooking={handleRequireAuthForBuy}
          onToggleCompare={handleToggleCompare}
          onOpenComparisonModal={() => setCompareModalOpen(true)}
          onClearCompare={() => setCompareIds([])}
          onOpenSellProperty={handleRequireAuthForSell}
        />

        <AdminDashboard
          units={units}
          reviewRequests={reviewRequests}
          onUpdateUnitStatus={handleUpdateUnitStatus}
          onUpdateUnitListingType={handleUpdateUnitListingType}
          onUpdateUnitPrice={handleUpdateUnitPrice}
          onAddUnit={handleAddUnit}
          onApproveReview={handleApproveReview}
          onRejectReview={handleRejectReview}
          onLaunchTour={(u) => setTourUnit(u)}
          onResetDemo={handleResetDemo}
        />

        <SmartAlertsSection
          units={units}
          preferences={preferences}
          onUpdatePreferences={setPreferences}
          notifications={notifications}
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onSimulateMatchingOffer={handleSimulateMatchingOffer}
          onLaunchUnitTour={handleLaunchTourById}
        />

        <TeamVisionSection
          onDownloadPdf={handleDownloadPdf}
          isGeneratingPdf={isGeneratingPdf}
        />
      </main>

      <Footer onDownloadPdf={handleDownloadPdf} isGeneratingPdf={isGeneratingPdf} />

      {/* Property Details Modal */}
      <PropertyDetailsModal
        unit={detailsUnit}
        isCompared={detailsUnit ? compareIds.includes(detailsUnit.id) : false}
        onClose={() => setDetailsUnit(null)}
        onLaunchTour={(u) => setTourUnit(u)}
        onOpenBooking={handleRequireAuthForBuy}
        onToggleCompare={handleToggleCompare}
      />

      {/* Side-by-Side Comparison Modal */}
      <UnitComparisonModal
        units={compareModalOpen ? comparedUnitsPair : null}
        onClose={() => setCompareModalOpen(false)}
        onLaunchTour={(u) => setTourUnit(u)}
        onOpenBooking={handleRequireAuthForBuy}
      />

      {/* 3D Virtual Interior Tour Modal */}
      <ThreeInteriorTourModal
        unit={tourUnit}
        onClose={() => setTourUnit(null)}
        onBookUnit={handleRequireAuthForBuy}
      />

      {/* Electronic Payment & Contracting Modal */}
      <PaymentBookingModal
        unit={bookingUnit}
        user={currentUser}
        onClose={() => setBookingUnit(null)}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* Optional Login Modal (Required for Sell & Buy) */}
      <AuthModal
        isOpen={authModalOpen}
        reasonMessage={authReason}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction(null);
        }}
        onAuthenticated={handleAuthenticated}
      />

      {/* Sell Property & Photo Upload Modal */}
      <SellPropertyModal
        isOpen={sellModalOpen}
        user={currentUser}
        onClose={() => setSellModalOpen(false)}
        onSubmitReviewRequest={handleSubmitSellReview}
      />

      {/* 24/7 Live Support Chatbot */}
      <SupportChatbot units={units} onLaunchTour={(u) => setTourUnit(u)} />

      {/* Instant Preference Alert Toast */}
      {activeToast && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-50 max-w-sm bg-white border border-blue-200 rounded-xl p-4 shadow-xl flex items-start gap-3"
        >
          <Bell className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900">{activeToast.title}</p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">{activeToast.message}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleLaunchTourById(activeToast.unitId);
                  setActiveToast(null);
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded cursor-pointer"
              >
                فتح الجولة 3D
              </button>
              <button
                type="button"
                onClick={() => setActiveToast(null)}
                className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                تجاهل
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
