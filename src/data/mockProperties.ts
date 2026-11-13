import {
  AlertPreferences,
  InstantNotification,
  PropertyUnit,
  ReviewRequest,
  SocialProfile,
  TeamMember,
} from '../types/realEstate';

import penthouseImg from '../assets/images/property_penthouse_exterior_1794608760741.jpg';
import towerImg from '../assets/images/property_tower_residence_1794608761673.jpg';
import villaImg from '../assets/images/property_garden_villa_1794608762696.jpg';
import leadArchitectImg from '../assets/images/team_lead_architect_1794608763295.jpg';
import designDirectorImg from '../assets/images/team_design_director_1794608762398.jpg';

export interface EgyptRegion {
  id: string;
  city: string;
  district: string;
  label: string;
}

export const EGYPT_REGIONS: EgyptRegion[] = [
  { id: 'reg-01', city: 'القاهرة الجديدة', district: 'التجمع الخامس', label: 'القاهرة الجديدة · التجمع الخامس' },
  { id: 'reg-02', city: 'العاصمة الإدارية', district: 'الحي الدبلوماسي R7', label: 'العاصمة الإدارية · الحي الدبلوماسي R7' },
  { id: 'reg-03', city: 'الشيخ زايد', district: 'بيفرلي هيلز', label: 'الشيخ زايد · بيفرلي هيلز' },
  { id: 'reg-04', city: '6 أكتوبر', district: 'التوسعات الشمالية', label: '6 أكتوبر · التوسعات الشمالية' },
  { id: 'reg-05', city: 'المعادي', district: 'دجلة المعادي', label: 'المعادي · دجلة' },
  { id: 'reg-06', city: 'الزمالك', district: 'كورنيش النيل', label: 'الزمالك · كورنيش النيل' },
  { id: 'reg-07', city: 'مصر الجديدة', district: 'الكوربة', label: 'مصر الجديدة · الكوربة' },
  { id: 'reg-08', city: 'مدينة نصر', district: 'المنطقة السادسة', label: 'مدينة نصر · المنطقة السادسة' },
  { id: 'reg-09', city: 'مدينتي', district: 'الحدائق المركزية', label: 'مدينتي · الحدائق المركزية' },
  { id: 'reg-10', city: 'الرحاب', district: 'المرحلة العاشرة', label: 'الرحاب · المرحلة العاشرة' },
  { id: 'reg-11', city: 'مدينة الشروق', district: 'حي النخيل', label: 'مدينة الشروق · حي النخيل' },
  { id: 'reg-12', city: 'المستقبل سيتي', district: 'بوليفارد المستقبل', label: 'المستقبل سيتي · البوليفارد' },
  { id: 'reg-13', city: 'المهندسين', district: 'شارع جامعة الدول', label: 'المهندسين · جامعة الدول' },
  { id: 'reg-14', city: 'الدقي', district: 'نادي الصيد', label: 'الدقي · محيط نادي الصيد' },
  { id: 'reg-15', city: 'حدائق الأهرام', district: 'البوابة الأولى', label: 'حدائق الأهرام · البوابة الأولى' },
  { id: 'reg-16', city: 'المقطم', district: 'الهضبة العليا', label: 'المقطم · الهضبة العليا' },
  { id: 'reg-17', city: 'الساحل الشمالي', district: 'سيدي عبد الرحمن', label: 'الساحل الشمالي · سيدي عبد الرحمن' },
  { id: 'reg-18', city: 'العلمين الجديدة', district: 'الأبراج الشاطئية', label: 'العلمين الجديدة · الأبراج الشاطئية' },
  { id: 'reg-19', city: 'العين السخنة', district: 'جبل الجلالة', label: 'العين السخنة · هضبة الجلالة' },
  { id: 'reg-20', city: 'الغردقة', district: 'الجونة', label: 'الغردقة · الجونة' },
  { id: 'reg-21', city: 'الإسكندرية', district: 'سموحة', label: 'الإسكندرية · سموحة' },
  { id: 'reg-22', city: 'الإسكندرية', district: 'سان ستيفانو', label: 'الإسكندرية · سان ستيفانو' },
  { id: 'reg-23', city: 'المنصورة الجديدة', district: 'الكورنيش الشرقي', label: 'المنصورة الجديدة · الكورنيش' },
  { id: 'reg-24', city: 'شرم الشيخ', district: 'خليج نعمة', label: 'شرم الشيخ · خليج نعمة' },
];

