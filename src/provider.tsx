import * as React from "react";
import {WagmiConfig, createConfig, configureChains} from "wagmi";
import {publicProvider} from "wagmi/providers/public";
import {sepolia, polygonMumbai} from "wagmi/chains";
import {JoyIdConnector} from "@joyid/wagmi";

export const {chains, publicClient} = configureChains([sepolia, polygonMumbai], [publicProvider()]);

export const joyidConnector = new JoyIdConnector({
  chains,
  options: {
    name: "JoyID Bot",
    logo: "https://fav.farm/🆔",
    joyidAppURL: "https://testnet.joyid.dev",
  },
});

const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [joyidConnector],
});

export const Provider: React.FC<React.PropsWithChildren> = ({children}) => {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
};
