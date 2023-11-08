import * as React from "react";
import {Address} from "viem";
import {connectCallback, connectWithRedirect, disconnect, getConnectedAddress} from "@joyid/evm";
import "./App.css";

export default function App() {
  const [address, setAddress] = React.useState<Address | null>(getConnectedAddress());

  React.useEffect(() => {
    try {
      const res = connectCallback(window.location.href);
      setAddress(res.address as Address);
    } catch (error) {
      //
    }
  }, [window.location.href]);

  const onConnect = async () => {
    try {
      connectWithRedirect("https://joyid-bot.dev/");
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
