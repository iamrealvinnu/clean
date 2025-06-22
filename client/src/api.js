// API Service for Waste Management System
// This file handles all backend communication with mock data

// Mock data for development
const mockUsers = [
  { id: 1, name: 'Nitesh Kumar', email: 'nitesh@example.com', role: 'resident', ward: 'Ward 1', points: 120 },
  { id: 2, name: 'Asha Patel', email: 'asha@example.com', role: 'resident', ward: 'Ward 2', points: 150 },
  { id: 3, name: 'Ravi Singh', email: 'ravi@example.com', role: 'driver', ward: 'Ward 1', vehicleId: 'V001' },
  { id: 4, name: 'Admin User', email: 'admin@example.com', role: 'admin', ward: 'All Wards' }
];

const mockVehicles = [
  { 
    id: 'V001', 
    vehicleId: 'V001', 
    status: 'On Route', 
    lat: 12.9716, 
    lng: 77.5946, 
    driver: 'Ravi Singh',
    lastUpdated: new Date().toISOString(),
    route: 'Ward 1 - Main Street'
  },
  { 
    id: 'V002', 
    vehicleId: 'V002', 
    status: 'Idle', 
    lat: 12.9750, 
    lng: 77.6000, 
    driver: 'Kumar Driver',
    lastUpdated: new Date(Date.now() - 300000).toISOString(),
    route: 'Ward 2 - Park Avenue'
  },
  { 
    id: 'V003', 
    vehicleId: 'V003', 
    status: 'Maintenance', 
    lat: 12.9800, 
    lng: 77.6100, 
    driver: 'Mohan Driver',
    lastUpdated: new Date(Date.now() - 600000).toISOString(),
    route: 'Ward 3 - Lake Road'
  }
];

const mockSchedules = [
  { id: 1, day: 'Monday', time: '7:00 AM - 12:00 PM', type: 'Organic Waste', ward: 'Ward 1' },
  { id: 2, day: 'Wednesday', time: '7:00 AM - 12:00 PM', type: 'Recyclables', ward: 'Ward 1' },
  { id: 3, day: 'Friday', time: '7:00 AM - 12:00 PM', type: 'Hazardous Waste', ward: 'Ward 1' },
  { id: 4, day: 'Tuesday', time: '7:00 AM - 12:00 PM', type: 'Organic Waste', ward: 'Ward 2' },
  { id: 5, day: 'Thursday', time: '7:00 AM - 12:00 PM', type: 'Recyclables', ward: 'Ward 2' }
];

const mockReports = [
  { 
    id: 1, 
    type: 'Missed Collection', 
    details: 'Garbage truck did not come to our street today', 
    status: 'Resolved', 
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    photo: null,
    rating: 4
  },
  { 
    id: 2, 
    type: 'Complaint', 
    details: 'Bin is overflowing and needs immediate attention', 
    status: 'In Progress', 
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    photo: null,
    rating: null
  },
  { 
    id: 3, 
    type: 'Suggestion', 
    details: 'Please add more recycling bins in our area', 
    status: 'Open', 
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    photo: null,
    rating: null
  }
];

const mockAnalytics = {
  totalReports: 156,
  resolutionRate: 92,
  totalVehicles: 12,
  totalUsers: 1250,
  weeklyPickups: 850,
  weeklyMissed: 23,
  satisfactionRate: 4.2
};

// Mock data for communication
const mockMessages = [
  {
    id: 1,
    from: { id: 1, name: 'Nitesh Kumar', role: 'resident' },
    to: { id: 4, name: 'Admin User', role: 'admin' },
    content: 'Hi, I noticed the garbage truck missed our street today. Can you please check?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    type: 'report'
  },
  {
    id: 2,
    from: { id: 4, name: 'Admin User', role: 'admin' },
    to: { id: 3, name: 'Ravi Singh', role: 'driver' },
    content: 'Please check Ward 1 - Main Street. Resident reported missed collection.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    type: 'assignment'
  },
  {
    id: 3,
    from: { id: 3, name: 'Ravi Singh', role: 'driver' },
    to: { id: 4, name: 'Admin User', role: 'admin' },
    content: 'On my way to Ward 1. Will complete the collection within 30 minutes.',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    read: true,
    type: 'update'
  },
  {
    id: 4,
    from: { id: 3, name: 'Ravi Singh', role: 'driver' },
    to: { id: 1, name: 'Nitesh Kumar', role: 'resident' },
    content: 'Collection completed for your street. Sorry for the delay!',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    read: false,
    type: 'completion'
  }
];