const EXTRA_REGION_UNITS: PropertyUnit[] = [
  {
    id: 'unit-101',
    code: 'EG-NC-501',
    title: 'بنتهاوس سكاي لاين البانورامي',
    district: 'التجمع الخامس',
    city: 'القاهرة الجديدة',
    category: 'بنتهاوس',
    listingType: 'للبيع',
    status: 'متاح',
    price: 14800000,
    pricePeriod: 'إجمالي',
    areaSqm: 365,
    bedrooms: 4,
    bathrooms: 5,
    floor: 12,
    wing: 'البرج الشمالي',
    image: penthouseImg,
    gallery: [penthouseImg, towerImg],
    description:
      'بنتهاوس مزدوج الارتفاع في قلب التجمع الخامس يضم تراساً خاصاً بمسبح لا متناهي وسقفاً سماوياً زجاجياً مع نظام منزل ذكي.',
    features: ['مسبح خاص على التراس', 'سقف زجاجي مزدوج الارتفاع', 'مصعد داخلي خاص', 'منزل ذكي متكامل'],
    defaultFinish: 'marble',
    modelVariant: 'penthouse',
    masterplanZone: 'tower',
    towerFloorIndex: 5,
    updatedAt: 'منذ 10 دقائق',
  },
  {
    id: 'unit-102',
    code: 'EG-AC-702',
    title: 'جناح الأفق الدبلوماسي',
    district: 'الحي الدبلوماسي R7',
    city: 'العاصمة الإدارية',
    category: 'شقة ذكية',
    listingType: 'للبيع',
    status: 'متاح',
    price: 6850000,
    pricePeriod: 'إجمالي',
    areaSqm: 215,
    bedrooms: 3,
    bathrooms: 3,
    floor: 9,
    wing: 'البرج الشمالي',
    image: towerImg,
    gallery: [towerImg, penthouseImg],
    description:
      'شقة ذكية بإطلالة مباشرة على النهر الأخضر في العاصمة الإدارية الجديدة، تشطيبات رخامية وأنظمة تكييف مركزي.',
    features: ['إطلالة على النهر الأخضر', 'مطبخ أوروبي مجهز', 'موقفان تحت الأرض', 'دخول ذكي بالبصمة'],
    defaultFinish: 'oak',
    modelVariant: 'apartment',
    masterplanZone: 'tower',
    towerFloorIndex: 4,
    updatedAt: 'منذ 25 دقيقة',
  },
  {
    id: 'unit-103',
    code: 'EG-SZ-304',
    title: 'فيلا الترافرتين والحديقة الخاصة',
    district: 'بيفرلي هيلز',
    city: 'الشيخ زايد',
    category: 'فيلا مستقلة',
    listingType: 'للبيع',
    status: 'متاح',
    price: 22400000,
    pricePeriod: 'إجمالي',
    areaSqm: 520,
    bedrooms: 5,
    bathrooms: 6,
    floor: 1,
    wing: 'الحي الشرقي للفلل',
    image: villaImg,
    gallery: [villaImg, penthouseImg],
    description:
      'فيلا مستقلة في الشيخ زايد مبنية من الحجر الجيري الأبيض تحيط بها حديقة خاصة بأشجار الزيتون وفناء هادئ بمسبح خارجي.',
    features: ['حديقة خاصة ومسبح', 'مجلس ضيوف زجاجي', 'غرفة مربية وسائق', 'طاقة شمسية مدمجة'],
    defaultFinish: 'oak',
    modelVariant: 'villa',
    masterplanZone: 'villa-east',
    towerFloorIndex: 0,
    updatedAt: 'منذ ساعة',
  },
  {
    id: 'unit-104',
    code: 'EG-ZM-118',
    title: 'دوبلكس كورنيش الزمالك الزجاجي',
    district: 'كورنيش النيل',
    city: 'الزمالك',
    category: 'دوبلكس',
    listingType: 'للبيع',
    status: 'متاح',
    price: 19200000,
    pricePeriod: 'إجمالي',
    areaSqm: 290,
    bedrooms: 4,
    bathrooms: 4,
    floor: 11,
    wing: 'البرج الشمالي',
    image: towerImg,
    gallery: [towerImg, villaImg],
    description:
      'دوبلكس فاخر بسلم معماري عائم وميزانين علوي مطل على النيل مباشرة في أرقى شوارع الزمالك.',
    features: ['سلم داخلي معماري', 'إطلالة بانورامية على النيل', 'مطبخ رئيسي وتحاضيري', 'مكتب منزلي هادئ'],
    defaultFinish: 'slate',
    modelVariant: 'duplex',
    masterplanZone: 'tower',
    towerFloorIndex: 3,
    updatedAt: 'منذ ساعتين',
  },
  {
    id: 'unit-105',
    code: 'EG-AL-801',
    title: 'شقة الأبراج الشاطئية بالعلمين',
    district: 'الأبراج الشاطئية',
    city: 'العلمين الجديدة',
    category: 'شقة ذكية',
    listingType: 'للبيع',
    status: 'متاح',
    price: 11500000,
    pricePeriod: 'إجمالي',
    areaSqm: 185,
    bedrooms: 3,
    bathrooms: 3,
    floor: 16,
    wing: 'البرج الشمالي',
    image: penthouseImg,
    gallery: [penthouseImg, towerImg],
    description:
      'وحدة ساحلية بإطلالة مباشرة على البحر المتوسط وبحيرات العلمين، جاهزة للتسليم الفوري بتشطيب فندقي.',
    features: ['إطلالة بحرية مباشرة', 'شاطئ خاص للسكان', 'تكييف مركزي موفر للطاقة', 'تشطيب فندقي كامل'],
    defaultFinish: 'marble',
    modelVariant: 'penthouse',
    masterplanZone: 'tower',
    towerFloorIndex: 2,
    updatedAt: 'منذ 3 ساعات',
  },
  {
    id: 'unit-106',
    code: 'EG-MD-205',
    title: 'فيلا حدائق المعادي الهادئة',
    district: 'دجلة المعادي',
    city: 'المعادي',
    category: 'فيلا مستقلة',
    listingType: 'للإيجار',
    status: 'محجوز',
    price: 960000,
    pricePeriod: 'سنوياً',
    areaSqm: 440,
    bedrooms: 4,
    bathrooms: 5,
    floor: 1,
    wing: 'الحي الغربي للفلل',
    image: villaImg,
    gallery: [villaImg, towerImg],
    description:
      'فيلا عائلية محاطة بالأشجار في قلب دجلة المعادي بواجهة بيضاء نظيفة ومجلس زجاجي مطل على الحديقة الخلفية.',
    features: ['حديقة خلفية خاصة', 'قريبة من المدارس الدولية', 'كراج خاص لسيارتين', 'أمن 24 ساعة'],
    defaultFinish: 'oak',
    modelVariant: 'villa',
    masterplanZone: 'villa-west',
    towerFloorIndex: 0,
    updatedAt: 'أمس',
  },
];

