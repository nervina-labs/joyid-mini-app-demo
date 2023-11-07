import * as React from "react";
import {Address} from "viem";
import {connect, disconnect, getConnectedAddress} from "@joyid/evm";
import "./App.css";

export default function App() {
  const [address, setAddress] = React.useState<Address | null>(getConnectedAddress());
  const onConnect = async () => {
    try {
      const res = await connect();
      setAddress(res);
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
