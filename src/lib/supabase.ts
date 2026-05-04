import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://gtbdmgqixwjfteqstvgz.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YmRtZ3FpeHdqZnRlcXN0dmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTIxMDYsImV4cCI6MjA5MzIyODEwNn0.HrTt2OPdPWXenvzuUZ3lbdIiPE2IRX3pxK50PXcD3u4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Announcement {
  id: string;
  date: string;
  title: string;
  content: string;
  content_html?: string;
  scheduled_at?: string | null;
  priority: 'high' | 'normal';
  created_at?: string;
}

export interface AnnouncementAttachment {
  id: number;
  announcement_id: string;
  file_url: string;
  file_name: string;
  file_type: 'image' | 'pdf';
  created_at?: string;
}

export interface AnnouncementWithAttachments extends Announcement {
  announcement_attachments: AnnouncementAttachment[];
}

export interface ScheduleItem {
  id: number;
  campus: string;
  day: string;
  day_order: number;
  time: string;
  activity: string;
  location: string;
  maps_url: string;
  sort_order: number;
  created_at?: string;
}

export interface Speaker {
  id: number;
  name: string;
  role: string;
  organization: string;
  bio?: string;
  image?: string;
  instagram?: string;
  sort_order: number;
  created_at?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  created_at?: string;
}

export interface CampInfo {
  id: number;
  key: string;
  value: string;
  updated_at?: string;
}

export interface Tournament {
  id: number;
  day: string;
  day_order: number;
  activity: string;
  sort_order: number;
  updated_at?: string;
}

export interface Elective {
  id: number;
  day: string;
  day_order: number;
  time_slot: string;
  slot_order: number;
  theme: string;
  theme_order: number;
  title: string;
  speaker: string;
  location: string;
  maps_url: string;
  updated_at?: string;
}

export interface Theme {
  id: number;
  day: string;
  theme_name: string;
  sort_order: number;
  updated_at?: string;
}

export interface GroupCardContent {
  id: string;
  day_number: number;
  card_number: number;
  label: string;
  content: string;
  content_color: string;
  label_color: string;
  bg_color: string;
  sort_order: number;
  created_at?: string;
}

export interface CampusTime {
  id: number;
  campus_name: string;
  location: string;       // campus time location
  neighborhood: string;
  dining: string;
  male_dorms: string;
  female_dorms: string;
  male_sg_zones: string;
  female_sg_zones: string;
  small_group_document_url: string;
  small_group_document_name: string;
  small_group_document_path: string;
  updated_at?: string;
}
