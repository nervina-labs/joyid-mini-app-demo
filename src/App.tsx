import * as React from "react";
import {Address} from "viem";
import {disconnect, getConnectedAddress, buildConnectUrl} from "@joyid/evm";
import {useWebApp} from "@vkruglikov/react-telegram-web-app"
import {WebApp} from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import "./App.css";

export default function App() {
  const [address, setAddress] = React.useState<Address | null>(getConnectedAddress());
  const webApp = useWebApp() as WebApp;

  const onConnect = async () => {
    try {
      const url = buildConnectUrl({
        redirectURL: "https://joyid-bot.vercel.app/",
      });
      webApp.openLink && webApp.openLink(url);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div id="app">
      {address ? (
        <>
          <h1 className="text-xl mb-4">{`Connected: ${address}`}</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              disconnect();
              setAddress(null);
            }}
          >
            Disconnect
          </button>
          <div className="divider" />
        </>
      ) : (
        <button className="btn btn-primary" onClick={onConnect}>
          Connect JoyID
        </button>
      )}
    </div>
  );
}
