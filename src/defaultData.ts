import { Station, RFI, NCR, PunchItem, User } from './types';

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    name: 'Moustafa El-Shenawy',
    email: 'm.elshenawy@siemens.com',
    role: 'admin',
    phone: '+20 100 123 4567',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
  },
  {
    id: 'usr-2',
    username: 'ahmed',
    name: 'Ahmed Kamel',
    email: 'ahmed.kamel@siemens.com',
    role: 'engineer',
    phone: '+20 111 987 6543',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'usr-3',
    username: 'sayed',
    name: 'Sayed Abdelgawad',
    email: 'sayed.abdelgawad@siemens.com',
    role: 'admin',
    phone: '+20 122 345 6789',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  }
];

export const DEFAULT_STATIONS: Station[] = [
  {
    id: 'st-bea',
    nameAr: 'برج العرب',
    nameEn: 'Borg El Arab',
    type: 'Junction',
    progress: 68,
    totalRFIs: 12,
    openRFIs: 3,
    totalNCRs: 5,
    openNCRs: 2,
    totalPunches: 18,
    openPunches: 6,
    delayedTasksCount: 4
  },
  {
    id: 'st-eal',
    nameAr: 'العلمين',
    nameEn: 'El Alamein',
    type: 'Passenger',
    progress: 55,
    totalRFIs: 8,
    openRFIs: 2,
    totalNCRs: 3,
    openNCRs: 1,
    totalPunches: 12,
    openPunches: 4,
    delayedTasksCount: 2
  },
  {
    id: 'st-asx',
    nameAr: 'العين السخنة',
    nameEn: 'Ain Sokhna',
    type: 'Passenger',
    progress: 45,
    totalRFIs: 15,
    openRFIs: 5,
    totalNCRs: 8,
    openNCRs: 4,
    totalPunches: 24,
    openPunches: 11,
    delayedTasksCount: 5
  },
  {
    id: 'st-oct',
    nameAr: 'أكتوبر',
    nameEn: 'October Depot',
    type: 'Depot',
    progress: 38,
    totalRFIs: 22,
    openRFIs: 8,
    totalNCRs: 11,
    openNCRs: 6,
    totalPunches: 35,
    openPunches: 19,
    delayedTasksCount: 9
  },
  {
    id: 'st-alx',
    nameAr: 'الإسكندرية',
    nameEn: 'Alexandria',
    type: 'Passenger',
    progress: 62,
    totalRFIs: 9,
    openRFIs: 1,
    totalNCRs: 4,
    openNCRs: 1,
    totalPunches: 15,
    openPunches: 3,
    delayedTasksCount: 1
  },
  {
    id: 'st-mat',
    nameAr: 'مرسى مطروح',
    nameEn: 'Marsa Matrouh',
    type: 'Passenger',
    progress: 25,
    totalRFIs: 6,
    openRFIs: 4,
    totalNCRs: 2,
    openNCRs: 2,
    totalPunches: 8,
    openPunches: 5,
    delayedTasksCount: 3
  }
];

export const DEFAULT_RFIS: RFI[] = [
  {
    id: 'rfi-bea-01',
    stationId: 'st-bea',
    number: 'HSR-AFC-RFI-BEA-001',
    subject: 'AFC Gate Array Cabling Containment Approval',
    status: 'Closed',
    dateRaised: '2026-06-01',
    dateClosed: '2026-06-10',
    priority: 'High',
    assignee: 'Sayed Abdelgawad'
  },
  {
    id: 'rfi-bea-02',
    stationId: 'st-bea',
    number: 'HSR-AFC-RFI-BEA-002',
    subject: 'TVM Outdoor Canopy Waterproofing Interface',
    status: 'Open',
    dateRaised: '2026-07-05',
    priority: 'Medium',
    assignee: 'Ahmed Kamel'
  },
  {
    id: 'rfi-bea-03',
    stationId: 'st-bea',
    number: 'HSR-AFC-RFI-BEA-003',
    subject: 'Earthing Connection Points to Station Grounding Grid',
    status: 'Open',
    dateRaised: '2026-07-10',
    priority: 'High',
    assignee: 'Sayed Abdelgawad'
  },
  {
    id: 'rfi-eal-01',
    stationId: 'st-eal',
    number: 'HSR-AFC-RFI-EAL-001',
    subject: 'Fire Alarm System Signal Interface to AFC Gates for Emergency Release',
    status: 'Open',
    dateRaised: '2026-07-08',
    priority: 'High',
    assignee: 'Moustafa El-Shenawy'
  },
  {
    id: 'rfi-eal-02',
    stationId: 'st-eal',
    number: 'HSR-AFC-RFI-EAL-002',
    subject: 'Local AFC Server Room Power Distribution Board Hook-up',
    status: 'Closed',
    dateRaised: '2026-06-20',
    dateClosed: '2026-06-25',
    priority: 'Medium',
    assignee: 'Ahmed Kamel'
  },
  {
    id: 'rfi-oct-01',
    stationId: 'st-oct',
    number: 'HSR-AFC-RFI-OCT-001',
    subject: 'Depot Gate Array Foundation Plinth Layout',
    status: 'Open',
    dateRaised: '2026-07-02',
    priority: 'High',
    assignee: 'Sayed Abdelgawad'
  }
];

