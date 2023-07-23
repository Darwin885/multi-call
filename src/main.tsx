import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { RecoilRoot } from 'recoil'
import { createConfig, configureChains, WagmiConfig } from 'wagmi'
import { arbitrumGoerli, bscTestnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets'
import '@rainbow-me/rainbowkit/styles.css'
import MultiCall from './components/multicall.tsx'


const { chains, publicClient } = configureChains([arbitrumGoerli, bscTestnet], [publicProvider()])

const connectors = connectorsForWallets([{
  groupName: 'Recommend',
  wallets: [
    metaMaskWallet({ projectId: 'sample_id', chains })
  ]
}])

const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <RecoilRoot>
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        <App />
        <MultiCall />
      </RainbowKitProvider>
    </WagmiConfig>
  </RecoilRoot>
  // </React.StrictMode>,
)
