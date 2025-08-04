import { Doctor } from '../types';

export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'General Practice',
    availability: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    email: 'sarah.johnson@medicare.com'
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Internal Medicine',
    availability: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00'],
    email: 'michael.chen@medicare.com'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Family Medicine',
    availability: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    email: 'emily.rodriguez@medicare.com'
  },
  {
    id: '4',
    name: 'Dr. David Wilson',
    specialty: 'Cardiology',
    availability: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'],
    email: 'david.wilson@medicare.com'
  },
  {
    id: '5',
    name: 'Dr. Lisa Thompson',
    specialty: 'Pediatrics',
    availability: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
    email: 'lisa.thompson@medicare.com'
  }
];