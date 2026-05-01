// Easy-to-update data for your summer camp dashboard
// Edit this file to update content across the dashboard

import type { GroupMaterial, Session } from './types';

export const campData: {
  announcements: Array<{ id: number; date: string; title: string; content: string; priority: 'high' | 'normal' }>;
  schedules: Record<string, Array<{ day: string; activities: Array<{ time: string; activity: string; location: string }> }>>;
  locations: Array<{ name: string; description: string; capacity: string; amenities: string[] }>;
  groupMaterials: GroupMaterial[];
  sessions: Session[];
  contacts: Array<{ name: string; role: string; email: string; phone: string; available: string }>;
  activities: Array<{ name: string; category: string; description: string; ageGroups: string; requirements: string }>;
  faqs: Array<{ question: string; answer: string }>;
  campuses: Array<{ name: string; description?: string; dining?: string; address?: string; smallGroupZones?: string; contact?: string }>;
  speakers: Array<{ name: string; role: string; organization: string; bio?: string; image?: string; instagram?: string }>;
} = {
  // Daily Announcements
  announcements: [
    {
      id: 4,
      date: "2026-04-04",
      title: "SIGN UP!",
      content: "Sign up for today's activities! Deadline is Noon",
      priority: "high"
    },
    {
      id: 1,
      date: "2026-04-03",
      title: "Welcome to Summer Camp 2026!",
      content: "We're excited to have you all here! Check your schedules and get ready for an amazing summer.",
      priority: "high"
    },
    {
      id: 3,
      date: "2026-04-02",
      title: "Photo Day Tomorrow",
      content: "Group photos will be taken during morning session. Wear your camp t-shirt!",
      priority: "normal"
    }
  ],

  // Campus-Specific Schedules
  schedules: {
    "Indiana": [
      {
        day: "Monday",
        activities: [
          { time: "", activity: "Leader Meeting at Campus", location: "Indiana Campus" },
          { time: "", activity: "Camper Check In at Campus", location: "Indiana Campus" },
          { time: "1:05 PM", activity: "Buses Leave Campus", location: "" },
          { time: "3:00 PM", activity: "Camper Arrival at IU", location: "M: Foster-Shea, F: Foster-Harper" },
          { time: "5:30 PM", activity: "Dinner", location: "McNutt Dining Hall" },
          { time: "", activity: "Walk to Assembly Hall for Session", location: "WALKING PATH HERE" },
          { time: "5:45 PM", activity: "Festive Atmosphere in Assembly Hall Parking Lot", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session (1 hr, 45 mins)", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Dorm Neighborhoods for Small Group", location: "WALKING PATH HERE" },
          { time: "9:15 PM", activity: "Small Group at Dorm Neighborhood", location: "M: Shea Dorm or Shea West lawn, F: Harper Dorm or Harper East lawn (North portion)" },
          { time: "10:15 PM", activity: "Staff Meeting (Dorm Areas)", location: "" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food at Dorm Neighborhoods", location: "Dorm area" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Tuesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Walk to Session", location: "WALKING PATH HERE" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Walk to Small Group (Dorm Neighborhood)", location: "WALKING PATH HERE" },
          { time: "10:45 AM", activity: "Small Groups", location: "M: Shea Dorm or Shea West lawn, F: Harper Dorm or Harper East lawn (North portion)" },
          { time: "12:00 PM", activity: "Lunch", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, or Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:30 PM", activity: "Dinner", location: "McNutt Dining Hall" },
          { time: "6:30 PM", activity: "Walk to Session", location: "WALKING PATH HERE" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Small Group (Dorm Neighborhood)", location: "WALKING PATH HERE" },
          { time: "9:15 PM", activity: "Small Groups (Dorm Neighborhoods)", location: "M: Shea Dorm or Shea West lawn, F: Harper Dorm or Harper East lawn (North portion)" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Wednesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Walk to Session", location: "WALKING PATH HERE" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Walk to Small Group (Dorm Neighborhood)", location: "WALKING PATH HERE" },
          { time: "10:45 AM", activity: "Small Groups", location: "M: Shea Dorm or Shea West lawn, F: Harper Dorm or Harper East lawn (North portion)" },
          { time: "12:00 PM", activity: "Lunch", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:30 PM", activity: "Dinner", location: "McNutt Dining Hall" },
          { time: "6:30 PM", activity: "Walk to Session", location: "WALKING PATH HERE" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Small Group (Dorm Neighborhood)", location: "WALKING PATH HERE" },
          { time: "9:15 PM", activity: "Small Groups (Dorm Neighborhoods)", location: "M: Shea Dorm or Shea West lawn, F: Harper Dorm or Harper East lawn (North portion)" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Thursday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Walk to Session", location: "WALKING PATH HERE" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Walk to Small Group (Dorm Neighborhood)", location: "WALKING PATH HERE" },
          { time: "10:45 AM", activity: "Small Groups", location: "M: Shea Dorm or Shea West lawn, F: Harper Dorm or Harper East lawn (North portion)" },
          { time: "12:00 PM", activity: "Lunch", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:30 PM", activity: "Dinner", location: "McNutt Dining Hall" },
          { time: "6:30 PM", activity: "Walk to Session", location: "WALKING PATH HERE" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Small Group (Dorm Neighborhood)", location: "WALKING PATH HERE" },
          { time: "9:15 PM", activity: "Small Groups (Dorm Neighborhoods)", location: "M: Shea Dorm or Shea West lawn, F: Harper Dorm or Harper East lawn (North portion)" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Friday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "9:00 AM", activity: "Campus Time", location: "Designated Campus Time space" },
          { time: "12:00 PM", activity: "Lunch", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodlawn Field" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:00 - 6:00 PM", activity: "Pack Up, Clean Up, Load Luggage", location: "Dorms" },
          { time: "5:20 PM", activity: "Dinner", location: "McNutt Dining Hall" },
          { time: "6:00 PM", activity: "Walk to Session", location: "WALKING PATH HERE" },
          { time: "6:15 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "8:15 PM", activity: "Session Ends", location: "" },
          { time: "8:15 PM", activity: "Begin Loading Buses", location: "Assembly Hall" },
          { time: "", activity: "Grab and Go Food", location: "Assembly Hall" },
          { time: "10:20 PM", activity: "Arrive at Campus", location: "Indiana Campus" }
        ]
      }
    ],
    "Franklin": [
      {
        day: "Monday",
        activities: [
          { time: "", activity: "Leader Meeting at Campus", location: "Franklin Campus" },
          { time: "", activity: "Camper Check In at Campus", location: "Franklin Campus" },
          { time: "9:00 AM CST", activity: "Buses Leave Campus", location: "" },
          { time: "4:00 PM EST", activity: "Camper Arrival at IU", location: "M: Foster-Shea, F: Walnut Grove-Chestnut" },
          { time: "6:00 PM", activity: "Dinner", location: "McNutt Dining Hall" },
          { time: "", activity: "Walk to Assembly Hall for Session", location: "WALKING ROUTE HERE" },
          { time: "5:45 PM", activity: "Festive Atmosphere in Assembly Hall Parking Lot", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session (1 hr, 45 mins)", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Dorm Neighborhoods for Small Group", location: "WALKING ROUTE HERE" },
          { time: "9:15 PM", activity: "Small Group at Dorm Neighborhood", location: "M: Shea Dorm or Shea East Lawn (South portion), F: Chestnut Dorm, Chestnut East lawn (South portion)" },
          { time: "10:15 PM", activity: "Staff Meeting (Dorm Areas)", location: "" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food at Dorm Neighborhoods", location: "Dorm area" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Tuesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Walk to Session", location: "WALKING ROUTE HERE" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Walk to Small Group", location: "WALKING ROUTE HERE" },
          { time: "10:45 AM", activity: "Small Group", location: "M: Shea Dorm or Shea East Lawn (South portion), F: Chestnut Dorm, Chestnut East lawn (South portion)" },
          { time: "12:30 PM", activity: "Lunch", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, or Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "6:00 PM", activity: "Dinner", location: "McNutt Dining Hall" },
          { time: "6:30 PM", activity: "Walk to Session", location: "WALKING ROUTE HERE" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Small Group", location: "WALKING ROUTE HERE" },
          { time: "9:15 PM", activity: "Small Group", location: "M: Shea Dorm or Shea East Lawn (South portion), F: Chestnut Dorm, Chestnut East lawn (South portion)" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Wednesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Walk to Session", location: "WALKING ROUTE HERE" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Walk to Small Group", location: "WALKING ROUTE HERE" },
          { time: "10:45 AM", activity: "Small Group", location: "M: Shea Dorm or Shea East Lawn (South portion), F: Chestnut Dorm, Chestnut East lawn (South portion)" },
          { time: "12:30 PM", activity: "Lunch", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "6:00 PM", activity: "Dinner", location: "McNutt Dining Hall" },
          { time: "6:30 PM", activity: "Walk to Session", location: "WALKING ROUTE HERE" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Small Group (Dorm Neighborhood)", location: "WALKING ROUTE HERE" },
          { time: "9:15 PM", activity: "Small Groups (Dorm Neighborhoods)", location: "M: Shea Dorm or Shea East Lawn (South portion), F: Chestnut Dorm, Chestnut East lawn (South portion)" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Thursday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Walk to Session", location: "WALKING ROUTE HERE" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Walk to Small Group (Dorm Neighborhood)", location: "WALKING ROUTE HERE" },
          { time: "10:45 AM", activity: "Small Groups", location: "M: Shea Dorm or Shea East Lawn (South portion), F: Chestnut Dorm, Chestnut East lawn (South portion)" },
          { time: "12:30 PM", activity: "Lunch", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "6:00 PM", activity: "Dinner", location: "McNutt Dining Hall" },
          { time: "6:30 PM", activity: "Walk to Session", location: "WALKING ROUTE HERE" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Small Group (Dorm Neighborhood)", location: "WALKING ROUTE HERE" },
          { time: "9:15 PM", activity: "Small Groups (Dorm Neighborhoods)", location: "M: Shea Dorm or Shea East Lawn (South portion), F: Chestnut Dorm, Chestnut East lawn (South portion)" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Friday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "9:00 AM", activity: "Campus Time", location: "Designated Campus Time space" },
          { time: "12:30 PM", activity: "Lunch", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodlawn Field" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:00 - 6:00 PM", activity: "Pack Up, Clean Up, Load Luggage", location: "Dorms" },
          { time: "5:40 PM", activity: "Dinner", location: "McNutt Dining Hall" },
          { time: "6:00 PM", activity: "Walk to Session", location: "WALKING ROUTE HERE" },
          { time: "6:15 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "8:15 PM", activity: "Session Ends", location: "" },
          { time: "8:15 PM", activity: "Begin Loading Buses", location: "Assembly Hall" },
          { time: "", activity: "Grab and Go Food", location: "Assembly Hall" },
          { time: "11:59 PM CST", activity: "Arrive at Campus", location: "Franklin Campus" }
        ]
      }
    ],
    "Elizabethtown": [
      {
        day: "Monday",
        activities: [
          { time: "", activity: "Leader Meeting at Campus", location: "Etown Campus" },
          { time: "", activity: "Camper Check In at Campus", location: "Etown Campus" },
          { time: "12:55 PM", activity: "Buses Leave Campus", location: "" },
          { time: "3:30 PM", activity: "Camper Arrival at IU", location: "Eigenmann Dorm" },
          { time: "5:00 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "", activity: "Shuttle to Assembly Hall for Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "5:45 PM", activity: "Festive Atmosphere in Assembly Hall Parking Lot", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session (1 hr, 45 mins)", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Dorm Neighborhoods for Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group at Dorm Neighborhood", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "10:15 PM", activity: "Staff Meeting (Dorm Areas)", location: "" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food at Dorm Neighborhoods", location: "Dorm area" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Tuesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Shuttle to Small Group", location: "" },
          { time: "10:45 AM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "12:00 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, or Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:00 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:30 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Wednesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Shuttle to Small Group", location: "" },
          { time: "10:45 AM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "12:00 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:00 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:30 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Thursday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Shuttle to Small Group", location: "" },
          { time: "10:45 AM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "12:00 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:00 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:30 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Friday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "9:00 AM", activity: "Campus Time", location: "Designated Campus Time space" },
          { time: "12:00 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodlawn Field" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:00 - 6:00 PM", activity: "Pack Up, Clean Up, Load Luggage", location: "Dorms" },
          { time: "5:00 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:00 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:15 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "8:15 PM", activity: "Session Ends", location: "" },
          { time: "8:15 PM", activity: "Begin Loading Buses", location: "Assembly Hall" },
          { time: "", activity: "Grab and Go Food", location: "Assembly Hall" },
          { time: "11:05 PM", activity: "Arrive at Campus", location: "Etown Campus" }
        ]
      }
    ],
    "Crestwood": [
      {
        day: "Monday",
        activities: [
          { time: "", activity: "Leader Meeting at Campus", location: "Crestwood Campus" },
          { time: "", activity: "Camper Check In at Campus", location: "Crestwood Campus" },
          { time: "1:00 & 2:00 PM", activity: "Buses Leave Campus", location: "" },
          { time: "3:00 & 4:00 PM", activity: "Camper Arrival at IU", location: "M: Teter-Thompson, F: Teter-Boisen" },
          { time: "5:00 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "", activity: "Shuttle to Assembly Hall for Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "5:45 PM", activity: "Festive Atmosphere in Assembly Hall Parking Lot", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session (1 hr, 45 mins)", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Dorm Neighborhoods for Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group at Dorm Neighborhood", location: "M: Thompson Dorm or Thompson North Courtyard, F: Boisen Dorm, Boisen Courtyard" },
          { time: "10:15 PM", activity: "Staff Meeting (Dorm Areas)", location: "" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food at Dorm Neighborhoods", location: "Dorm area" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Tuesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Shuttle to Small Group", location: "" },
          { time: "10:45 AM", activity: "Small Group", location: "M: Thompson Dorm or Thompson North Courtyard, F: Boisen Dorm, Boisen Courtyard" },
          { time: "12:00 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, or Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:00 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:30 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group", location: "M: Thompson Dorm or Thompson North Courtyard, F: Boisen Dorm, Boisen Courtyard" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Wednesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Shuttle to Small Group", location: "" },
          { time: "10:45 AM", activity: "Small Group", location: "M: Thompson Dorm or Thompson North Courtyard, F: Boisen Dorm, Boisen Courtyard" },
          { time: "12:00 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:00 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:30 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group", location: "M: Thompson Dorm or Thompson North Courtyard, F: Boisen Dorm, Boisen Courtyard" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Thursday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Shuttle to Small Group", location: "" },
          { time: "10:45 AM", activity: "Small Group", location: "M: Thompson Dorm or Thompson North Courtyard, F: Boisen Dorm, Boisen Courtyard" },
          { time: "12:00 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:00 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:30 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group", location: "M: Thompson Dorm or Thompson North Courtyard, F: Boisen Dorm, Boisen Courtyard" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Friday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "9:00 AM", activity: "Campus Time", location: "Designated Campus Time space" },
          { time: "12:00 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodlawn Field" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:00 - 6:00 PM", activity: "Pack Up, Clean Up, Load Luggage", location: "Dorms" },
          { time: "5:00 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:00 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:15 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "8:15 PM", activity: "Session Ends", location: "" },
          { time: "8:15 PM", activity: "Begin Loading Buses", location: "Assembly Hall" },
          { time: "", activity: "Grab and Go Food", location: "Assembly Hall" },
          { time: "10:35 PM", activity: "Arrive at Campus", location: "Crestwood Campus" }
        ]
      }
    ],
    "Bullitt County": [
      {
        day: "Monday",
        activities: [
          { time: "", activity: "Leader Meeting at Campus", location: "Bullitt Co Campus" },
          { time: "", activity: "Camper Check In at Campus", location: "Bullitt Co Campus" },
          { time: "12:30 & 1:30 PM", activity: "Buses Leave Campus", location: "" },
          { time: "3:00 & 4:00 PM", activity: "Camper Arrival at IU", location: "Eigenmann Dorm" },
          { time: "5:30 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "", activity: "Shuttle to Assembly Hall for Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "5:45 PM", activity: "Festive Atmosphere in Session Parking Lot", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session (1 hr, 45 mins)", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Dorm Neighborhoods for Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group at Dorm Neighborhood", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "10:15 PM", activity: "Staff Meeting (Dorm Areas)", location: "" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food at Dorm Neighborhoods", location: "Dorm area" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Tuesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Shuttle to Small Group", location: "" },
          { time: "10:45 AM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "12:30 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, or Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:30 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:30 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Wednesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Shuttle to Small Group", location: "" },
          { time: "10:45 AM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "12:30 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:30 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:30 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Thursday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "8:30 AM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Shuttle to Small Group", location: "" },
          { time: "10:45 AM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "12:30 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:30 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:30 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Shuttle to Small Group", location: "" },
          { time: "9:15 PM", activity: "Small Group", location: "Eigenmann Dorm or Greenspace between Teter and Eigenmann" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Friday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting (Dorm Vicinity)", location: "" },
          { time: "9:00 AM", activity: "Campus Time", location: "Designated Campus Time space" },
          { time: "12:30 PM", activity: "Lunch", location: "Wright Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodlawn Field" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:00 - 6:00 PM", activity: "Pack Up, Clean Up, Load Luggage", location: "Dorms" },
          { time: "5:30 PM", activity: "Dinner", location: "Wright Dining Hall" },
          { time: "6:00 PM", activity: "Shuttle to Session", location: "Campbell & 7th Street Shuttle pick up" },
          { time: "6:15 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "8:15 PM", activity: "Session Ends", location: "" },
          { time: "8:15 PM", activity: "Begin Loading Buses", location: "Assembly Hall" },
          { time: "", activity: "Grab and Go Food", location: "Assembly Hall" },
          { time: "10:50 PM", activity: "Arrive at Campus", location: "Bullitt Co Campus" }
        ]
      }
    ],
    "Blankenbaker": [
      {
        day: "Monday",
        activities: [
          { time: "", activity: "Leader Meeting at Campus", location: "Blankenbaker Campus" },
          { time: "", activity: "Camper Check In at Campus", location: "Blankenbaker Campus" },
          { time: "1:00 & 2:00 PM", activity: "Buses Leave Campus", location: "Blankenbaker Campus" },
          { time: "3:00 & 4:00 PM", activity: "Camper Arrival at IU", location: "McNutt Dorms" },
          { time: "5:00 & 6:00 PM", activity: "Dinner Waves", location: "McNutt Dining Hall" },
          { time: "", activity: "Walk to Assembly Hall", location: "" },
          { time: "5:45 PM", activity: "Festive Atmosphere in Session Parking Lot", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session (1 hr, 45 mins)", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Dorm Neighborhoods for Small Group", location: "OUTLINE WALKING PATH" },
          { time: "9:15 PM", activity: "Small Group at Dorm Neighborhood", location: "M: McNutt South Dorms, McNutt South courtyard, McNutt East lawn | F: McNutt North Dorms, McNutt North courtyard, McNutt North and East lawn" },
          { time: "10:15 PM", activity: "Staff Meeting", location: "McNutt Dining 2nd Floor" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food at Dorm Neighborhoods", location: "McNutt Dorms" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Tuesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting", location: "McNutt Dining 2nd Floor" },
          { time: "8:30 AM", activity: "Walk to Session", location: "OUTLINE ROUTE" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Walk to Small Group", location: "OUTLINE ROUTE" },
          { time: "10:45 AM", activity: "Small Group", location: "M: McNutt South Dorms, McNutt South courtyard, McNutt East lawn | F: McNutt North Dorms, McNutt North courtyard, McNutt North and East lawn" },
          { time: "11:30 AM & 12:30 PM", activity: "Lunch Waves", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, or Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:00 & 6:00 PM", activity: "Dinner Waves", location: "McNutt Dining Hall" },
          { time: "6:30 PM", activity: "Walk to Session", location: "OUTLINE ROUTE" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Small Group", location: "OUTLINE ROUTE" },
          { time: "9:15 PM", activity: "Small Group", location: "M: McNutt South Dorms, McNutt South courtyard, McNutt East lawn | F: McNutt North Dorms, McNutt North courtyard, McNutt North and East lawn" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Wednesday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting", location: "" },
          { time: "8:30 AM", activity: "Walk to Session", location: "OUTLINE ROUTE" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Walk to Small Group", location: "OUTLINE ROUTE" },
          { time: "10:45 AM", activity: "Small Group", location: "M: McNutt South Dorms, McNutt South courtyard, McNutt East lawn | F: McNutt North Dorms, McNutt North courtyard, McNutt North and East lawn" },
          { time: "11:30 AM & 12:30 PM", activity: "Lunch Waves", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:00 & 6:00 PM", activity: "Dinner Waves", location: "McNutt Dining Hall" },
          { time: "6:30 PM", activity: "Walk to Session", location: "OUTLINE ROUTE" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Small Group", location: "OUTLINE ROUTE" },
          { time: "9:15 PM", activity: "Small Group", location: "M: McNutt South Dorms, McNutt South courtyard, McNutt East lawn | F: McNutt North Dorms, McNutt North courtyard, McNutt North and East lawn" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Thursday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting", location: "McNutt Dining 2nd Floor" },
          { time: "8:30 AM", activity: "Walk to Session", location: "OUTLINE ROUTE" },
          { time: "8:45 AM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "9:15 AM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "10:30 AM", activity: "Session Ends", location: "" },
          { time: "10:30 AM", activity: "Walk to Small Group", location: "OUTLINE ROUTE" },
          { time: "10:45 AM", activity: "Small Group", location: "M: McNutt South Dorms, McNutt South courtyard, McNutt East lawn | F: McNutt North Dorms, McNutt North courtyard, McNutt North and East lawn" },
          { time: "11:30 AM & 12:30 PM", activity: "Lunch Waves", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodfield Lawn" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:15 PM", activity: "Staff Meeting (IMU?)", location: "" },
          { time: "5:00 & 6:00 PM", activity: "Dinner Waves", location: "McNutt Dining Hall" },
          { time: "6:30 PM", activity: "Walk to Session", location: "OUTLINE ROUTE" },
          { time: "6:45 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "7:15 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "9:00 PM", activity: "Session Ends", location: "" },
          { time: "9:00 PM", activity: "Walk to Small Group", location: "OUTLINE ROUTE" },
          { time: "9:15 PM", activity: "Small Group", location: "M: McNutt South Dorms, McNutt South courtyard, McNutt East lawn | F: McNutt North Dorms, McNutt North courtyard, McNutt North and East lawn" },
          { time: "10:15 PM", activity: "Dorms Open / Late Night Food (Dorm Neighborhoods)", location: "Dorm or Dorm neighborhood" },
          { time: "11:00 PM", activity: "Curfew", location: "In Dorms" }
        ]
      },
      {
        day: "Friday",
        activities: [
          { time: "7:00 - 8:30 AM", activity: "Breakfast", location: "Dorm or Dining Hall" },
          { time: "8:00 AM", activity: "Leader Meeting", location: "McNutt Dining 2nd Floor" },
          { time: "9:00 AM", activity: "Campus Time", location: "Wilkinson" },
          { time: "11:30 AM & 12:30 PM", activity: "Lunch Waves", location: "McNutt Dining Hall" },
          { time: "1:00 - 4:30 PM", activity: "Afternoon Activities", location: "SRSC, IMU, Woodlawn Field" },
          { time: "1:00 - 4:30 PM", activity: "Shuttles Run from Rec to IMU, IMU to Rec", location: "" },
          { time: "1:30 - 2:30 PM", activity: "Elective Classes", location: "IMU" },
          { time: "3:00 - 4:00 PM", activity: "Elective Classes", location: "IMU" },
          { time: "", activity: "Sports Tournaments", location: "SRSC" },
          { time: "4:00 - 6:00 PM", activity: "Pack Up, Clean Up, Load Luggage", location: "Dorms" },
          { time: "5:00 PM & 5:40 PM", activity: "Dinner Waves", location: "McNutt Dining Hall" },
          { time: "6:00 PM", activity: "Walk to Session", location: "OUTLINE ROUTE" },
          { time: "6:15 PM", activity: "Session Doors Open", location: "Assembly Hall" },
          { time: "6:45 PM", activity: "Session Begins", location: "Assembly Hall" },
          { time: "8:15 PM", activity: "Session Ends", location: "" },
          { time: "8:15 PM", activity: "Begin Loading Buses", location: "Assembly Hall" },
          { time: "", activity: "Grab and Go Food", location: "Assembly Hall" },
          { time: "10:35 PM", activity: "Arrive at Campus", location: "Blankenbaker Campus" }
        ]
      }
    ]
  },

  // Locations
  locations: [
    {
      name: "Main Hall",
      description: "Large assembly area for morning meetings and wrap-up sessions",
      capacity: "200 people",
      amenities: ["Audio/Visual Equipment", "Air Conditioning", "Stage"]
    },
    {
      name: "Dining Hall",
      description: "Cafeteria-style dining with indoor and outdoor seating",
      capacity: "150 people",
      amenities: ["Kitchen", "Indoor Seating", "Outdoor Patio", "Refrigeration"]
    },
    {
      name: "Pool Area",
      description: "Olympic-sized swimming pool with diving boards and splash zone",
      capacity: "75 swimmers",
      amenities: ["Lifeguards", "Changing Rooms", "First Aid Station", "Shade Structures"]
    },
    {
      name: "Activity Center",
      description: "Multi-purpose indoor facility for group activities and games",
      capacity: "100 people",
      amenities: ["Sports Equipment", "Game Tables", "Sound System"]
    },
    {
      name: "Art Studio",
      description: "Creative space for arts, crafts, and hands-on projects",
      capacity: "40 people",
      amenities: ["Art Supplies", "Pottery Wheels", "Kiln", "Workbenches"]
    },
    {
      name: "Sports Field",
      description: "Large outdoor field for soccer, ultimate frisbee, and field games",
      capacity: "80 people",
      amenities: ["Goals", "Equipment Storage", "Benches", "Water Stations"]
    },
    {
      name: "Theater",
      description: "Performance space with stage, lighting, and seating",
      capacity: "120 people",
      amenities: ["Stage", "Lighting System", "Sound System", "Backstage Area"]
    }
  ],

  // Group Materials
  groupMaterials: [],

  // Session Information
  sessions: [],

  // Contact Information
  contacts: [
    {
      role: "Camp Director",
      name: "Sarah Johnson",
      email: "sarah.johnson@summercamp.org",
      phone: "(555) 123-4567",
      available: "Mon-Fri, 8:00 AM - 5:00 PM"
    },
    {
      role: "Program Coordinator",
      name: "Mike Chen",
      email: "mike.chen@summercamp.org",
      phone: "(555) 123-4568",
      available: "Mon-Fri, 8:00 AM - 5:00 PM"
    },
    {
      role: "Health & Safety Officer",
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@summercamp.org",
      phone: "(555) 123-4569",
      available: "24/7 Emergency Line"
    },
    {
      role: "Activities Director",
      name: "James Wilson",
      email: "james.wilson@summercamp.org",
      phone: "(555) 123-4570",
      available: "Mon-Fri, 9:00 AM - 4:00 PM"
    }
  ],

  // Activities
  activities: [
    {
      name: "Swimming & Water Sports",
      category: "Aquatics",
      description: "Supervised swimming sessions with lessons for all skill levels, diving, water games, and safety training",
      ageGroups: "All Ages",
      requirements: "Swim test required for deep end access"
    },
    {
      name: "Arts & Crafts",
      category: "Creative",
      description: "Painting, drawing, pottery, jewelry making, and mixed media projects",
      ageGroups: "All Ages",
      requirements: "None"
    },
    {
      name: "Team Sports",
      category: "Athletics",
      description: "Soccer, basketball, ultimate frisbee, volleyball, and cooperative games",
      ageGroups: "All Ages",
      requirements: "Athletic shoes required"
    },
    {
      name: "Nature Hikes",
      category: "Outdoor",
      description: "Guided trail walks, wildlife observation, plant identification, and outdoor skills",
      ageGroups: "All Ages",
      requirements: "Closed-toe shoes and water bottle"
    },
    {
      name: "STEM Projects",
      category: "Educational",
      description: "Hands-on science experiments, robotics, coding, and engineering challenges",
      ageGroups: "Ages 10+",
      requirements: "None"
    },
    {
      name: "Music & Drama",
      category: "Performance",
      description: "Singing, instruments, theater games, improvisation, and end-of-week performances",
      ageGroups: "All Ages",
      requirements: "None"
    },
    {
      name: "Rock Climbing",
      category: "Adventure",
      description: "Indoor climbing wall with instruction for beginners to advanced climbers",
      ageGroups: "Ages 10+",
      requirements: "Waiver required, harness provided"
    },
    {
      name: "Team Building",
      category: "Leadership",
      description: "Trust exercises, problem-solving challenges, and group cooperation activities",
      ageGroups: "All Ages",
      requirements: "None"
    }
  ],

  // FAQs
  faqs: [
    {
      question: "LOST & FOUND",
      answer: "Lost in Session? Check Session Lobby\n\nLost in Dorms? Check Front Desk\n\nLost Elsewhere? Check Honors South (https://maps.app.goo.gl/4FekQFk57DPAgpdo7)"
    },
    {
      question: "LOST KEY / FOUND KEY",
      answer: "Lost Key? Continually check your dorm front desk. All keys eventually find their way back to their corresponding dorm if found.\n\nFound Key? Turn into ANY front desk. You'll be a hero."
    },
    {
      question: "CIY STORE",
      answer: "Two Options:\n\n1. Physical Store → Honors South (https://maps.app.goo.gl/4FekQFk57DPAgpdo7)\n\n2. Digital Store (https://pickup.ciy.com/collections/in-southeast-june-23-27-west-lafayette-in) → Pick up at Elliot (https://maps.app.goo.gl/pHa2C5obFoti9GQX8?g_st=ic)"
    },
    {
      question: "DORMS DURING FREE TIME",
      answer: "Dorm Rooms are allowed if…\n\nTwo leaders are present and you are cleaning / packing."
    },
    {
      question: "RESPECT THE PLACE",
      answer: "Can I use the REC? No.\n\nCan I ride a scooter? No.\n\nCan I jump on an elevator? No."
    },
    {
      question: "DORM CLEANLINESS",
      answer: "Need a new towel? Swap at the front desk!\n\nNeed new linens? You guessed it…front desk.\n\nTrash piling up? Take it out in your dorm hall."
    }
  ],

  // Campuses
  campuses: [
    {
      name: "Blankenbaker",
      description: "North Neighborhood",
      address: "Male Dorms: McNutt South South, McNutt South East, McNutt South West\nFemale Dorms: McNutt North North, McNutt North East, McNutt North West",
      contact: "",
      dining: "McNutt Dining Hall",
      smallGroupZones: "Male Small Group Zones:\n• McNutt South Dorms\n• McNutt South Courtyard\n• McNutt East Lawn\n\nFemale Small Group Zones:\n• McNutt North Dorms\n• McNutt North Courtyard\n• McNutt North and East Lawns"
    },
    {
      name: "Bullitt County",
      description: "South Neighborhood",
      address: "Male Dorms: Eigenmann\nFemale Dorms: Eigenmann",
      contact: "",
      dining: "Wright Dining Hall",
      smallGroupZones: "Male Small Group Zones:\n• Eigenmann Dorm\n• Teter South East Lawn (South of Thompson)\n\nFemale Small Group Zones:\n• Eigenmann Dorm\n• Teter South West Lawn (South of Wissler)"
    },
    {
      name: "Crestwood",
      description: "South Neighborhood",
      address: "Male Dorms: Teter-Thompson\nFemale Dorms: Teter-Boisen",
      contact: "",
      dining: "Wright Dining Hall",
      smallGroupZones: "Male Small Group Zones:\n• Thompson Dorm\n• Thompson West Lawn\n• Thompson East Strip\n\nFemale Small Group Zones:\n• Boisen Dorm\n• Boisen East Strip"
    },
    {
      name: "Elizabethtown",
      description: "South Neighborhood",
      address: "Male Dorms: Eigenmann\nFemale Dorms: Eigenmann",
      contact: "",
      dining: "Wright Dining Hall",
      smallGroupZones: "Male Small Group Zones:\n• Eigenmann Dorm\n• Teter Lawn - West of Elkin\n\nFemale Small Group Zones:\n• Eigenmann Dorm\n• Teter Lawn West of Boisen (between Elkin and Boisen)"
    },
    {
      name: "Franklin",
      description: "South Neighborhood",
      address: "Male Dorms: Foster-Shea\nFemale Dorms: Walnut Grove-Chestnut",
      contact: "",
      dining: "McNutt Dining Hall",
      smallGroupZones: "Male Small Group Zones:\n• Shea Dorm\n• Shea East Lawn (South portion)\n\nFemale Small Group Zones:\n• Chestnut D Dorm\n• Chestnut East Lawn (South portion)"
    },
    {
      name: "Indiana",
      description: "South Neighborhood",
      address: "Male Dorms: Foster-Shea\nFemale Dorms: Foster-Harper",
      contact: "",
      dining: "McNutt Dining Hall",
      smallGroupZones: "Male Small Group Zones:\n• Shea Dorm\n• Shea West Lawn\n\nFemale Small Group Zones:\n• Harper Dorm\n• Harper East Lawn (North portion)"
    },
    {
      name: "La Grange",
      description: "South Neighborhood",
      address: "Male Dorms: Teter-Thompson\nFemale Dorms: Teter-Wissler",
      contact: "",
      dining: "TBD",
      smallGroupZones: "Male Small Group Zones:\n• Thompson Dorm\n• Thompson West Lawn\n• Thompson East Strip\n\nFemale Small Group Zones:\n• Wissler Dorm\n• Wissler West Lawn"
    },
    {
      name: "Nelson County",
      description: "North Neighborhood",
      address: "Male Dorms: Foster-Jenkinson\nFemale Dorms: Foster-Harper",
      contact: "",
      dining: "TBD",
      smallGroupZones: "Male Small Group Zones:\n• Jenkinson Dorm\n• Jenkinson East Lawn\n\nFemale Small Group Zones:\n• Harper Dorm\n• Jenkinson East Lawn"
    },
    {
      name: "Prospect",
      description: "North Neighborhood",
      address: "Male Dorms: Foster-Shea\nFemale Dorms: Foster-Harper",
      contact: "",
      dining: "McNutt Dining Hall",
      smallGroupZones: "Male Small Group Zones:\n• Shea Dorm\n• Shea East Lawn (North portion)\n\nFemale Small Group Zones:\n• Harper Dorm\n• Harper East Lawn (South portion)"
    },
    {
      name: "Shelby County",
      description: "North Neighborhood",
      address: "Male Dorms: Foster-Martin\nFemale Dorms: Foster-Magee",
      contact: "",
      dining: "McNutt Dining Hall",
      smallGroupZones: "Male Small Group Zones:\n• Martin Dorm\n• Martin East Lawn (North portion)\n\nFemale Small Group Zones:\n• Magee Dorm\n• Magee East Lawn (North portion)"
    },
    {
      name: "South Lou / Beechmont",
      description: "North Neighborhood",
      address: "Male Dorms: Foster-Martin\nFemale Dorms: Foster-Magee",
      contact: "",
      dining: "McNutt Dining Hall",
      smallGroupZones: "Male Small Group Zones:\n• Martin Dorm\n• Martin East Lawn (South portion)\n\nFemale Small Group Zones:\n• Magee Dorm\n• Magee East Lawn (South portion)"
    },
    {
      name: "Southwest",
      description: "North Neighborhood",
      address: "Male Dorms: McNutt South West\nFemale Dorms: Walnut Grove-Chestnut D",
      contact: "",
      dining: "McNutt Dining Hall",
      smallGroupZones: "Male Small Group Zones:\n• McNutt South West Dorm\n• McNutt South Lawn\n\nFemale Small Group Zones:\n• Chestnut D Dorm\n• Chestnut East Lawn (North portion)"
    }
  ],

  // Session Speakers
  speakers: [
    {
      name: "Carl Kuhl",
      image: "https://images.unsplash.com/photo-1750284743576-d600a45d6165?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwYXN0b3IlMjBzcGVha2VyJTIwbWFsZXxlbnwxfHx8fDE3NzUyMzk4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Executive Pastor of Ministries",
      organization: "Southeast Christian Church",
      bio: "Carl is married to Lindsay, and their favorite things to do together include traveling and trying new restaurants. He loves being in the Rocky Mountains, watching sports (preferably ravens football), and working out. His biggest adventure is raising four great kids: Reagan, Quint, London, and Declan. Currently, Carl serves as the Executive Pastor of Ministries at Southeast Christian Church in the Kentuckiana area. There, he is passionate about creating a culture where people can be open about their brokenness and find true hope through Jesus.",
      instagram: "https://www.instagram.com/carlkuhl4/?hl=en"
    },
    {
      name: "Joel Firebaugh",
      image: "https://images.unsplash.com/photo-1702988708132-8a5354ec783d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbGUlMjBwYXN0b3IlMjBzcGVha2luZ3xlbnwxfHx8fDE3NzUyMzk4MDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Next Gen Director",
      organization: "Crossroads Church",
      bio: "Joel Firebaugh has a passion for reaching the next generation, and finding leaders to do it alongside of him. He currently serves as the Next Gen Director for Crossroads Church, a large multisite church in Cincinnati, Ohio. Joel and his wife Anna reside in Cincinnati, Ohio. Joel is a pastor, storyteller, husband, bacon consumer, and the author of \"How to Pretend to Be a Published Author,\" which is available anywhere books aren't sold 😎",
      instagram: "https://www.instagram.com/joel_firebaugh/?hl=en"
    },
    {
      name: "Shelbi Shutt",
      image: "https://images.unsplash.com/photo-1551677573-e734db94c90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmZW1hbGUlMjBzcGVha2VyJTIwbWluaXN0cnl8ZW58MXx8fHwxNzc1MjM5ODA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Pastor, Speaker, Writer & Disability Advocate",
      organization: "Full Time Ministry",
      bio: "A local 'Louisville Native' herself, Shelby is returning to High School Camp this year…but no longer as a student…but as a speaker. Shelby & her husband Jordan currently live in NY and work in full time ministry. As a pastor, speaker, writer, and disability advocate, Shelbi is giving her life to helping people come alive to the power of God's presence in and through their weakness.",
      instagram: "https://www.instagram.com/shelbishutt/"
    },
    {
      name: "Brock O'Dell",
      image: "https://images.unsplash.com/photo-1720805752653-10ddccea4c94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYWxlJTIwbGVhZGVyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc1MjM5ODA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Student Ministry Leader",
      organization: "Southeast Christian Church - Blankenbaker",
      bio: "Brock O'Dell is the Student Ministry Leader at the Blankenbaker campus of Southeast Christian Church in Louisville, KY. From worship ministry to middle school to high school ministry, the Lord has been faithful and gracious in Brock's journey of following Christ. Brock and his wife Aurora have two crazy kids. He loves Jesus, speaking, cereal, and fantasy football.",
      instagram: "https://www.instagram.com/brockcodell"
    },
    {
      name: "Aaron Brockett",
      image: "https://images.unsplash.com/photo-1770283556277-812f8b185a64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBwYXN0b3IlMjBwb3J0cmFpdCUyMG1hbGV8ZW58MXx8fHwxNzc1MjM5ODA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Lead Pastor",
      organization: "Traders Point Christian Church",
      bio: "Aaron Brockett is the lead pastor of Traders Point Christian Church in Indianapolis. Since he joined the church in 2007, it has grown from 1,500 people in one location to more than 9,000 people in five locations. He is passionate about removing barriers that keep people from Jesus, just as the men in Mark 2 \"wrecked the roof\" in order to get the paralytic to Jesus. Aaron has contributed to several books and articles and also serves as a board member of the Orchard Group, a worldwide church-planting organization. He and his wife, Lindsay, have dedicated their lives to seeing people all over the world come to know, trust and follow Jesus. They have four great kids and a silver lab named Winston.",
      instagram: "https://www.instagram.com/aaronbrockett/?hl=en"
    },
    {
      name: "Reid Milliken",
      image: "https://images.unsplash.com/photo-1655026171921-1c09f5f24e35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3V0aCUyMHBhc3RvciUyMG1hbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzUyMzk4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Student Pastor",
      organization: "Southeast Christian Church - E-Town",
      bio: "Reid is the student pastor at the E-Town campus of Southeast Christian church. Reid and his wife Andrea (along with their 4 kids) love this community. Reid has been on staff at Southeast for 10 years and is deeply committed to helping students get connected to Jesus and one another. His favorite part of what he gets to do each week is watching students get connected to small groups and experience incredible relationships with both their peers and the amazing small group leaders.",
      instagram: "https://www.instagram.com/reid_milliken/"
    }
  ]
};