const mockNotifications = [
  {
    id: 1,
    userId: 1,
    title: 'Collection Completed',
    message: 'Your waste collection has been completed for today.',
    type: 'success',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    read: false
  },
  {
    id: 2,
    userId: 3,
    title: 'New Assignment',
    message: 'You have been assigned to collect waste from Ward 1 - Main Street.',
    type: 'info',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false
  },
  {
    id: 3,
    userId: 4,
    title: 'System Alert',
    message: 'High number of missed collections reported in Ward 1.',
    type: 'warning',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    await delay(1000);
    
    // Demo credentials mapping
    const demoUsers = {
      'nitesh@example.com': { id: 1, name: 'Nitesh Kumar', email: 'nitesh@example.com', role: 'resident', ward: 'Ward 1', points: 120 },
      'asha@example.com': { id: 2, name: 'Asha Patel', email: 'asha@example.com', role: 'resident', ward: 'Ward 2', points: 150 },
      'ravi@example.com': { id: 3, name: 'Ravi Singh', email: 'ravi@example.com', role: 'driver', ward: 'Ward 1', vehicleId: 'V001' },
      'admin@example.com': { id: 4, name: 'Admin User', email: 'admin@example.com', role: 'admin', ward: 'All Wards' }
    };
    
    const user = demoUsers[credentials.email];
    if (user && credentials.password === 'password') {
      return { success: true, user };
    }
    throw new Error('Invalid credentials');
  },

  logout: async () => {
    await delay(500);
    return { success: true };
  }
};

// Waste Management API
export const wasteAPI = {
  // Schedules
  getSchedules: async () => {
    await delay(800);
    return mockSchedules;
  },

  createSchedule: async (schedule) => {
    await delay(1000);
    const newSchedule = { ...schedule, id: Date.now() };
    mockSchedules.push(newSchedule);
    return newSchedule;
  },

  updateSchedule: async (id, updates) => {
    await delay(800);
    const index = mockSchedules.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSchedules[index] = { ...mockSchedules[index], ...updates };
      return mockSchedules[index];
    }
    throw new Error('Schedule not found');
  },

  deleteSchedule: async (id) => {
    await delay(600);
    const index = mockSchedules.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSchedules.splice(index, 1);
      return { success: true };
    }
    throw new Error('Schedule not found');
  },

  // Reports
  getReports: async () => {
    await delay(800);
    return mockReports;
  },

  createReport: async (report) => {
    await delay(1000);
    const newReport = { 
      ...report, 
      id: Date.now(), 
      status: 'Open',
      createdAt: new Date().toISOString(),
      rating: null
    };
    mockReports.unshift(newReport);
    return newReport;
  },

  updateReport: async (id, updates) => {
    await delay(800);
    const index = mockReports.findIndex(r => r.id === id);
    if (index !== -1) {
      mockReports[index] = { ...mockReports[index], ...updates };
      return mockReports[index];
    }
    throw new Error('Report not found');
  },

  // Analytics
  getAnalytics: async () => {
    await delay(600);
    return mockAnalytics;
  }
};

// Vehicle Tracking API
export const trackingAPI = {
  getVehicles: async () => {
    await delay(800);
    return mockVehicles;
  },

  updateVehicleStatus: async (vehicleId, status) => {
    await delay(600);
    const vehicle = mockVehicles.find(v => v.vehicleId === vehicleId);
    if (vehicle) {
      vehicle.status = status;
      vehicle.lastUpdated = new Date().toISOString();
      return vehicle;
    }
    throw new Error('Vehicle not found');
  },

  updateVehicleLocation: async (vehicleId, lat, lng) => {
    await delay(500);
    const vehicle = mockVehicles.find(v => v.vehicleId === vehicleId);
    if (vehicle) {
      vehicle.lat = lat;
      vehicle.lng = lng;
      vehicle.lastUpdated = new Date().toISOString();
      return vehicle;
    }
    throw new Error('Vehicle not found');
  }
};

