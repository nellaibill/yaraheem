import type { DeliveryPartner } from '@/types'

/** Default roster seeded into localStorage on first load — mock only, no real backend. */
export const defaultDeliveryPartners: DeliveryPartner[] = [
  {
    id: 'dp1',
    name: 'Ravi Kumar',
    mobile: '9123456701',
    vehicleType: 'bike',
    rating: 4.8,
    status: 'available',
    totalDeliveries: 342,
  },
  {
    id: 'dp2',
    name: 'Suresh Yadav',
    mobile: '9123456702',
    vehicleType: 'scooter',
    rating: 4.6,
    status: 'available',
    totalDeliveries: 218,
  },
  {
    id: 'dp3',
    name: 'Anil Sharma',
    mobile: '9123456703',
    vehicleType: 'bike',
    rating: 4.9,
    status: 'busy',
    totalDeliveries: 501,
  },
  {
    id: 'dp4',
    name: 'Praveen Reddy',
    mobile: '9123456704',
    vehicleType: 'bicycle',
    rating: 4.5,
    status: 'offline',
    totalDeliveries: 87,
  },
  {
    id: 'dp5',
    name: 'Manoj Singh',
    mobile: '9123456705',
    vehicleType: 'scooter',
    rating: 4.7,
    status: 'available',
    totalDeliveries: 276,
  },
]
