import React, { useEffect, useRef, useState } from 'react';
import { Eye, Headphones, MessageSquare, Send, X } from 'lucide-react';
import { PropertyUnit } from '../types/realEstate';
import { formatCurrency } from '../data/mockProperties';

interface SupportChatbotProps {
  units: PropertyUnit[];
  onLaunchTour: (unit: PropertyUnit) => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  suggestedUnit?: PropertyUnit;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'ما هي الوحدات المتاحة للبيع؟',
  'أبحث عن شقة أو فيلا للإيجار',
  'كيف أبدأ التجول الافتراضي 3D؟',
  'ما طرق الدفع والتعاقد المتوفرة؟',
  'من هي شركة CODEX؟',
];

export const SupportChatbot: React.FC<SupportChatbotProps> = ({ units, onLaunchTour }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'bot',
      text: 'مرحباً بك في الدعم الفني المباشر لمنصة أركان العقارية (مدعوم من CODEX). كيف يمكنني مساعدتك اليوم في استكشاف الوحدات أو الحجز الإلكتروني؟',
      timestamp: 'الآن',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const buildReply = (query: string): { text: string; suggestedUnit?: PropertyUnit } => {
    const q = query.trim();
    const available = units.filter((u) => u.status === 'متاح');

    if (q.includes('بيع') || q.includes('شراء') || q.includes('أرخص') || q.includes('تمليك')) {
      const forSale = available
        .filter((u) => u.listingType === 'للبيع')
        .sort((a, b) => a.price - b.price);
      if (forSale.length === 0) {
        return { text: 'حالياً جميع وحدات التمليك محجوزة أو مباعة. يمكنك تفعيل التنبيهات الفورية ليصلك إشعار فور توفر وحدة جديدة.' };
      }
      const top = forSale[0];
      return {
        text: `يتوفر لدينا حالياً ${forSale.length} وحدات متاحة للبيع في 24 منطقة بمصر. أبرز خيار بسعر تنافسي هو "${top.title}" في ${top.city} (${top.district}) بسعر ${formatCurrency(top.price)} ج.م ومساحة ${top.areaSqm} م².`,
        suggestedUnit: top,
      };
    }

    if (q.includes('إيجار') || q.includes('استئجار') || q.includes('ايجار')) {
      const forRent = available.filter((u) => u.listingType === 'للإيجار');
      if (forRent.length === 0) {
        return { text: 'لا توجد وحدات إيجار متاحة في هذه اللحظة، ويمكنك استخدام التنبيهات الفورية أو لوحة الإدارة لتحديث الحالة.' };
      }
      const top = forRent[0];
      return {
        text: `لدينا ${forRent.length} وحدات متاحة للإيجار السنوي، منها "${top.title}" في ${top.city} بقيمة ${formatCurrency(top.price)} ج.م سنوياً. يمكنك بدء الجولة الافتراضية الآن:`,
        suggestedUnit: top,
      };
    }

    if (q.includes('3d') || q.includes('جولة') || q.includes('افتراضي') || q.includes('تجول')) {
      const featured = available[0] || units[0];
      return {
        text: 'تتيح لك منصة أركان التجول ثلاثي الأبعاد داخل الغرف بتصميم يختلف من منزل لآخر، مع إمكانية تغيير ألوان الحوائط وإضافة أو إزالة الأثاث والتحرك الحر داخل الغرف.',
        suggestedUnit: featured,
      };
    }

    if (q.includes('دفع') || q.includes('حجز') || q.includes('تعاقد') || q.includes('مدى') || q.includes('بيع')) {
      return {
        text: 'يمكنك تصفح كل العقارات ومقارنتها بحرية، وعند الرغبة في بيع عقارك أو شراء وحدة يلزم تسجيل الدخول السريع لإرسال طلب المراجعة والدفع الإلكتروني عبر Visa أو ميزة أو Apple Pay.',
      };
    }

    if (q.includes('codex') || q.includes('كودكس') || q.includes('فريق') || q.includes('شركة')) {
      return {
        text: 'تم تصميم وتطوير هذه المنصة بواسطة شركة CODEX المتخصصة في التوائم الرقمية العقارية، هندسة WebGL ثلاثية الأبعاد، ومنظومات الدفع والتعاقد الفوري. يمكنك تحميل الملف التعريفي PDF من الشريط العلوي.',
      };
    }

    const fallbackUnit = available[0] || units[0];
    return {
      text: `يتوفر لدينا حالياً ${available.length} وحدة جاهزة للمعاينة الفورية في 24 منطقة بمصر. أخبرني هل تبحث عن تمليك أم إيجار، أو افتح الجولة ثلاثية الأبعاد لأحدث وحدة متاحة:`,
      suggestedUnit: fallbackUnit,
    };
  };

  const sendMessage = (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const reply = buildReply(clean);
    const botMsg: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      sender: 'bot',
      text: reply.text,
      suggestedUnit: reply.suggestedUnit,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {isOpen ? (
        <div className="w-[min(370px,92vw)] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Headphones className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">الدعم الفني المباشر 24/7</p>
                <p className="text-[11px] text-slate-300 truncate">مساعد أركان × CODEX</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-300 hover:text-white rounded cursor-pointer"
              aria-label="تصغير المحادثة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="p-4 h-80 overflow-y-auto bg-slate-50 space-y-3 text-xs"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.suggestedUnit && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {m.suggestedUnit.title}
                        </p>
                        <p className="font-mono-nums text-[11px] text-slate-500">
                          {formatCurrency(m.suggestedUnit.price)} ج.م
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onLaunchTour(m.suggestedUnit!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>جولة 3D</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="mt-1 text-[10px] text-slate-400 px-1">{m.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => sendMessage(qp)}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md whitespace-nowrap shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب استفسارك هنا..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-700 focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shrink-0"
              aria-label="إرسال الرسالة"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg shadow-lg transition-colors whitespace-nowrap"
        >
          <MessageSquare className="w-4 h-4" />
          <span>دعم فني مباشر 24/7</span>
        </button>
      )}
    </div>
  );
};
