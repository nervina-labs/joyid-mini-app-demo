import {useState} from "react";
import {Address, Hex, parseEther} from "viem";
import {useQuery} from "react-query";
import {useWebApp} from "@vkruglikov/react-telegram-web-app"
import {WebApp} from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import "./App.css";
import { buildConnectTokenAndUrl, buildSendTxTokenAndUrl, buildSignMsgTokenAndUrl } from "./helper";
import {api, ConnectResp, QueryKey, SendResp, SignResp} from "./api";

const USER_REJECTED = 'rejected'

export default function App() {
  const [address, setAddress] = useState<Address | null>(null);
  const [message, setMessage] = useState<string>("Hello");
  const [toAddress, setToAddress] = useState<string>("0x8ac36d0e764FF17dcF13b2465e77b4fe125EC2bC");
  const [amount, setAmount] = useState<number>(0.001);
  const webApp = useWebApp() as WebApp;

  const [connectLoading, setConnectLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const [connectToken, setConnectToken] = useState("");
  const [signToken, setSignToken] = useState("");
  const [sendToken, setSendToken] = useState("");

  const openUrl = (url: string) => {
    webApp.openLink && webApp.openLink(url);
  }

  const showAlert = (message: string) => {
    webApp.showAlert && webApp.showAlert(message);
  }

  const onShare = () => {
    webApp.openTelegramLink && webApp.openTelegramLink("https://t.me/share/url?url=https://app.joy.id&text=JoyID%20Passkey%20Wallet");
  };

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
          showAlert("User refuses to connect to JoyID");
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
          showAlert("User refuses to sign");
        } else { 
          showAlert(`Signing successful with result: ${sig}`);
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
          showAlert("User refuses to sign and send transaction");
        } else {
          showAlert(`Transaction sent successfully with result: ${txHash}`);
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
      openUrl(url);
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
      openUrl(url);
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
      openUrl(url);
    } catch (error) {
      console.log(error);
    } 
  };


  return (
    <div id="app">
      <div className="text-2xl sticky font-bold text-center">Mini App wallet connect demo</div>
      {address ? (
        <div className="mb-[30px]">
          <h1 className="text-xl mb-4">Connected: </h1>
          <div>{address}</div>
          <div className="my-[30px]">
            <h2 className="text-xl">Sign message: </h2>
            <input
              type="text"
              placeholder={message ? message : "Type message"}
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
              placeholder={toAddress ? toAddress : "To address"}
              className="input input-bordered input-accent w-full max-w-xs mt-[8px] text-xs"
              onChange={(e) => setToAddress(e.currentTarget.value)}
            />
            <input
              type="number"
              placeholder={amount > 0 ? amount.toString() : "Amount"}
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
              setAddress(null);
            }}
          >
            Disconnect
          </button>

          <div className="divider" />
        </div>
      ) : (
        <div className="text-center">
          <button className="btn btn-primary capitalize w-[200px] mt-[30px]" onClick={() => onConnect()}>
            {connectLoading ? <span className="loading loading-spinner loading-md" /> : "JoyID Passkey connect"}
          </button>
          <button className="btn btn-primary capitalize w-[200px] mt-[30px]" onClick={() => onShare()}>
            {connectLoading ? <span className="loading loading-spinner loading-md" /> : "Share Url"}
          </button>
        </div>
      )}
    </div>
  );
}
