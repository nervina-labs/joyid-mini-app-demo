import {useState} from "react";
import {Hex, stringToBytes} from "viem";
import {useWebApp} from "@vkruglikov/react-telegram-web-app";
import {WebApp} from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import { useAaAddress, useCurrentAddress, useUpdateAaAddress } from "../hooks/useAccount";
import { JoySigner } from "../evm-aa/signer";
import { getAAProvider } from "../evm-aa/provider";
import { ECDSAProvider } from "@zerodev/sdk";
import { useEffect } from "react";

export const EvmAA = () => {
  const address = useCurrentAddress();
  const aaAddress = useAaAddress()
  const updateAaAddress = useUpdateAaAddress();
  const [provider, setProvider] = useState<ECDSAProvider>();
  const [signature, setSignature] = useState<Hex>();
  const webApp = useWebApp() as WebApp;

  const [createLoading, setCreateLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const signer = new JoySigner(webApp, address as Hex);
      setProvider(await getAAProvider(signer));
    };
    init();
  }, [address, webApp]); 

  const onCreate = async () => {
    setCreateLoading(true);
    const aaAddr = await provider?.account?.getAddress();
    updateAaAddress(aaAddr);
    setCreateLoading(false);
  };

  const onSignMessage = async () => {
    const message = stringToBytes("Hello JoyID");
    setSignLoading(true)
    const sig = await provider?.signMessage(message);
    setSignature(sig);
    setSignLoading(false)
  };

  return (
    <div>
      <button className="btn btn-primary capitalize w-[200px]" onClick={onCreate}>
        {createLoading ? <span className="loading loading-spinner loading-md" /> : "Create AA Address"}
      </button>
      {aaAddress && (
        <div className="mt-[12px]">
          <div>{`AA Address: ${aaAddress}`}</div>

          <div className="mt-[30px]">The unsigned message is: "Hello JoyID"</div>
          <button className="btn btn-primary capitalize w-[200px] mt-[12px]" onClick={onSignMessage}>
            {signLoading ? <span className="loading loading-spinner loading-md" /> : "Sign Message"}
          </button>
          {signature && (
            <div>
              <div>The signature is</div>
              <div className="break-words">{signature}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