// Generate authentic sale units for the remaining 18+ Egyptian regions so 24 regions in Egypt all have live listings
const REMAINING_REGION_BLUEPRINTS: Array<{
  regionIdx: number;
  title: string;
  category: PropertyUnit['category'];
  listingType: PropertyUnit['listingType'];
  price: number;
  areaSqm: number;
  bedrooms: number;
  floor: number;
  variant: PropertyUnit['modelVariant'];
  finish: PropertyUnit['defaultFinish'];
  img: string;
}> = [
  { regionIdx: 3, title: 'دوبلكس التوسعات الشمالية المضيء', category: 'دوبلكس', listingType: 'للبيع', price: 7900000, areaSqm: 255, bedrooms: 3, floor: 5, variant: 'duplex', finish: 'oak', img: towerImg },
  { regionIdx: 6, title: 'شقة تراثية حديثة بالكوربة', category: 'شقة ذكية', listingType: 'للبيع', price: 8400000, areaSqm: 210, bedrooms: 3, floor: 4, variant: 'apartment', finish: 'marble', img: towerImg },
  { regionIdx: 7, title: 'شقة تنفيذية بالمنطقة السادسة', category: 'شقة ذكية', listingType: 'للبيع', price: 4650000, areaSqm: 175, bedrooms: 3, floor: 7, variant: 'apartment', finish: 'slate', img: towerImg },
  { regionIdx: 8, title: 'فيلا جاردن سيتي مدينتي', category: 'فيلا مستقلة', listingType: 'للبيع', price: 16800000, areaSqm: 390, bedrooms: 4, floor: 1, variant: 'villa', finish: 'oak', img: villaImg },
  { regionIdx: 9, title: 'شقة حدائق الرحاب الذكية', category: 'شقة ذكية', listingType: 'للبيع', price: 5400000, areaSqm: 168, bedrooms: 3, floor: 3, variant: 'apartment', finish: 'oak', img: towerImg },
  { regionIdx: 10, title: 'فيلا حي النخيل بالشروق', category: 'فيلا مستقلة', listingType: 'للبيع', price: 11200000, areaSqm: 340, bedrooms: 4, floor: 1, variant: 'villa', finish: 'marble', img: villaImg },
  { regionIdx: 11, title: 'دوبلكس بوليفارد المستقبل سيتي', category: 'دوبلكس', listingType: 'للبيع', price: 8250000, areaSqm: 245, bedrooms: 3, floor: 6, variant: 'duplex', finish: 'marble', img: penthouseImg },
  { regionIdx: 12, title: 'بنتهاوس جامعة الدول العربية', category: 'بنتهاوس', listingType: 'للبيع', price: 12900000, areaSqm: 310, bedrooms: 4, floor: 14, variant: 'penthouse', finish: 'slate', img: penthouseImg },
  { regionIdx: 13, title: 'شقة محيط نادي الصيد بالدقي', category: 'شقة ذكية', listingType: 'للإيجار', price: 420000, areaSqm: 195, bedrooms: 3, floor: 6, variant: 'apartment', finish: 'oak', img: towerImg },
  { regionIdx: 14, title: 'دوبلكس البوابة الأولى بحدائق الأهرام', category: 'دوبلكس', listingType: 'للبيع', price: 4150000, areaSqm: 230, bedrooms: 3, floor: 3, variant: 'duplex', finish: 'oak', img: towerImg },
  { regionIdx: 15, title: 'بنتهاوس الهضبة العليا بالمقطم', category: 'بنتهاوس', listingType: 'للبيع', price: 6950000, areaSqm: 270, bedrooms: 3, floor: 8, variant: 'penthouse', finish: 'marble', img: penthouseImg },
  { regionIdx: 16, title: 'فيلا سيدي عبد الرحمن الشاطئية', category: 'فيلا مستقلة', listingType: 'للبيع', price: 28500000, areaSqm: 470, bedrooms: 5, floor: 1, variant: 'villa', finish: 'marble', img: villaImg },
  { regionIdx: 18, title: 'شاليه هضبة الجلالة البانورامي', category: 'شقة ذكية', listingType: 'للبيع', price: 5900000, areaSqm: 160, bedrooms: 2, floor: 4, variant: 'penthouse', finish: 'marble', img: penthouseImg },
  { regionIdx: 19, title: 'فيلا لاجون الجونة الخاصة', category: 'فيلا مستقلة', listingType: 'للبيع', price: 24900000, areaSqm: 410, bedrooms: 4, floor: 1, variant: 'villa', finish: 'oak', img: villaImg },
  { regionIdx: 20, title: 'شقة سموحة السكنية الراقية', category: 'شقة ذكية', listingType: 'للبيع', price: 5250000, areaSqm: 190, bedrooms: 3, floor: 8, variant: 'apartment', finish: 'slate', img: towerImg },
  { regionIdx: 21, title: 'جناح سان ستيفانو المطل على البحر', category: 'بنتهاوس', listingType: 'للبيع', price: 15600000, areaSqm: 295, bedrooms: 4, floor: 15, variant: 'penthouse', finish: 'marble', img: penthouseImg },
  { regionIdx: 22, title: 'دوبلكس المنصورة الجديدة البحري', category: 'دوبلكس', listingType: 'للبيع', price: 6100000, areaSqm: 240, bedrooms: 3, floor: 5, variant: 'duplex', finish: 'oak', img: towerImg },
  { regionIdx: 23, title: 'فيلا خليج نعمة السياحية', category: 'فيلا مستقلة', listingType: 'للبيع', price: 17400000, areaSqm: 380, bedrooms: 4, floor: 1, variant: 'villa', finish: 'oak', img: villaImg },
];

