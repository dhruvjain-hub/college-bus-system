export type UserRole = 'student' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
}

export interface Student extends User {
  role: 'student';
  busId: string;
  stopId: string;
  course: string;
  year: number;
  passValidity: string;
  emergencyContact: string;
}

export interface Driver extends User {
  role: 'driver';
  busId: string;
  licenseNumber: string;
  experience: number;
}

export interface Bus {
  id: string;
  number: string;
  capacity: number;
  routeId: string;
  driverId: string;
  status: 'online' | 'offline' | 'delayed' | 'breakdown';
  currentLocation?: {
    lat: number;
    lng: number;
  };
  lastUpdated?: string;
}

export interface Route {
  id: string;
  name: string;
  stops: Stop[];
  startTime: string;
  endTime: string;
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  arrivalTime: string;
  order: number;
}

export interface MissedBusRequest {
  id: string;
  studentId: string;
  studentName: string;
  location: { lat: number; lng: number };
  timestamp: string;
  status: 'pending' | 'assigned' | 'resolved';
  assignedBusId?: string;
  notes?: string;
}

export interface BreakdownReport {
  id: string;
  busId: string;
  driverId: string;
  location: { lat: number; lng: number };
  description: string;
  images?: string[];
  timestamp: string;
  status: 'reported' | 'in-progress' | 'resolved';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  timestamp: string;
  read: boolean;
  targetRole?: UserRole;
  targetUserId?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  busId: string;
  date: string;
  pickup: boolean;
  dropoff: boolean;
}