export const DEFAULT_NCRS: NCR[] = [
  {
    id: 'ncr-bea-01',
    stationId: 'st-bea',
    number: 'HSR-AFC-NCR-BEA-001',
    description: 'AFC Server Room temperature exceeds 28°C due to non-functional primary AC split unit, endangering hardware during commissioning.',
    status: 'Open',
    dateRaised: '2026-07-04',
    correctiveAction: 'Coordinating with MEP sub-contractor to test and charge primary AC unit. Installing backup fan temporarily.',
    priority: 'Major'
  },
  {
    id: 'ncr-bea-02',
    stationId: 'st-bea',
    number: 'HSR-AFC-NCR-BEA-002',
    description: 'Use of non-approved anchor bolts for TVM-01 foundation installation.',
    status: 'Closed',
    dateRaised: '2026-06-12',
    dateClosed: '2026-06-18',
    correctiveAction: 'Replaced all anchor bolts with approved Hilti HAS-U bolts and verified tensile strength.',
    priority: 'Minor'
  },
  {
    id: 'ncr-alx-01',
    stationId: 'st-alx',
    number: 'HSR-AFC-NCR-ALX-001',
    description: 'Incorrect cable tagging and labeling on Main Distribution Frame (MDF) fibers.',
    status: 'Open',
    dateRaised: '2026-07-11',
    correctiveAction: 'Re-printing labels using approved Siemens tagging standard and scheduling re-termination testing.',
    priority: 'Minor'
  },
  {
    id: 'ncr-asx-01',
    stationId: 'st-asx',
    number: 'HSR-AFC-NCR-ASX-001',
    description: 'Earthing conductor resistance test failed for Gate Array B. Readings at 4.2 Ohms (Siemens Spec: < 1.0 Ohm).',
    status: 'Open',
    dateRaised: '2026-07-06',
    correctiveAction: 'Add additional copper ground rods and apply soil-enhancing compound to achieve < 1.0 Ohm resistance.',
    priority: 'Critical'
  }
];

export const DEFAULT_PUNCH_ITEMS: PunchItem[] = [
  {
    id: 'pnc-bea-01',
    stationId: 'st-bea',
    number: 'HSR-AFC-PNC-BEA-001',
    description: 'TVM-01 casing has a paint scratch on the right side panel during unboxing.',
    status: 'Open',
    category: 'C',
    dateRaised: '2026-07-01',
    assignee: 'Ahmed Kamel'
  },
  {
    id: 'pnc-bea-02',
    stationId: 'st-bea',
    number: 'HSR-AFC-PNC-BEA-002',
    description: 'Gate 03 barrier glass alignment is off by 4mm, preventing smooth retracting motion.',
    status: 'Open',
    category: 'B',
    dateRaised: '2026-07-03',
    assignee: 'Sayed Abdelgawad'
  },
  {
    id: 'pnc-bea-03',
    stationId: 'st-bea',
    number: 'HSR-AFC-PNC-BEA-003',
    description: 'Cat-6A LAN cable between switch port 14 and TVM-03 is not certified (fluke test report missing).',
    status: 'Open',
    category: 'A',
    dateRaised: '2026-07-05',
    assignee: 'Ahmed Kamel'
  },
  {
    id: 'pnc-eal-01',
    stationId: 'st-eal',
    number: 'HSR-AFC-PNC-EAL-001',
    description: 'Silicon sealant around base of Passenger Gate Array A is uneven and contains air pockets.',
    status: 'Open',
    category: 'C',
    dateRaised: '2026-07-10',
    assignee: 'Ahmed Kamel'
  },
  {
    id: 'pnc-eal-02',
    stationId: 'st-eal',
    number: 'HSR-AFC-PNC-EAL-002',
    description: 'Ground connection cable in local UPS cabinet is loose.',
    status: 'Open',
    category: 'A',
    dateRaised: '2026-07-12',
    assignee: 'Sayed Abdelgawad'
  }
];
