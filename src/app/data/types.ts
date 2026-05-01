export interface Announcement {
  id: number;
  date: string;
  title: string;
  content: string;
  priority: 'high' | 'normal';
}

export interface ScheduleActivity {
  time: string;
  activity: string;
  location: string;
}

export interface DaySchedule {
  day: string;
  activities: ScheduleActivity[];
}

export interface GroupMaterial {
  group: string;
  materials: string[];
  notes?: string;
}

export interface Session {
  name: string;
  dates: string;
  theme: string;
  description: string;
  registered: number;
  capacity: number;
}

export interface Contact {
  name: string;
  role: string;
  email: string;
  phone: string;
  available: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Campus {
  name: string;
  description?: string;
  dining?: string;
  address?: string;
  smallGroupZones?: string;
  contact?: string;
}

export interface Speaker {
  name: string;
  role: string;
  organization: string;
  bio?: string;
  image?: string;
  instagram?: string;
}
