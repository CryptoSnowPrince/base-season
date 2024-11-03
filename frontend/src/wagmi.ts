import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  baseSepolia,
  base,
} from 'wagmi/chains';

export const MODE = 1; // 0: TEST, 1: MAIN

export const chain = MODE ? base : baseSepolia;
export const voteCA = MODE ? "0x524eDADa8248380FA513e44c06cB8CBd0e65Ae02" : "0x1f00D2128b7a8bE59faA6d018D0BF4622eD45c1f";
export const tokenCA = MODE ? "0xb0492857994e2Af4aD0fa41D10BD711d4534f768" : "0x531A412CC29b76CeF128Ad0d5F69aE63d53B3450";
export const multicallCA = '0xcA11bde05977b3631167028862bE2a173976CA11';

export const TOKEN_DECIMALS = 18;
export const ETH_DECIMALS = 18;
export const REFETCH_INTERVAL = 10000;
export const MIN_ETH = 0.001;
export const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
export const MAX_UINT256_HALF = '65792089237316195423570985008687907853269984665640564039457584007913129639935';

export const events = [
  // {
  //   title: 'Toshi vs Mochi vs Floppa vs Miggles',
  //   image: '/images/group1.jpg',
  //   startTime: new Date(Date.UTC(2024, 9, 22, 18, 0, 0)),
  //   endTime: new Date(Date.UTC(2024, 9, 23, 18, 0, 0)),
  //   items: [0, 1, 2, 3]
  // },
  // {
  //   title: 'Doginme vs Benji vs Boge vs Ski',
  //   image: '/images/group2.jpg',
  //   startTime: new Date(Date.UTC(2024, 9, 22, 18, 0, 0)),
  //   endTime: new Date(Date.UTC(2024, 9, 23, 18, 0, 0)),
  //   items: [4, 5, 6, 7]
  // },
  // {
  //   title: 'Crash vs Chomp vs MABA vs Toby',
  //   image: '/images/group3.jpg',
  //   startTime: new Date(Date.UTC(2024, 9, 23, 18, 0, 0)),
  //   endTime: new Date(Date.UTC(2024, 9, 24, 18, 0, 0)),
  //   items: [8, 9, 10, 11]
  // },
  // {
  //   title: 'Bepe vs Doomer vs Weirdo vs Normie',
  //   image: '/images/group4.jpg',
  //   startTime: new Date(Date.UTC(2024, 9, 23, 18, 0, 0)),
  //   endTime: new Date(Date.UTC(2024, 9, 24, 18, 0, 0)),
  //   items: [12, 13, 14, 15]
  // },
  // {
  //   title: 'Mfer vs Degen vs Chad vs Bario',
  //   image: '/images/group5.jpg',
  //   startTime: new Date(Date.UTC(2024, 9, 24, 18, 0, 0)),
  //   endTime: new Date(Date.UTC(2024, 9, 25, 18, 0, 0)),
  //   items: [16, 17, 18, 19]
  // },
  // {
  //   title: 'Okayeg vs Roost vs Caw vs Boda',
  //   image: '/images/group6.jpg',
  //   startTime: new Date(Date.UTC(2024, 9, 24, 18, 0, 0)),
  //   endTime: new Date(Date.UTC(2024, 9, 25, 18, 0, 0)),
  //   items: [20, 21, 22, 23]
  // },
  // {
  //   title: 'TYBG vs CTO vs Higher vs Chuck',
  //   image: '/images/group7.jpg',
  //   startTime: new Date(Date.UTC(2024, 9, 25, 18, 0, 0)),
  //   endTime: new Date(Date.UTC(2024, 9, 26, 18, 0, 0)),
  //   items: [24, 25, 26, 27]
  // },
  // {
  //   title: 'Birb vs Grug vs Brett vs Keycat',
  //   image: '/images/group8.jpg',
  //   startTime: new Date(Date.UTC(2024, 9, 25, 18, 0, 0)),
  //   endTime: new Date(Date.UTC(2024, 9, 26, 18, 0, 0)),
  //   items: [32, 33, 34, 35]
  // },
  // {
  //   title: 'Doomer vs Toby vs Toshi vs Boge',
  //   image: '/images/group9.jpg',
  //   startTime: new Date(Date.UTC(2024, 9, 29, 18, 0, 0)),
  //   endTime: new Date(Date.UTC(2024, 9, 30, 18, 0, 0)),
  //   items: [36, 37, 38, 39]
  // },
  // {
  //   title: 'Higher vs Roost vs Brett vs Bario',
  //   image: '/images/group10.jpg',
  //   startTime: new Date(Date.UTC(2024, 9, 30, 18, 0, 0)),
  //   endTime: new Date(Date.UTC(2024, 10, 1, 18, 0, 0)),
  //   items: [40, 41, 42, 43]
  // },
  {
    title: 'Boge vs Roost',
    image: '/images/group11.jpg',
    startTime: new Date(Date.UTC(2024, 10, 3, 18, 0, 0)),
    endTime: new Date(Date.UTC(2024, 10, 5, 18, 0, 0)),
    items: [44, 45, 46, 47]
  },
];

export const config = getDefaultConfig({
  appName: 'Base Season',
  projectId: '2894c00f2ded864307751cb1fc07564f',
  chains: [chain],
  ssr: true,
});