import {useState} from "react";
import {Address, Hex, parseEther} from "viem";
import {useQuery} from "react-query";
import {disconnect} from "@joyid/evm";
import {useWebApp} from "@vkruglikov/react-telegram-web-app"
import {WebApp} from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import "./App.css";
import { buildConnectTokenAndUrl, buildSendTxTokenAndUrl, buildSignMsgTokenAndUrl } from "./helper";
import {api, ConnectResp, QueryKey, SendResp, SignResp} from "./api";

const USER_REJECTED = 'rejected'

export default function App() {
  const [address, setAddress] = useState<Address | null>();
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
      const {address} = await api.getTgBotMessage<ConnectResp>(connectToken);
      return address
    },
    {
      enabled: !!webApp.initData && connectLoading,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: 500,
      retry: 240,
      onSuccess(addr) {
        setConnectLoading(false);
        if (addr === USER_REJECTED) {
          alert("User refuses to connect to JoyID");
        } else {
          setAddress(addr as Hex);
        }
      },
    }
  );

  useQuery(
    [QueryKey.GetBotMessage, "sign"],
    async () => {
      const {signature} = await api.getTgBotMessage<SignResp>(signToken);
      return signature;
    },
    {
      enabled: !!webApp.initData && signLoading && !!address,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: 500,
      retry: 240,
      onSuccess(sig) {
        setSignLoading(false);
        if (sig === USER_REJECTED) {
          alert("User refuses to sign");
        } else { 
          alert(`Signing successful with result: ${sig}`);
        }
      },
    }
  );

  useQuery(
    [QueryKey.GetBotMessage, "send"],
    async () => {
      const {txHash} = await api.getTgBotMessage<SendResp>(sendToken);
      return txHash;
    },
    {
      enabled: !!webApp.initData && sendLoading && !!address,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchInterval: 500,
      retry: 240,
      onSuccess(txHash) {
        setSendLoading(false);
        if (txHash === USER_REJECTED) {
          alert("User refuses to sign and send transaction");
        } else {
          alert(`Transaction sent successfully with result: ${txHash}`);
        }
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
    <div id="app" className="text-sm">
      {address ? (
        <>
          <h1 className="text-xl mb-4">Connected: </h1>
          <div>{address}</div>
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
              className="input input-bordered input-accent w-full max-w-xs mt-[8px] text-xs"
              onChange={(e) => setToAddress(e.currentTarget.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              className="input input-bordered input-accent w-full max-w-xs mt-[8px]"
              onChange={(e) => setAmount(Number(e.currentTarget.value))}
            />
            <div>
              <button className="btn btn-primary mt-[10px] w-[80px] capitalize" disabled={amount <= 0 || !toAddress} onClick={onSendTx}>
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
        <button className="btn btn-primary capitalize w-[140px]" onClick={onConnect}>
          {connectLoading ? <span className="loading loading-spinner loading-md" /> : " Connect JoyID"}
        </button>
      )}
    </div>
  );
}