const GENERATED_EGYPT_UNITS: PropertyUnit[] = REMAINING_REGION_BLUEPRINTS.map((bp, i) => {
  const reg = EGYPT_REGIONS[bp.regionIdx];
  return {
    id: `unit-eg-${i + 201}`,
    code: `EG-${100 + bp.regionIdx}-${i + 1}`,
    title: bp.title,
    district: reg.district,
    city: reg.city,
    category: bp.category,
    listingType: bp.listingType,
    status: i === 14 ? 'مباع' : 'متاح',
    price: bp.price,
    pricePeriod: bp.listingType === 'للإيجار' ? 'سنوياً' : 'إجمالي',
    areaSqm: bp.areaSqm,
    bedrooms: bp.bedrooms,
    bathrooms: Math.max(2, bp.bedrooms),
    floor: bp.floor,
    wing: bp.category === 'فيلا مستقلة' ? 'الحي الشرقي للفلل' : 'البرج الشمالي',
    image: bp.img,
    gallery: [bp.img, towerImg],
    description: `وحدة معمارية حديثة في ${reg.city} (${reg.district}) تتميز بمساحات مشرقة وإطلالات مفتوحة وتشطيبات قابلة للتخصيص داخل الجولة ثلاثية الأبعاد.`,
    features: [
      `موقع مميز في ${reg.district}`,
      'جاهزة للجولة ثلاثية الأبعاد 3D',
      'تعاقد ودفع إلكتروني فوري',
      'تشطيبات فاخرة معزولة حرارياً',
    ],
    defaultFinish: bp.finish,
    modelVariant: bp.variant,
    masterplanZone: bp.category === 'فيلا مستقلة' ? 'villa-east' : 'tower',
    towerFloorIndex: (i + 1) % 6,
    updatedAt: 'متاح اليوم',
  };
});

