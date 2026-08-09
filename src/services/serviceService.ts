import type { Service } from '../types/service';

const mockServices: Service[] = [
 {
    id: '1',
    title: 'Standard Parcel Delivery',
    tag: 'EVERYDAY',
    iconName: 'FaBox',
    path: '/services/standard-parcel-delivery', // NEW
  },
  {
    id: '2',
    title: 'Outstation Bidding',
    tag: 'TRANSPARENT',
    iconName: 'FaGavel',
    path: '/services/outstation-bidding', // NEW
  },
  {
    id: '3',
    title: 'Shifting Experts',
    tag: 'END-TO-END',
    iconName: 'FaTruckMoving',
    path: '/services/shifting-experts', // NEW
  },
  {
    id: '4',
    title: 'Local Adda',
    tag: 'INSTANT',
    iconName: 'FaLocationArrow',
    path: '/services/local-adda', // NEW
  },
];

const mockNetworkDelay = () => new Promise((resolve) => setTimeout(resolve, 500));

export const getServices = async (): Promise<Service[]> => {
  await mockNetworkDelay();
  return mockServices;
};