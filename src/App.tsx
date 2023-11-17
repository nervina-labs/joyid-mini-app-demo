import React, {useState} from "react";
import {Address, Hex, parseEther} from "viem";
import {useQuery} from "react-query";
import {disconnect} from "@joyid/evm";
import {useWebApp} from "@vkruglikov/react-telegram-web-app"
import {WebApp} from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import "./App.css";
import { buildConnectTokenAndUrl, buildSendTxTokenAndUrl, buildSignMsgTokenAndUrl } from "./helper";
import {api, QueryKey} from "./api";

export default function App() {
  const [address, setAddress] = useState<Address | null>(null);
  const [message, setMessage] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const webApp = useWebApp() as WebApp;

  const [connectLoading, setConnectLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const [connectToken, setConnectToken] = useState("");
  const [signToken, setSignToken] = useState("");
  const [sendToken, setSendToken] = useState("");

  useQuery(
    [QueryKey.GetBotMessage, "connect"],
    async () => {
      const {data} = await api.getTgBotMessage(connectToken);
      return data.message
    },
    {
      enabled: !!webApp.initData && connectLoading && !address,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: 500,
      retry: 240,
      onSuccess(data) {
        setAddress(data as Hex);
        setSendLoading(false);
      },
    }
  );

  useQuery(
    [QueryKey.GetBotMessage, "sign"],
    async () => {
      const {data} = await api.getTgBotMessage(signToken);
      return data.message
    },
    {
      enabled: !!webApp.initData && signLoading && !!address,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: 500,
      retry: 240,
      onSuccess(data) {
        setSignLoading(false);
        alert(`Signature: ${data}`);
      },
    }
  );

  useQuery(
    [QueryKey.GetBotMessage, "send"],
    async () => {
      const {data} = await api.getTgBotMessage(sendToken);
      return data.message;
    },
    {
      enabled: !!webApp.initData && sendLoading && !!address,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: 500,
      retry: 240,
      onSuccess(data) {
        setSendLoading(false);
        alert(`Transaction hash: ${data}`);
      },
    }
  );
  

  const onConnect = () => {
    if (webApp.initData.length === 0) {
      alert('Please open the web app in Telegram')
      return 
    }
    try {
      const {token, url} = buildConnectTokenAndUrl(webApp.initData);
      setConnectToken(token);
      setConnectLoading(true);
      webApp.openLink && webApp.openLink(url);
    } catch (error) {
      console.log(error);
    }
  };

  const onSignMessage = () => {
    if (webApp.initData.length === 0) {
      alert("Please open the web app in Telegram");
      return;
    }
    try {
      const {token, url} = buildSignMsgTokenAndUrl(webApp.initData, address!, message);
      setSignToken(token);
      setSignLoading(true);
      webApp.openLink && webApp.openLink(url);
    } catch (error) {
      console.log(error);
    }
  }

  const onSendTx = async () => {
    if (webApp.initData.length === 0) {
      alert("Please open the web app in Telegram");
      return;
    }
    try {
      const tx = {
        to: toAddress as Hex,
        from: address! as Hex,
        value: parseEther(amount.toString()).toString(),
      };
      const {token, url} = buildSendTxTokenAndUrl(webApp.initData, address!, tx);
      setSendToken(token);
      setSendLoading(true);
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
          <div className="my-[30px]">
            <h2 className="text-xl">Sign message: </h2>
            <input
              type="text"
              placeholder="Type message"
              className="input input-bordered input-accent w-full max-w-xs mt-[4px]"
              onChange={(e) => setMessage(e.currentTarget.value)}
            />
            <div>
              <button className="btn btn-primary mt-[10px] w-[120px] capitalize" disabled={!message} onClick={onSignMessage}>
                {signLoading ? <span className="loading loading-spinner loading-md" /> : "Sign"}
              </button>
            </div>
            <div className="divider" />
          </div>

          <div className="my-[30px]">
            <h2 className="text-xl">Send transaction: </h2>
            <input
              type="text"
              placeholder="To address"
              className="input input-bordered input-accent w-full max-w-xs mt-[8px]"
              onChange={(e) => setToAddress(e.currentTarget.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              className="input input-bordered input-accent w-full max-w-xs mt-[8px]"
              onChange={(e) => setAmount(Number(e.currentTarget.value))}
            />
            <div>
              <button className="btn btn-primary mt-[10px] w-[60px] capitalize" disabled={amount <= 0 || !toAddress} onClick={onSendTx}>
                {sendLoading ? <span className="loading loading-spinner loading-md" /> : "Send"}
              </button>
            </div>
            <div className="divider" />
          </div>

          <button
            className="btn btn-primary capitalize w-[120px]"
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
        <button className="btn btn-primary capitalize w-[120px]" onClick={onConnect}>
          {connectLoading ? <span className="loading loading-spinner loading-md" /> : " Connect JoyID"}
        </button>
      )}
    </div>
  );
}
