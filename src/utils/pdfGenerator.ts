import { jsPDF } from 'jspdf';
import { PropertyUnit } from '../types/realEstate';
import { CODEX_TEAM, CODEX_VISION_PILLARS, formatCurrency } from '../data/mockProperties';

function drawWrappedArabicText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

export async function generateCompanyProfilePdf(units: PropertyUnit[]): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const width = 1240;
  const height = 1754; // A4 @ 150 DPI
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [width / 2, height / 2],
  });

  // --- PAGE 1: Cover, Vision & Capabilities ---
  const c1 = document.createElement('canvas');
  c1.width = width;
  c1.height = height;
  const ctx1 = c1.getContext('2d')!;

  ctx1.fillStyle = '#FFFFFF';
  ctx1.fillRect(0, 0, width, height);

  // Subtle architectural header band
  ctx1.fillStyle = '#0F172A';
  ctx1.fillRect(0, 0, width, 240);

  ctx1.direction = 'rtl';
  ctx1.textAlign = 'right';

  ctx1.fillStyle = '#93C5FD';
  ctx1.font = '600 22px "IBM Plex Sans Arabic", Cairo, sans-serif';
  ctx1.fillText('الملف التعريفي الرسمي 2026  ·  من تطوير شركة CODEX', width - 80, 74);

  ctx1.fillStyle = '#FFFFFF';
  ctx1.font = '700 54px Cairo, "IBM Plex Sans Arabic", sans-serif';
  ctx1.fillText('أركان العقارية | ARKAN 3D', width - 80, 145);

  ctx1.fillStyle = '#CBD5E1';
  ctx1.font = '400 24px "IBM Plex Sans Arabic", Cairo, sans-serif';
  ctx1.fillText('تجربة معمارية ثلاثية الأبعاد، تجول افتراضي، إدارة لحظية، وتعاقد إلكتروني', width - 80, 196);

  // Vision Intro
  let y = 320;
  ctx1.fillStyle = '#1D4ED8';
  ctx1.font = '700 22px Cairo, sans-serif';
  ctx1.fillText('01. الرؤية التقنية لشركة CODEX', width - 80, y);
  y += 46;

  ctx1.fillStyle = '#0F172A';
  ctx1.font = '700 34px Cairo, sans-serif';
  ctx1.fillText('إعادة تعريف تسويق وحجز العقارات عبر التوائم الرقمية ثلاثية الأبعاد', width - 80, y);
  y += 52;

  ctx1.fillStyle = '#475569';
  ctx1.font = '400 23px "IBM Plex Sans Arabic", sans-serif';
  y = drawWrappedArabicText(
    ctx1,
    'تجمع منصة أركان المصممة والمطورة بواسطة CODEX بين دقة العرض المعماري بتقنية WebGL وسرعة المعاملات الرقمية الحديثة. يتيح النظام للمستثمرين والباحثين عن السكن استكشاف المخطط العام والتجول داخل الوحدات السكنية بتفاصيلها الداخلية قبل اتخاذ قرار الشراء أو الاستئجار الفوري.',
    width - 80,
    y,
    width - 160,
    38
  );

  y += 40;
  // Vision Pillars Cards
  CODEX_VISION_PILLARS.forEach((pillar) => {
    ctx1.fillStyle = '#F8FAFC';
    ctx1.fillRect(80, y, width - 160, 148);
    ctx1.strokeStyle = '#E2E8F0';
    ctx1.lineWidth = 2;
    ctx1.strokeRect(80, y, width - 160, 148);

    ctx1.fillStyle = '#1D4ED8';
    ctx1.font = '700 24px "IBM Plex Mono", Cairo, sans-serif';
    ctx1.fillText(pillar.index, width - 115, y + 48);

    ctx1.fillStyle = '#0F172A';
    ctx1.font = '700 26px Cairo, sans-serif';
    ctx1.fillText(pillar.title, width - 165, y + 48);

    ctx1.fillStyle = '#475569';
    ctx1.font = '400 20px "IBM Plex Sans Arabic", sans-serif';
    drawWrappedArabicText(ctx1, pillar.description, width - 115, y + 92, width - 230, 32);

    y += 172;
  });

  // Key Platform Metrics
  y += 30;
  ctx1.fillStyle = '#0F172A';
  ctx1.font = '700 28px Cairo, sans-serif';
  ctx1.fillText('02. مؤشرات المحفظة الحالية', width - 80, y);
  y += 35;

  const availableCount = units.filter((u) => u.status === 'متاح').length;
  const reservedCount = units.filter((u) => u.status === 'محجوز').length;
  const totalValue = units.reduce((acc, u) => acc + (u.listingType === 'للبيع' ? u.price : 0), 0);

  const metrics = [
    { label: 'إجمالي الوحدات', value: String(units.length) },
    { label: 'وحدات متاحة الآن', value: String(availableCount) },
    { label: 'وحدات محجوزة', value: String(reservedCount) },
    { label: 'قيمة وحدات التمليك (ج.م)', value: formatCurrency(totalValue) },
  ];

  const boxW = (width - 160 - 60) / 4;
  metrics.forEach((m, idx) => {
    const bx = width - 80 - (idx + 1) * boxW - idx * 20;
    ctx1.fillStyle = '#F8FAFC';
    ctx1.fillRect(bx, y, boxW, 130);
    ctx1.strokeStyle = '#CBD5E1';
    ctx1.strokeRect(bx, y, boxW, 130);

    ctx1.fillStyle = '#0F172A';
    ctx1.font = '700 32px Cairo, sans-serif';
    ctx1.fillText(m.value, bx + boxW - 24, y + 58);

    ctx1.fillStyle = '#64748B';
    ctx1.font = '500 18px "IBM Plex Sans Arabic", sans-serif';
    ctx1.fillText(m.label, bx + boxW - 24, y + 100);
  });

  // Footer page 1
  ctx1.fillStyle = '#94A3B8';
  ctx1.font = '400 18px "IBM Plex Sans Arabic", sans-serif';
  ctx1.fillText('أركان العقارية × CODEX  ·  صفحة 1 من 2', width - 80, height - 55);

  const img1 = c1.toDataURL('image/jpeg', 0.92);
  doc.addImage(img1, 'JPEG', 0, 0, width / 2, height / 2);

  // --- PAGE 2: Featured Units & CODEX Team ---
  doc.addPage([width / 2, height / 2], 'portrait');
  const c2 = document.createElement('canvas');
  c2.width = width;
  c2.height = height;
  const ctx2 = c2.getContext('2d')!;

  ctx2.fillStyle = '#FFFFFF';
  ctx2.fillRect(0, 0, width, height);
  ctx2.direction = 'rtl';
  ctx2.textAlign = 'right';

  let y2 = 90;
  ctx2.fillStyle = '#1D4ED8';
  ctx2.font = '700 22px Cairo, sans-serif';
  ctx2.fillText('03. مختارات من الوحدات السكنية في مصر', width - 80, y2);
  y2 += 48;

  const sampleUnits = units.slice(0, 5);
  sampleUnits.forEach((u) => {
    ctx2.fillStyle = '#F8FAFC';
    ctx2.fillRect(80, y2, width - 160, 128);
    ctx2.strokeStyle = '#E2E8F0';
    ctx2.lineWidth = 2;
    ctx2.strokeRect(80, y2, width - 160, 128);

    ctx2.fillStyle = '#0F172A';
    ctx2.font = '700 24px Cairo, sans-serif';
    ctx2.fillText(`${u.title} (${u.code})`, width - 110, y2 + 44);

    ctx2.fillStyle = '#475569';
    ctx2.font = '400 19px "IBM Plex Sans Arabic", sans-serif';
    ctx2.fillText(
      `${u.city} - ${u.district}  ·  ${u.category}  ·  ${u.areaSqm} م²  ·  ${u.bedrooms} غرف  ·  الحالة: ${u.status}`,
      width - 110,
      y2 + 86
    );

    ctx2.textAlign = 'left';
    ctx2.fillStyle = '#1D4ED8';
    ctx2.font = '700 24px Cairo, sans-serif';
    ctx2.fillText(`${formatCurrency(u.price)} ج.م (${u.listingType})`, 110, y2 + 52);
    ctx2.textAlign = 'right';

    y2 += 148;
  });

  y2 += 40;
  ctx2.fillStyle = '#1D4ED8';
  ctx2.font = '700 22px Cairo, sans-serif';
  ctx2.fillText('04. فريق التطوير والهندسة — شركة CODEX', width - 80, y2);
  y2 += 46;

  CODEX_TEAM.forEach((member) => {
    ctx2.fillStyle = '#FFFFFF';
    ctx2.fillRect(80, y2, width - 160, 118);
    ctx2.strokeStyle = '#E2E8F0';
    ctx2.strokeRect(80, y2, width - 160, 118);

    ctx2.fillStyle = '#0F172A';
    ctx2.font = '700 23px Cairo, sans-serif';
    ctx2.fillText(`${member.name}  —  ${member.role}`, width - 110, y2 + 42);

    ctx2.fillStyle = '#475569';
    ctx2.font = '400 18px "IBM Plex Sans Arabic", sans-serif';
    drawWrappedArabicText(ctx2, member.bio, width - 110, y2 + 78, width - 220, 28);

    y2 += 136;
  });

  ctx2.fillStyle = '#0F172A';
  ctx2.fillRect(80, height - 180, width - 160, 96);
  ctx2.fillStyle = '#FFFFFF';
  ctx2.font = '600 22px Cairo, sans-serif';
  ctx2.fillText('للتواصل وحجز العروض الخاصة: info@codex-arkan.example  ·  +966 11 000 3000', width - 110, height - 122);

  ctx2.fillStyle = '#94A3B8';
  ctx2.font = '400 18px "IBM Plex Sans Arabic", sans-serif';
  ctx2.fillText('أركان العقارية × CODEX  ·  صفحة 2 من 2', width - 80, height - 45);

  const img2 = c2.toDataURL('image/jpeg', 0.92);
  doc.addImage(img2, 'JPEG', 0, 0, width / 2, height / 2);

  doc.save('CODEX-Arkan-RealEstate-Profile.pdf');
}
