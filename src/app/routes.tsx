import { Home, Calendar, Users, Map, Info, Phone, Bell, HelpCircle, Building2, Trophy } from 'lucide-react';
import { createBrowserRouter, Navigate } from 'react-router';
import { DashboardLayout } from './components/dashboard-layout';
import { HomePage } from './pages/home';
import { SchedulePage } from './pages/schedule';
import { GroupMaterialsPage } from './pages/group-materials';
import { CampusMapPage } from './pages/campus-map';
import { SessionInfoPage } from './pages/session-info';
import { ContactsPage } from './pages/contacts';
import { AnnouncementsPage } from './pages/announcements';
import { FAQPage } from './pages/faq';
import { CampusInfoPage } from './pages/campus-info';
import { CampusDetailPage } from './pages/campus-detail';
import { SpeakersPage } from './pages/speakers';
import { SpeakerDetailPage } from './pages/speaker-detail';
import { ThemesPage } from './pages/themes';
import { DecisionGuidePage } from './pages/decision-guide';
import { SeatingChartPage } from './pages/seating-chart';
import { SecretPage } from './pages/secret-page';
import { NotFoundPage } from './pages/not-found';
import { AdminLayout } from './admin/admin-layout';
import { AdminLogin } from './admin/login';
import { AdminDashboard } from './admin/dashboard';
import { AdminAnnouncements } from './admin/announcements';
import { AdminSchedule } from './admin/schedule';
import { AdminSessions } from './admin/sessions';
import { AdminFAQ } from './admin/faq';
import { AdminCampInfo } from './admin/camp-info';
import { AdminCampusTimes } from './admin/campus-times';
import { AdminActivities } from './admin/activities';
import { AdminGroups } from './admin/groups';
import { AdminCampMap } from './admin/camp-map';
import { AdminContacts } from './admin/contacts';
import { ActivitiesPage } from './pages/activities';
import { GroupCardsPage } from './pages/group-cards';
import { VideoSubmissionPage } from './pages/video-submission';
import { AdminVideoSubmissions } from './admin/video-submissions';

export const navigationItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/announcements', label: 'Announcements', icon: Bell },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/campus-info', label: 'Campus Info', icon: Building2 },
  { path: '/campus-map', label: 'Camp Map', icon: Map },
  { path: '/session-info', label: 'Sessions', icon: Info },
  { path: '/group-materials', label: 'Groups', icon: Users },
  { path: '/activities', label: 'Activities', icon: Trophy },
  { path: '/contacts', label: 'Contact Info', icon: Phone },
  { path: '/faq', label: 'FAQ', icon: HelpCircle },
];

export const router = createBrowserRouter([
  // Admin routes (separate layout, no sidebar nav)
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'announcements', element: <AdminAnnouncements /> },
      { path: 'schedule', element: <AdminSchedule /> },
      { path: 'sessions', element: <AdminSessions /> },
      { path: 'faq', element: <AdminFAQ /> },
      { path: 'camp-info', element: <AdminCampInfo /> },
      { path: 'campus-times', element: <AdminCampusTimes /> },
      { path: 'activities', element: <AdminActivities /> },
      { path: 'groups',     element: <AdminGroups /> },
      { path: 'camp-map',      element: <AdminCampMap /> },
      { path: 'contacts',      element: <AdminContacts /> },
      { path: 'contact-info',  element: <AdminContacts /> },
      { path: 'campus-info',   element: <AdminCampusTimes /> },
      { path: 'video-submissions', element: <AdminVideoSubmissions /> },
    ],
  },

  // Main app routes
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'campus-map', element: <CampusMapPage /> },
      { path: 'group-materials', element: <GroupMaterialsPage /> },
      { path: 'group-cards',     element: <GroupCardsPage /> },
      { path: 'decision-guide', element: <DecisionGuidePage /> },
      { path: 'session-info', element: <SessionInfoPage /> },
      { path: 'seating-chart', element: <SeatingChartPage /> },
      { path: 'speakers', element: <SpeakersPage /> },
      { path: 'speakers/:speakerName', element: <SpeakerDetailPage /> },
      { path: 'themes', element: <ThemesPage /> },
      { path: 'activities', element: <ActivitiesPage /> },
      { path: 'contacts', element: <ContactsPage /> },
      { path: 'campus-info', element: <CampusInfoPage /> },
      { path: 'campus-info/:campusName', element: <CampusDetailPage /> },
      { path: 'faq', element: <FAQPage /> },
      { path: 'secret-page', element: <SecretPage /> },
      { path: 'video-submission', element: <VideoSubmissionPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
