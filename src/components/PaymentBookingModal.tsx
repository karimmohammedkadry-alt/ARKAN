import React, { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Lock, ShieldCheck, X } from 'lucide-react';
import {
  BookingMode,
  BookingRecord,
  PaymentMethod,
  PropertyUnit,
  UserAccount,
} from '../types/realEstate';
import { formatCurrency } from '../data/mockProperties';

interface PaymentBookingModalProps {
  unit: PropertyUnit | null;
  user: UserAccount | null;
  onClose: () => void;
  onConfirmBooking: (record: BookingRecord, notes: string) => void;
}

export const PaymentBookingModal: React.FC<PaymentBookingModalProps> = ({
  unit,
  user,
  onClose,
  onConfirmBooking,
}) => {
  const [bookingMode, setBookingMode] = useState<BookingMode>('deposit');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [nationalId, setNationalId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [notes, setNotes] = useState('');
  const [agreedContract, setAgreedContract] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [confirmedRecord, setConfirmedRecord] = useState<BookingRecord | null>(null);

  useEffect(() => {
    if (user) {
      setBuyerName((prev) => prev || user.name);
      setBuyerEmail((prev) => prev || user.email);
      setBuyerPhone((prev) => prev || user.phone);
    }
  }, [user]);

  useEffect(() => {
    setConfirmedRecord(null);
    setErrorMsg(null);
  }, [unit]);

  if (!unit) return null;

  const depositAmount =
    unit.listingType === 'للبيع' ? Math.round(unit.price * 0.05) : Math.round(unit.price * 0.25);
  const adminFee = 5000;
  const amountDueNow =
    (bookingMode === 'deposit' ? depositAmount : unit.price) + adminFee;

  const formatCardInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!buyerName.trim() || !buyerEmail.includes('@') || buyerPhone.trim().length < 8) {
      setErrorMsg('يرجى التحقق من الاسم والبريد الإلكتروني ورقم الموبايل.');
      return;
    }
    if (nationalId.trim().length < 8) {
      setErrorMsg('يرجى إدخال الرقم القومي لإتمام التعاقد وإرسال طلب المراجعة.');
      return;
    }
    if (
      (paymentMethod === 'mada' || paymentMethod === 'card') &&
      (cardNumber.replace(/\s/g, '').length < 16 || cardExpiry.length < 5 || cardCvv.length < 3)
    ) {
      setErrorMsg('يرجى إدخال بيانات البطاقة البنكية كاملة بشكل صحيح.');
      return;
    }
    if (!agreedContract) {
      setErrorMsg('يجب الموافقة على شروط العقد الإلكتروني الموحد للمتابعة.');
      return;
    }

    setProcessing(true);
    window.setTimeout(() => {
      const contractNumber = `CDX-EG-${Math.floor(100000 + Math.random() * 899999)}`;
      const record: BookingRecord = {
        id: `bk-${Date.now()}`,
        unitId: unit.id,
        unitCode: unit.code,
        unitTitle: unit.title,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        buyerPhone: buyerPhone.trim(),
        nationalId: nationalId.trim(),
        paymentMethod,
        bookingMode,
        amountPaid: amountDueNow,
        contractNumber,
        createdAt: new Date().toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setProcessing(false);
      setConfirmedRecord(record);
      onConfirmBooking(record, notes.trim());
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="بوابة الشراء والحجز وإرسال طلب المراجعة"
    >
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl my-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
              شراء / حجز إلكتروني وإرسال طلب مراجعة
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 cursor-pointer"
            aria-label="إغلاق نافذة الدفع"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmedRecord ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">
              تم تأكيد الحجز وإرسال طلب الشراء للمراجعة
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              تم تحديث حالة الوحدة <span className="font-semibold">{unit.title}</span> إلى{' '}
              <span className="font-semibold text-amber-700">محجوز</span>، وإدراج طلب الشراء في{' '}
              <strong>لوحة التحكم &gt; طلبات المراجعة</strong> للاعتماد النهائي.
            </p>

            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5 text-right space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">رقم العقد المرجعي</span>
                <span className="font-mono-nums font-bold text-slate-900">
                  {confirmedRecord.contractNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">اسم المشتري</span>
                <span className="font-semibold text-slate-900">{confirmedRecord.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الوحدة السكنية</span>
                <span className="font-semibold text-slate-900">
                  {confirmedRecord.unitTitle} ({confirmedRecord.unitCode})
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">المبلغ المسدد إلكترونياً</span>
                <span className="font-mono-nums font-bold text-emerald-700">
                  {formatCurrency(confirmedRecord.amountPaid)} ج.م
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-all"
            >
              العودة للمنصة
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-mono-nums text-[11px] text-slate-500">{unit.code}</p>
                <p className="font-display text-sm font-bold text-slate-900">{unit.title}</p>
                <p className="text-xs text-slate-600">
                  {unit.city} · {unit.district} · {unit.listingType}
                </p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-[11px] text-slate-500">السعر الأساسي</p>
                <p className="font-mono-nums text-base font-bold text-slate-900">
                  {formatCurrency(unit.price)} ج.م
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                خيار السداد الإلكتروني
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setBookingMode('deposit')}
                  className={`p-3 text-right border rounded-lg transition-all cursor-pointer ${
                    bookingMode === 'deposit'
                      ? 'border-blue-700 bg-blue-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">
                    سداد جدية حجز ({unit.listingType === 'للبيع' ? '5%' : 'دفعة ربع سنوية'})
                  </p>
                  <p className="mt-1 font-mono-nums text-xs text-blue-700 font-semibold">
                    {formatCurrency(depositAmount)} ج.م
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('full_contract')}
                  className={`p-3 text-right border rounded-lg transition-all cursor-pointer ${
                    bookingMode === 'full_contract'
                      ? 'border-blue-700 bg-blue-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">تعاقد وسداد فوري كامل</p>
                  <p className="mt-1 font-mono-nums text-xs text-blue-700 font-semibold">
                    {formatCurrency(unit.price)} ج.م
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  الرقم القومي
                </label>
                <input
                  type="text"
                  required
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="2950101xxxxxxx"
                  className="w-full px-3 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">رقم الموبايل</label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="010xxxxxxxx"
                  className="w-full px-3 py-2 text-xs font-mono-nums bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                وسيلة الدفع الإلكتروني
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'card', label: 'Visa / Master' },
                    { id: 'mada', label: 'بطاقة ميزة / مدى' },
                    { id: 'apple_pay', label: 'Apple Pay' },
                    { id: 'bank_transfer', label: 'إنستا باي / تحويل' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2 px-3 text-xs font-semibold border rounded-lg transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? 'border-blue-700 bg-blue-700 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {(paymentMethod === 'mada' || paymentMethod === 'card') && (
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    رقم البطاقة
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                    placeholder="4000 1234 5678 9010"
                    className="w-full px-3 py-2 text-xs font-mono-nums bg-white border border-slate-200 rounded-md focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                    placeholder="09/29"
                    className="w-full px-3 py-2 text-xs font-mono-nums bg-white border border-slate-200 rounded-md focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    dir="ltr"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    className="w-full px-3 py-2 text-xs font-mono-nums bg-white border border-slate-200 rounded-md focus:border-blue-700 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ملاحظات لطلب الشراء والمراجعة (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: أرغب في جدولة المعاينة النهائية هذا الأسبوع..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
              />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedContract}
                onChange={(e) => setAgreedContract(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-blue-700 rounded shrink-0"
              />
              <span>
                أوافق على توقيع العقد الإلكتروني وإرسال طلب الشراء للمراجعة بمبلغ{' '}
                <strong className="font-mono-nums text-slate-900">
                  {formatCurrency(amountDueNow)} ج.م
                </strong>{' '}
                (شامل {formatCurrency(adminFee)} ج.م رسوم توثيق العقد).
              </span>
            </label>

            {errorMsg && (
              <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>اتصال مشفر تجريبي للمعاينة</span>
              </div>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap"
              >
                {processing ? (
                  <span>جاري تأكيد العملية...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>تأكيد الشراء وإرسال الطلب للمراجعة</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