// Admin API
export const adminAPI = {
  getUsers: async () => {
    await delay(800);
    return mockUsers;
  },

  createUser: async (user) => {
    await delay(1000);
    const newUser = { ...user, id: Date.now() };
    mockUsers.push(newUser);
    return newUser;
  },

  updateUser: async (id, updates) => {
    await delay(800);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...updates };
      return mockUsers[index];
    }
    throw new Error('User not found');
  },

  deleteUser: async (id) => {
    await delay(600);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
      return { success: true };
    }
    throw new Error('User not found');
  },

  getSystemStats: async () => {
    await delay(600);
    return {
      totalUsers: mockUsers.length,
      totalVehicles: mockVehicles.length,
      totalReports: mockReports.length,
      activeVehicles: mockVehicles.filter(v => v.status === 'On Route').length,
      pendingReports: mockReports.filter(r => r.status === 'Open').length
    };
  }
};

// Driver API
export const driverAPI = {
  getDriverSchedule: async (driverId) => {
    await delay(800);
    return mockSchedules.filter(s => s.ward === 'Ward 1'); // Assuming driver is assigned to Ward 1
  },

  reportIncident: async (incident) => {
    await delay(1000);
    const newIncident = { 
      ...incident, 
      id: Date.now(), 
      status: 'Open',
      createdAt: new Date().toISOString()
    };
    // Add to reports
    mockReports.unshift(newIncident);
    return newIncident;
  },

  updateDriverStatus: async (driverId, status) => {
    await delay(600);
    // Update vehicle status for the driver
    const vehicle = mockVehicles.find(v => v.driver === 'Ravi Singh');
    if (vehicle) {
      vehicle.status = status;
      vehicle.lastUpdated = new Date().toISOString();
      return vehicle;
    }
    throw new Error('Driver vehicle not found');
  }
};

// Communication API
export const communicationAPI = {
  // Messages
  getMessages: async (userId) => {
    await delay(800);
    return mockMessages.filter(m => m.from.id === userId || m.to.id === userId);
  },

  sendMessage: async (message) => {
    await delay(1000);
    const newMessage = {
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false
    };
    mockMessages.unshift(newMessage);
    return newMessage;
  },

  markMessageAsRead: async (messageId) => {
    await delay(500);
    const message = mockMessages.find(m => m.id === messageId);
    if (message) {
      message.read = true;
    }
    return { success: true };
  },

  // Notifications
  getNotifications: async (userId) => {
    await delay(600);
    return mockNotifications.filter(n => n.userId === userId);
  },

  markNotificationAsRead: async (notificationId) => {
    await delay(500);
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return { success: true };
  },

  // Real-time updates
  getSystemUpdates: async () => {
    await delay(800);
    return {
      activeDrivers: mockVehicles.filter(v => v.status === 'On Route').length,
      pendingReports: mockReports.filter(r => r.status === 'Open').length,
      todayCollections: 156,
      systemAlerts: [
        { type: 'warning', message: 'High traffic in Ward 1 area' },
        { type: 'info', message: 'New recycling bins installed in Ward 2' }
      ]
    };
  },

  // Broadcast messages (Admin to all users)
  broadcastMessage: async (message) => {
    await delay(1000);
    const broadcast = {
      id: Date.now(),
      from: { id: 4, name: 'Admin User', role: 'admin' },
      to: { id: 'all', name: 'All Users', role: 'all' },
      content: message.content,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'broadcast'
    };
    mockMessages.unshift(broadcast);
    return broadcast;
  }
};

// Export all APIs
export default {
  auth: authAPI,
  waste: wasteAPI,
  tracking: trackingAPI,
  admin: adminAPI,
  driver: driverAPI,
  communication: communicationAPI
}; 