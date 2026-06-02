import type { Service } from '@/types/database'

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'oil-change',
    name: 'Oil Change',
    description: 'Full synthetic or conventional oil change with filter replacement and multi-point inspection.',
    duration: 45,
    price: 49.99,
  },
  {
    id: 'tire-rotation',
    name: 'Tire Rotation',
    description: 'Rotate all four tires for even wear. Includes pressure check and visual tread inspection.',
    duration: 30,
    price: 29.99,
  },
  {
    id: 'brake-inspection',
    name: 'Brake Inspection',
    description: 'Comprehensive brake system check including pads, rotors, fluid, and safety assessment.',
    duration: 60,
    price: 39.99,
  },
  {
    id: 'diagnostic-check',
    name: 'Diagnostic Check',
    description: 'Computer diagnostic scan to identify check engine lights, warning codes, and performance issues.',
    duration: 90,
    price: 89.99,
  },
]
