import React from 'react';
import { Bell, CheckCheck, Eye, Sparkles } from 'lucide-react';
import {
  AlertPreferences,
  InstantNotification,
  ListingType,
  PropertyUnit,
} from '../types/realEstate';
import { EGYPT_REGIONS, formatCurrency } from '../data/mockProperties';

interface SmartAlertsSectionProps {
  units: PropertyUnit[];
  preferences: AlertPreferences;
  onUpdatePreferences: (next: AlertPreferences) => void;
  notifications: InstantNotification[];
  onMarkAllRead: () => void;
  onSimulateMatchingOffer: () => void;
  onLaunchUnitTour: (unitId: string) => void;
}

export const SmartAlertsSection: React.FC<SmartAlertsSectionProps> = ({
  units,
  preferences,
  onUpdatePreferences,
  notifications,
  onMarkAllRead,
  onSimulateMatchingOffer,
  onLaunchUnitTour,
}) => {
  const uniqueCities = Array.from(new Set(EGYPT_REGIONS.map((r) => r.city)));

  const matchingCount = units.filter((u) => {
    if (u.status !== 'متاح') return false;
    if (preferences.listingType !== 'الكل' && u.listingType !== preferences.listingType) return false;
    if (preferences.preferredCity !== 'الكل' && u.city !== preferences.preferredCity) return false;
    if (u.bedrooms < preferences.minBedrooms) return false;
    if (u.listingType === 'للبيع' && u.price > preferences.maxBudgetSale) return false;
    if (u.listingType === 'للإيجار' && u.price > preferences.maxBudgetRent) return false;
    return true;
  }).length;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <section id="smart-alerts" className="py-16 lg:py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold text-blue-700 mb-2">
              03. نظام التنبيهات الفورية الذكي
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              إشعارات فورية فور توفر عروض مطابقة لتفضيلاتك
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              حدد ميزانيتك، المنطقة المفضلة في مصر، وعدد الغرف ليقوم المحرك بإرسال تنبيه لحظي
              عند طرح وحدة جديدة أو اعتماد عرض ملاك مطابق.
            </p>
          </div>

          <button
            type="button"
            onClick={onSimulateMatchingOffer}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap self-start lg:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>محاكاة طرح عرض مطابق الآن</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Preferences Configurator */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  تفضيلات التنبيه الشخصية
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  تطابق حالياً {matchingCount} وحدة متاحة
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={preferences.enabled}
                  onChange={(e) =>
                    onUpdatePreferences({ ...preferences, enabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-700 rounded"
                />
                <span>{preferences.enabled ? 'مفعّل' : 'متوقف'}</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  نوع العرض المطلوب
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white border border-slate-200 rounded-lg">
                  {(['الكل', 'للبيع', 'للإيجار'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        onUpdatePreferences({
                          ...preferences,
                          listingType: type as 'الكل' | ListingType,
                        })
                      }
                      className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        preferences.listingType === type
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    المنطقة المفضلة
                  </label>
                  <select
                    value={preferences.preferredCity}
                    onChange={(e) =>
                      onUpdatePreferences({ ...preferences, preferredCity: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-700 focus:outline-none cursor-pointer"
                  >
                    <option value="الكل">كل مناطق مصر</option>
                    {uniqueCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    الحد الأدنى للغرف
                  </label>
                  <select
                    value={preferences.minBedrooms}
                    onChange={(e) =>
                      onUpdatePreferences({ ...preferences, minBedrooms: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs font-mono-nums bg-white border border-slate-200 rounded-lg focus:border-blue-700 focus:outline-none cursor-pointer"
                  >
                    <option value={1}>1+ غرفة</option>
                    <option value={2}>2+ غرف</option>
                    <option value={3}>3+ غرف</option>
                    <option value={4}>4+ غرف</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">أقصى ميزانية للشراء</span>
                  <span className="font-mono-nums font-bold text-blue-700">
                    {formatCurrency(preferences.maxBudgetSale)} ج.م
                  </span>
                </div>
                <input
                  type="range"
                  min={3000000}
                  max={30000000}
                  step={500000}
                  value={preferences.maxBudgetSale}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      maxBudgetSale: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-700 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">أقصى ميزانية للإيجار السنوي</span>
                  <span className="font-mono-nums font-bold text-blue-700">
                    {formatCurrency(preferences.maxBudgetRent)} ج.م
                  </span>
                </div>
                <input
                  type="range"
                  min={200000}
                  max={1500000}
                  step={50000}
                  value={preferences.maxBudgetRent}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      maxBudgetRent: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Live Notifications Feed */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-700" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  سجل التنبيهات الفورية
                </h3>
                {unreadCount > 0 && (
                  <span className="font-mono-nums text-xs font-semibold text-blue-700">
                    ({unreadCount} جديد)
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>تحديد الكل كمقروء</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500">
                  لا توجد تنبيهات بعد. اضغط على "محاكاة طرح عرض مطابق الآن" أو أضف وحدة من لوحة
                  التحكم.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      notif.read ? 'bg-white' : 'bg-blue-50/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900">{notif.title}</span>
                        {!notif.read && (
                          <span className="text-[11px] font-semibold text-blue-700">· جديد</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{notif.matchReason}</span>
                        <span aria-hidden="true">·</span>
                        <span>{notif.timestamp}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onLaunchUnitTour(notif.unitId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 hover:-translate-y-0.5 rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-700" />
                      <span>معاينة 3D</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
