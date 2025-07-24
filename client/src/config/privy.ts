export const privyConfig = {
  loginMethods: ['wallet', 'email'],
  appearance: {
    theme: 'dark',
    accentColor: '#676FFF',
  },
  embeddedWallets: {
    noPromptOnSignature: true,
  },
  defaultChainId: 50312, // Somnia Testnet
  supportedChains: [{
    chainId: 50312,
    chainName: 'Somnia Testnet',
    nativeCurrency: {
      name: 'STT',
      symbol: 'STT',
      decimals: 18
    },
    rpcUrls: ['https://dream-rpc.somnia.network'],
    blockExplorerUrls: ['']
  }]
};
