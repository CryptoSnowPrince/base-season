import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, AvatarComponent } from '@rainbow-me/rainbowkit';
import Image from "next/image";

import avatar from "../assets/avatar.png";

import { config } from '../wagmi';

const client = new QueryClient();


const WalletAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  return <Image
    src={avatar.src}
    height={size}
    width={size}
    alt="bse"
    style={{ borderRadius: 999 }}
  />;
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider avatar={WalletAvatar}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
