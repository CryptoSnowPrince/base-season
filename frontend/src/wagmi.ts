import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  baseSepolia,
  base,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Base Season',
  projectId: '2894c00f2ded864307751cb1fc07564f',
  chains: [
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [baseSepolia] : []),
  ],
  ssr: true,
});