export type ListingType = 'للبيع' | 'للإيجار';
export type UnitStatus = 'متاح' | 'محجوز' | 'مباع';
export type UnitCategory = 'شقة ذكية' | 'بنتهاوس' | 'فيلا مستقلة' | 'دوبلكس';
export type InteriorFinish = 'marble' | 'oak' | 'slate';
export type ModelVariant = 'penthouse' | 'duplex' | 'villa' | 'apartment';

export interface PropertyUnit {
  id: string;
  code: string;
  title: string;
  district: string;
  city: string;
  category: UnitCategory;
  listingType: ListingType;
  status: UnitStatus;
  price: number;
  pricePeriod?: 'إجمالي' | 'سنوياً';
  areaSqm: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  wing: string;
  image: string;
  gallery?: string[];
  description: string;
  features: string[];
  defaultFinish: InteriorFinish;
  modelVariant: ModelVariant;
  masterplanZone: 'tower' | 'villa-east' | 'villa-west';
  towerFloorIndex: number;
  ownerName?: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ReviewRequest {
  id: string;
  requestType: 'بيع عقار' | 'طلب شراء';
  status: 'قيد المراجعة' | 'معتمد' | 'مرفوض';
  submittedBy: string;
  submittedEmail: string;
  submittedPhone: string;
  createdAt: string;
  notes?: string;
  proposedUnit?: PropertyUnit;
  targetUnitId?: string;
  targetUnitTitle?: string;
  contractNumber?: string;
  amountPaid?: number;
}

export interface AlertPreferences {
  enabled: boolean;
  listingType: 'الكل' | ListingType;
  maxBudgetSale: number;
  maxBudgetRent: number;
  preferredCity: string;
  minBedrooms: number;
}

export interface InstantNotification {
  id: string;
  title: string;
  message: string;
  unitId: string;
  timestamp: string;
  read: boolean;
  matchReason: string;
}

export type PaymentMethod = 'mada' | 'card' | 'apple_pay' | 'bank_transfer';
export type BookingMode = 'deposit' | 'full_contract';

export interface BookingRecord {
  id: string;
  unitId: string;
  unitCode: string;
  unitTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  nationalId: string;
  paymentMethod: PaymentMethod;
  bookingMode: BookingMode;
  amountPaid: number;
  contractNumber: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialty: string;
  avatar?: string;
  initials: string;
}

export interface SocialProfile {
  id: string;
  name: string;
  handle: string;
  url: string;
}