export const INITIAL_UNITS: PropertyUnit[] = [
  ...EXTRA_REGION_UNITS,
  ...GENERATED_EGYPT_UNITS,
];

export const INITIAL_REVIEW_REQUESTS: ReviewRequest[] = [
  {
    id: 'rev-1',
    requestType: 'بيع عقار',
    status: 'قيد المراجعة',
    submittedBy: 'أحمد محمود حسن',
    submittedEmail: 'ahmed.hassan@example.com',
    submittedPhone: '01012345678',
    createdAt: 'اليوم · 11:20 ص',
    notes: 'شقة تشطيب سوبر لوكس جاهزة للسكن الفوري في الشروق.',
    proposedUnit: {
      id: 'unit-pending-1',
      code: 'USR-EG-901',
      title: 'شقة كمبوند البروج المشرقة',
      district: 'حي النخيل',
      city: 'مدينة الشروق',
      category: 'شقة ذكية',
      listingType: 'للبيع',
      status: 'متاح',
      price: 4950000,
      pricePeriod: 'إجمالي',
      areaSqm: 185,
      bedrooms: 3,
      bathrooms: 3,
      floor: 4,
      wing: 'طرح ملاك مباشر',
      image: towerImg,
      gallery: [towerImg],
      description: 'وحدة مضافة من المالك للمراجعة والنشر في مدينة الشروق بتشطيب فاخر.',
      features: ['تسليم فوري', 'حصة في الجراج', 'أمن 24 ساعة'],
      defaultFinish: 'oak',
      modelVariant: 'apartment',
      masterplanZone: 'tower',
      towerFloorIndex: 1,
      ownerName: 'أحمد محمود حسن',
      updatedAt: 'قيد المراجعة',
    },
  },
];

export const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  enabled: true,
  listingType: 'الكل',
  maxBudgetSale: 16000000,
  maxBudgetRent: 1000000,
  preferredCity: 'الكل',
  minBedrooms: 2,
};

