import React, {useMemo, useState} from "react";
import {Address, Hex, parseEther} from "viem";
import {useQuery} from "react-query";
import {disconnect, buildConnectUrl, buildSignMessageUrl, buildSignTxURL} from "@joyid/evm";
import {useWebApp} from "@vkruglikov/react-telegram-web-app"
import {WebApp} from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import "./App.css";
import { Action, generateToken } from "./helper";
import { JOYID_APP_URL } from "./env";
import { api } from "./api";
import { QueryKey } from "./api/QueryKey";

export default function App() {
  const [address, setAddress] = useState<Address | null>(null);
  const [message, setMessage] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [signature, setSignature]= useState('')
  const [txHash, setTxHash] = useState('')

  const [connectLoading, setConnectLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const webApp = useWebApp() as WebApp;

  const {connectTgToken, signTgToken, sendTgToken} = useMemo(() => {
    const userId = webApp.initData;
    return {
      connectTgToken: generateToken(userId, Action.Connect),
      signTgToken: generateToken(userId, Action.Sign),
      sendTgToken: generateToken(userId, Action.Send),
    };
  }, [webApp.initData]);

  const onChange = (set: Function) => {
    return (e: React.FormEvent<HTMLInputElement>) => {
      set(e.currentTarget.value);
    }
  }

  useQuery([QueryKey.GetBotState, "connect"], async () => {
    const res = await api.getBotState(connectTgToken);
    setAddress(res.data.result as Hex)
    setConnectLoading(false);
  }, {
    enabled: connectLoading && !address,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchInterval: 500,
    retry: 240,
  });

  useQuery(
    [QueryKey.GetBotState, "sign"],
    async () => {
      const res = await api.getBotState(signTgToken);
      setSignature(res.data.result)
      setSignLoading(false)
    },
    {
      enabled: signLoading && !signature,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: 500,
      retry: 240,
    }
  );

  useQuery(
    [QueryKey.GetBotState, "send"],
    async () => {
      const res = await api.getBotState(sendTgToken);
      setTxHash(res.data.result)
      setSendLoading(false)
    },
    {
      enabled: sendLoading && !txHash,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: 500,
      retry: 240,
    }
  );
  

  const onConnect = () => {
    try {
      const userId = webApp.initData
      const token = generateToken(userId, Action.Connect);
      setConnectLoading(true);
      const url = buildConnectUrl({
        joyidAppURL: `${JOYID_APP_URL}?token=${token}}`,
        redirectURL: "https://joyid-bot.vercel.app/",
      });
      webApp.openLink && webApp.openLink(url);
    } catch (error) {
      console.log(error);
    }
  };

  const onSignMessage = () => {
    try {
      const userId = webApp.initData;
      setSignLoading(true)
      const url = buildSignMessageUrl(message, {
        address: address!,
        joyidAppURL: `${JOYID_APP_URL}?token=${generateToken(userId, Action.Connect)}}`,
        redirectURL: "https://joyid-bot.vercel.app/",
      });
      webApp.openLink && webApp.openLink(url);
    } catch (error) {
      console.log(error);
    }
  }

  const onSendTx = async () => {
    try {
      const userId = webApp.initData;
      setSendLoading(true);
      const url = buildSignTxURL({
        tx: {
          to: toAddress as Hex,
          from: address! as Hex,
          value: parseEther(amount.toString()).toString(),
        },
        signerAddress: address!,
        joyidAppURL: `${JOYID_APP_URL}?token=${generateToken(userId, Action.Connect)}}`,
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
          <div className="my-[30px]">
            <h2 className="text-xl">Sign message: </h2>
            <input
              type="text"
              placeholder="Type message"
              className="input input-bordered input-accent w-full max-w-xs mt-[4px]"
              onChange={onChange(setMessage)}
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
              onChange={onChange(setToAddress)}
            />
            <input
              type="number"
              placeholder="Amount"
              className="input input-bordered input-accent w-full max-w-xs mt-[8px]"
              onChange={onChange(setAmount)}
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
