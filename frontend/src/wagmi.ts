import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  baseSepolia,
  base,
} from 'wagmi/chains';

export const MODE = 0; // 0: TEST, 1: MAIN

export const chain = MODE ? base : baseSepolia;
export const voteCA = MODE ? "" : "0x1f00D2128b7a8bE59faA6d018D0BF4622eD45c1f";
export const tokenCA = MODE ? "0xb0492857994e2Af4aD0fa41D10BD711d4534f768" : "0x531A412CC29b76CeF128Ad0d5F69aE63d53B3450";

export const REFETCH_INTERVAL = 10000;
export const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
export const MAX_UINT256_HALF = '65792089237316195423570985008687907853269984665640564039457584007913129639935';

export const events = [
  {
    title: 'Toshi vs Mochi vs Floppa vs Miggles',
    image: '/images/group1.jpg',
    startTime: new Date(Date.UTC(2024, 9, 1, 18, 0, 0)),
    endTime: new Date(Date.UTC(2024, 9, 2, 18, 0, 0)),
    items: [0, 1, 2, 3]
  },
  {
    title: 'Doginme vs Benji vs Boge vs Ski',
    image: '/images/group2.jpg',
    startTime: new Date(Date.UTC(2024, 9, 5, 18, 0, 0)),
    endTime: new Date(Date.UTC(2024, 9, 6, 18, 0, 0)),
    items: [4, 5, 6, 7]
  },
  {
    title: 'Crash vs Chomp vs MABA vs Toby',
    image: '/images/group3.jpg',
    startTime: new Date(Date.UTC(2024, 9, 8, 18, 0, 0)),
    endTime: new Date(Date.UTC(2024, 10, 9, 18, 0, 0)),
    items: [8, 9, 10, 11]
  },
  {
    title: 'Bepe vs Doomer vs Weirdo vs Normie',
    image: '/images/group4.jpg',
    startTime: new Date(Date.UTC(2024, 9, 11, 18, 0, 0)),
    endTime: new Date(Date.UTC(2024, 9, 12, 18, 0, 0)),
    items: [12, 13, 14, 15]
  },
  {
    title: 'Mfer vs Degen vs Chad vs Bario',
    image: '/images/group5.jpg',
    startTime: new Date(Date.UTC(2024, 9, 15, 18, 0, 0)),
    endTime: new Date(Date.UTC(2024, 9, 16, 18, 0, 0)),
    items: [16, 17, 18, 19]
  },
  {
    title: 'Okayeg vs Roost vs Caw vs Boda',
    image: '/images/group6.jpg',
    startTime: new Date(Date.UTC(2024, 9, 15, 18, 0, 0)),
    endTime: new Date(Date.UTC(2024, 9, 16, 18, 0, 0)),
    items: [20, 21, 22, 23]
  },
  {
    title: 'TYBG vs CTO vs Higher vs Chuck',
    image: '/images/group7.jpg',
    startTime: new Date(Date.UTC(2024, 9, 15, 18, 0, 0)),
    endTime: new Date(Date.UTC(2024, 9, 16, 18, 0, 0)),
    items: [24, 25, 26, 27]
  },
  {
    title: 'Birb vs Grug vs Brett vs Keycat',
    image: '/images/group8.jpg',
    startTime: new Date(Date.UTC(2024, 9, 15, 18, 0, 0)),
    endTime: new Date(Date.UTC(2024, 9, 16, 18, 0, 0)),
    items: [28, 29, 30, 31]
  },
];

export const config = getDefaultConfig({
  appName: 'Base Season',
  projectId: '2894c00f2ded864307751cb1fc07564f',
  chains: [chain],
  ssr: true,
});