export const INITIAL_NOTIFICATIONS: InstantNotification[] = [
  {
    id: 'notif-1',
    title: 'عرض جديد مطابق لتفضيلاتك',
    message: 'تم طرح "بنتهاوس سكاي لاين البانورامي" في التجمع الخامس بالقاهرة الجديدة.',
    unitId: 'unit-101',
    timestamp: 'منذ 10 دقائق',
    read: false,
    matchReason: 'يطابق حد الميزانية والغرف المطلوبة',
  },
  {
    id: 'notif-2',
    title: 'وحدة مميزة في العلمين الجديدة',
    message: 'أصبحت "شقة الأبراج الشاطئية بالعلمين" متاحة للجولة ثلاثية الأبعاد والحجز.',
    unitId: 'unit-105',
    timestamp: 'منذ ساعتين',
    read: true,
    matchReason: 'ضمن قائمة المناطق الساحلية المفضلة',
  },
];

export const CODEX_TEAM: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'م. طارق المنصور',
    role: 'المؤسس ومهندس أنظمة 3D الرئيسية',
    specialty: 'WebGL & Digital Twins',
    bio: 'يقود تطوير محرك العرض المعماري ثلاثي الأبعاد في CODEX لتقديم جولات افتراضية فورية بدقة فيزيائية داخل المتصفح دون إضافات.',
    avatar: leadArchitectImg,
    initials: 'طم',
  },
  {
    id: 'tm-2',
    name: 'د. سارة العتيبي',
    role: 'مديرة تصميم الواجهات المكانية',
    specialty: 'Spatial UX & Architecture',
    bio: 'متخصصة في دمج التجربة المعمارية البيضاء مع واجهات التحكم اللحظية لتبسيط رحلة استكشاف العقار وحجزه في دقائق.',
    avatar: designDirectorImg,
    initials: 'سع',
  },
  {
    id: 'tm-3',
    name: 'م. كريم الزهراني',
    role: 'رئيس هندسة المدفوعات والعقود الذكية',
    specialty: 'FinTech & E-Contracting',
    bio: 'صمم منظومة التكامل الإلكتروني لبوابات الدفع وإصدار عقود الحجز الفورية مع مزامنة لحظية لحالة المخزون العقاري.',
    initials: 'كز',
  },
  {
    id: 'tm-4',
    name: 'م. نورة القحطاني',
    role: 'قائدة الذكاء التفاعلي والتنبيهات',
    specialty: 'Smart Matching & Support',
    bio: 'تشرف على محرك مطابقة التفضيلات اللحظية والمساعد التفاعلي على مدار الساعة لضمان وصول كل عميل لوحدته المثالية.',
    initials: 'نق',
  },
];

export const CODEX_VISION_PILLARS = [
  {
    index: '01',
    title: 'التوأم الرقمي الفوري في المتصفح',
    description:
      'بناء مجسمات معمارية ثلاثية الأبعاد بإضاءة فيزيائية واقعية تتيح للعميل فحص التفاصيل وتغيير الألوان والأثاث من أي جهاز.',
  },
  {
    index: '02',
    title: 'تزامن لحظي بين الإدارة والواجهة',
    description:
      'أي تعديل في حالة الوحدة أو اعتماد طلب بيع أو شراء من لوحة الإدارة ينعكس فوراً في المجسم ثلاثي الأبعاد والكتالوج.',
  },
  {
    index: '03',
    title: 'تعاقد رقمي آمن بدون احتكاك',
    description:
      'اختصار أسابيع من المعاملات الورقية إلى تجربة دفع وحجز إلكتروني موثقة تصدر رقم عقدك وترسل طلب المراجعة خلال ثوانٍ.',
  },
];

export const SOCIAL_PROFILES: SocialProfile[] = [
  { id: 'x', name: 'X (تويتر)', handle: '@CODEX_PropTech', url: 'https://x.com' },
  { id: 'linkedin', name: 'لينكدإن', handle: 'CODEX Spatial Systems', url: 'https://linkedin.com' },
  { id: 'instagram', name: 'إنستغرام', handle: '@codex.arkan3d', url: 'https://instagram.com' },
  { id: 'youtube', name: 'يوتيوب', handle: 'CODEX Architectural 3D', url: 'https://youtube.com' },
  { id: 'github', name: 'جيت هب', handle: 'github.com/codex-studio', url: 'https://github.com' },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG').format(amount);
}
