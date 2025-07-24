import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

const SOMNIA_RPC = 'https://dream-rpc.somnia.network';
const CHAIN_ID = 50312;
const PRIVY_APP_ID = 'cmdh784uo003yl20nzzoa9doo';

export const PrivyProvider = ({ children }: { children: ReactNode }) => {
  return (
    <BasePrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'dark',
          accentColor: '#FFB800',
          showWalletLoginFirst: true,
          logo: 'https://cdn.brandfetch.io/idqbE4QQr5/w/64/h/64/theme/dark/logo.png?c=1bxid64Mup7aczewSAYMX&t=1748315307220'
        }
      }}
    >
      {children}
    </BasePrivyProvider>
  );
};
