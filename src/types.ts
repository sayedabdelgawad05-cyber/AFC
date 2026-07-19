export type UserRole = 'admin' | 'engineer';

export interface User {
  id: string;
  username: string;
  password?: string; // Kept secure, or used for simulated authentication
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export interface Station {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'Passenger' | 'Depot' | 'Junction';
  progress: number; // 0 to 100
  totalRFIs: number;
  openRFIs: number;
  totalNCRs: number;
  openNCRs: number;
  totalPunches: number;
  openPunches: number;
  delayedTasksCount: number;
}

export interface RFI {
  id: string;
  stationId: string;
  number: string; // e.g., HSR-AFC-RFI-BEA-002
  subject: string;
  status: 'Open' | 'Closed';
  dateRaised: string;
  dateClosed?: string;
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
}

export interface NCR {
  id: string;
  stationId: string;
  number: string; // e.g., HSR-AFC-NCR-BEA-014
  description: string;
  status: 'Open' | 'Closed';
  dateRaised: string;
  dateClosed?: string;
  correctiveAction?: string;
  priority: 'Minor' | 'Major' | 'Critical';
}

export interface PunchItem {
  id: string;
  stationId: string;
  number: string; // e.g., HSR-AFC-PNC-EAL-045
  description: string;
  status: 'Open' | 'Closed';
  category: 'A' | 'B' | 'C'; // A: Prevent start, B: Handover, C: Post-handover
  dateRaised: string;
  dateResolved?: string;
  assignee: string;
}

export interface PhotoAttachment {
  id: string;
  url: string; // Base64 or ObjectURL
  description: string;
  timestamp: string;
  analyzed?: boolean;
}

export interface InspectionReport {
  id: string;
  title: string;
  stationId: string;
  date: string;
  type: 'Site Inspection' | 'Installation Progress';
  engineerName: string;
  notesRaw: string; // Arabic notes written or spoken
  notesEn: {
    technicalNotes: string;
    identifiedIssues: string;
    correctiveActions: string;
    recommendations: string;
    followUpPlan: string;
  };
  photos: PhotoAttachment[];
  status: 'Draft' | 'Submitted';
  syncStatus: 'synced' | 'pending';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
