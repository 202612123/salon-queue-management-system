import { ServiceItem, BarberProfile, SalonSettings } from '@/types';

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv_haircut',
    nameEn: "Men's Classic Haircut",
    nameGu: 'પુરુષોનું ક્લાસિક હેરકટ',
    durationMinutes: 25,
    priceInr: 250,
    category: 'hair',
  },
  {
    id: 'srv_beard',
    nameEn: 'Beard Trim & Precision Styling',
    nameGu: 'દાઢી ટ્રીમ અને સ્ટાઇલિંગ',
    durationMinutes: 15,
    priceInr: 150,
    category: 'beard',
  },
  {
    id: 'srv_shave',
    nameEn: 'Royal Shave with Hot Towel',
    nameGu: 'રોયલ હોટ ટુવાલ શેવ',
    durationMinutes: 20,
    priceInr: 180,
    category: 'beard',
  },
  {
    id: 'srv_massage',
    nameEn: 'Ayurvedic Head Massage (Champi)',
    nameGu: 'આયુર્વેદિક હેડ મસાજ (ચંપી)',
    durationMinutes: 20,
    priceInr: 300,
    category: 'spa',
  },
  {
    id: 'srv_facial',
    nameEn: 'D-Tan Face Glow Pack',
    nameGu: 'ડી-ટેન ફેસ ગ્લો પેક',
    durationMinutes: 35,
    priceInr: 600,
    category: 'spa',
  },
  {
    id: 'srv_color',
    nameEn: 'Hair Color & Beard Camouflage',
    nameGu: 'હેર કલર અને દાઢી ડાઇ',
    durationMinutes: 45,
    priceInr: 800,
    category: 'color',
  },
];

export const INITIAL_BARBERS: BarberProfile[] = [
  { id: 'barber_ramesh', name: 'Rameshbhai', nameGu: 'રમેશભાઈ', chairNumber: 1, status: 'AVAILABLE' },
  { id: 'barber_amit', name: 'Amit', nameGu: 'અમિત', chairNumber: 2, status: 'AVAILABLE' },
  { id: 'barber_jignesh', name: 'Jignesh', nameGu: 'જીગ્નેશ', chairNumber: 3, status: 'AVAILABLE' },
  { id: 'barber_nilesh', name: 'Nilesh', nameGu: 'નિલેશ', chairNumber: 4, status: 'AVAILABLE' },
];

export const DEFAULT_SALON_SETTINGS: SalonSettings = {
  isOpen: true,
  openTime: '09:00',
  closeTime: '21:00',
  onlineCutoffMinutes: 30,
  gracePeriodMinutes: 10,
  maxQueueCapacity: 30,
};

export const STUDENT_CREDITS = {
  developerName: 'Neha Tadvi',
  studentId: '202612123',
  course: 'MSc IT',
  institute: 'DAU (DAIICT)',
};
