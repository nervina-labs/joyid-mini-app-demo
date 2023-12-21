import {useState} from "react";
import {Hex, encodeFunctionData, parseAbi, stringToBytes} from "viem";
import {useWebApp} from "@vkruglikov/react-telegram-web-app";
import {WebApp} from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import { useAaAddress, useCurrentAddress, useUpdateAaAddress } from "../hooks/useAccount";
import { JoySigner } from "../evm-aa/signer";
import { getAAProvider } from "../evm-aa/provider";
import { ECDSAProvider } from "@zerodev/sdk";
import { useEffect } from "react";

// The NFT contract we will be interacting with
const contractAddress = '0x34bE7f35132E97915633BC1fc020364EA5134863'
const contractABI = parseAbi([
  'function mint(address _to) public',
  'function balanceOf(address owner) external view returns (uint256 balance)'
])

export const EvmAA = () => {
  const address = useCurrentAddress();
  const aaAddress = useAaAddress()
  const updateAaAddress = useUpdateAaAddress();
  const [provider, setProvider] = useState<ECDSAProvider>();
  const [signature, setSignature] = useState<Hex>();
  const webApp = useWebApp() as WebApp;

  const [createLoading, setCreateLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);

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

  const onMintNFT = async () => {
    setMintLoading(true)
    // Mint the NFT
    try {
      const {hash} = await provider!.sendUserOperation({
        target: contractAddress,
        data: encodeFunctionData({
          abi: contractABI,
          functionName: "mint",
          args: [aaAddress!],
        }),
      });
      await provider!.waitForUserOperationTransaction(hash as Hex);
      alert(`Mint NFT transaction hash: ${hash}`);
    } catch (error) {
      console.error(error)
      alert(`Mint NFT error: ${error}`);
    } finally {
      setMintLoading(false)
    }
  }

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
          <button className="btn btn-primary capitalize w-[200px] mt-[12px]" onClick={onMintNFT}>
            {mintLoading ? <span className="loading loading-spinner loading-md" /> : "Mint NFT"}
          </button>
        </div>
      )}
    </div>
  );
}
