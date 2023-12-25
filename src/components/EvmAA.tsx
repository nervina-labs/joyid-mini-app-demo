import {useState} from "react";
import {Hex, stringToBytes, parseAbi, encodeFunctionData} from "viem";
import {LocalAccountSigner} from "@alchemy/aa-core"
import {SessionKeyProvider, getPermissionFromABI, ParamOperator, constants} from "@zerodev/sdk";
import {useWebApp} from "@vkruglikov/react-telegram-web-app";
import {WebApp} from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import { useAaAddress, useCurrentAddress, useUpdateAaAddress } from "../hooks/useAccount";
import { JoySigner } from "../evm-aa/signer";
import { getAAProvider } from "../evm-aa/provider";
import { ECDSAProvider } from "@zerodev/sdk";
import { useEffect } from "react";
import { TEST_SESSION_KEY, ZERO_DEV_PROJECT_ID } from "../env";

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
  const [sessionKeyProvider, setSessionKeyProvider] = useState<SessionKeyProvider>();
  const [sessionAddress, setSessionAddress] = useState<Hex>();
  const webApp = useWebApp() as WebApp;

  const [createLoading, setCreateLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [createSessionLoading, setCreateSessionLoading] = useState(false);
  const [sessionMintLoading, setSessionMintLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const signer = new JoySigner(webApp, address as Hex);
      setProvider(await getAAProvider(signer));
    };
    init();
  }, [address, webApp]); 

  const onCreate = async () => {
    setCreateLoading(true);
    const aaAddr = await provider?.getAddress();
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

  const onCreateSessionKey = async () => {
    setCreateSessionLoading(true);
    const sessionKey = LocalAccountSigner.privateKeyToAccountSigner(TEST_SESSION_KEY);
    const sessionProvider = await SessionKeyProvider.init({
      projectId: ZERO_DEV_PROJECT_ID,
      defaultProvider: provider,
      sessionKey: sessionKey!,
      sessionKeyData: {
        validAfter: 0,
        validUntil: 0,
        permissions: [
          getPermissionFromABI({
            target: contractAddress,
            valueLimit: 0n,
            abi: contractABI,
            functionName: "mint",
            args: [
              {
                operator: ParamOperator.EQUAL,
                value: aaAddress!,
              },
            ],
          }),
        ],
        paymaster: constants.oneAddress,
      },
    });
    setSessionKeyProvider(sessionProvider)
    const addr = await sessionKey.getAddress();
    setSessionAddress(addr);
    setCreateSessionLoading(false);
  };

  const mintWithSessionKey = async () => {
    setSessionMintLoading(true)
    const {hash} = await sessionKeyProvider!.sendUserOperation({
      target: contractAddress,
      data: encodeFunctionData({
        abi: contractABI,
        functionName: "mint",
        args: [aaAddress!],
      }),
    });
    await sessionKeyProvider!.waitForUserOperationTransaction(hash as Hex);
    alert(`Mint NFT with Session Key tx hash: ${hash}`)
    setSessionMintLoading(false);
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

          <button className="btn btn-primary capitalize w-[200px] mt-[24px]" onClick={onCreateSessionKey}>
            {createSessionLoading ? <span className="loading loading-spinner loading-md" /> : "Create Session Key"}
          </button>
          {sessionAddress && (
            <div className="mt-[12px]">
              <div>The session key has been created successfully</div>
              <button className="btn btn-primary capitalize w-[240px] mt-[12px]" onClick={mintWithSessionKey}>
                {sessionMintLoading ? <span className="loading loading-spinner loading-md" /> : "Mint NFT with Session Key"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
