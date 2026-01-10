import { Student, Driver, Bus, Route, Stop, MissedBusRequest, Notification, Attendance } from './types';

export const mockStops: Stop[] = [
  { id: 's1', name: 'City Center', lat: 12.9716, lng: 77.5946, arrivalTime: '07:30', order: 1 },
  { id: 's2', name: 'MG Road', lat: 12.9758, lng: 77.6066, arrivalTime: '07:45', order: 2 },
  { id: 's3', name: 'Indiranagar', lat: 12.9784, lng: 77.6408, arrivalTime: '08:00', order: 3 },
  { id: 's4', name: 'Koramangala', lat: 12.9352, lng: 77.6245, arrivalTime: '08:15', order: 4 },
  { id: 's5', name: 'College Campus', lat: 12.9249, lng: 77.6101, arrivalTime: '08:30', order: 5 },
];

export const mockRoutes: Route[] = [
  {
    id: 'r1',
    name: 'Route A - North Campus',
    stops: mockStops,
    startTime: '07:30',
    endTime: '08:30',
  },
  {
    id: 'r2',
    name: 'Route B - South Campus',
    stops: mockStops.slice(2),
    startTime: '07:45',
    endTime: '08:45',
  },
];

export const mockBuses: Bus[] = [
  {
    id: 'b1',
    number: 'KA-01-AB-1234',
    capacity: 45,
    routeId: 'r1',
    driverId: 'd1',
    status: 'online',
    currentLocation: { lat: 12.9758, lng: 77.6066 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'b2',
    number: 'KA-01-CD-5678',
    capacity: 40,
    routeId: 'r2',
    driverId: 'd2',
    status: 'delayed',
    currentLocation: { lat: 12.9352, lng: 77.6245 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'b3',
    number: 'KA-01-EF-9012',
    capacity: 50,
    routeId: 'r1',
    driverId: 'd3',
    status: 'offline',
  },
];

export const mockStudents: Student[] = [
  {
    id: 'st1',
    name: 'Rahul Sharma',
    email: 'rahul@college.edu',
    phone: '+91 98765 43210',
    role: 'student',
    busId: 'b1',
    stopId: 's2',
    course: 'Computer Science',
    year: 3,
    passValidity: '2025-06-30',
    emergencyContact: '+91 98765 00000',
  },
  {
    id: 'st2',
    name: 'Priya Patel',
    email: 'priya@college.edu',
    phone: '+91 98765 43211',
    role: 'student',
    busId: 'b1',
    stopId: 's3',
    course: 'Electronics',
    year: 2,
    passValidity: '2025-06-30',
    emergencyContact: '+91 98765 00001',
  },
];

export const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'Raju Kumar',
    email: 'raju@transport.edu',
    phone: '+91 98765 11111',
    role: 'driver',
    busId: 'b1',
    licenseNumber: 'DL-1234567890',
    experience: 8,
  },
  {
    id: 'd2',
    name: 'Suresh Babu',
    email: 'suresh@transport.edu',
    phone: '+91 98765 22222',
    role: 'driver',
    busId: 'b2',
    licenseNumber: 'DL-0987654321',
    experience: 5,
  },
];

export const mockMissedBusRequests: MissedBusRequest[] = [
  {
    id: 'mbr1',
    studentId: 'st1',
    studentName: 'Rahul Sharma',
    location: { lat: 12.9716, lng: 77.5946 },
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'pending',
    notes: 'Waiting near City Center mall entrance',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Route Change',
    message: 'Route A will take a detour via Brigade Road due to construction.',
    type: 'warning',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    read: false,
  },
  {
    id: 'n2',
    title: 'Bus Delayed',
    message: 'Bus KA-01-CD-5678 is running 10 minutes late due to traffic.',
    type: 'info',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    read: true,
  },
  {
    id: 'n3',
    title: 'Holiday Notice',
    message: 'No transport service on Republic Day (26th Jan).',
    type: 'info',
    timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    read: true,
  },
];

export const mockAttendance: Attendance[] = [
  { id: 'a1', studentId: 'st1', busId: 'b1', date: '2025-01-02', pickup: true, dropoff: true },
  { id: 'a2', studentId: 'st1', busId: 'b1', date: '2025-01-01', pickup: true, dropoff: true },
  { id: 'a3', studentId: 'st2', busId: 'b1', date: '2025-01-02', pickup: true, dropoff: false },
];

export const demoUsers = {
  student: mockStudents[0],
  driver: mockDrivers[0],
  admin: {
    id: 'admin1',
    name: 'Dr. Transport Head',
    email: 'admin@college.edu',
    phone: '+91 98765 00000',
    role: 'admin' as const,
  },
};
