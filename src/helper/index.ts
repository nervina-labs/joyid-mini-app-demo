import { Hex, keccak256 } from "viem"
import { CALLBACK_SERVER_URL, JOYID_APP_URL } from "../env";
import { TransactionRequest, buildConnectUrl, buildSignMessageUrl, buildSignTxURL } from "@joyid/miniapp";

export const SEPOLIA_RPC = "https://rpc.sepolia.org";
export const SEPOLIA_CHAIN_ID = 11155111;

export enum Action {
  Connect,
  SignMsg,
  SendTx,
}

const Colon = '%3A'
const Comma = '%2C'
/**
 * Generate the unique token for the connection between the mini app and server(whose url is CALLBACK_SERVER_URL), 
 * and you can implement your own token generation method.
 * @param action 
 * @returns 
 */
export const generateToken = (initData: string, action: Action) => {
  if (initData.length === 0) {
    throw new Error("Telegram webApp initData cannot be empty");
  }
  const data = decodeURI(initData)
  const userId = data.substring(data.indexOf(Colon) + Colon.length, data.indexOf(Comma));
  const hash = keccak256(`0x${Number(userId).toString(16)}` as Hex).substring(2);
  const rand = [...Array(8)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
  switch (action) {
    case Action.Connect: 
      return `conn${hash}${rand}`
    case Action.SignMsg:
      return `sign${hash}${rand}`;
    default:
      return `send${hash}${rand}`;
  }
}

const BASE_INIT = {
  name: "JoyID Mini App Demo",
  logo: "https://fav.farm/🆔",
  joyidAppURL: JOYID_APP_URL,
};

/**
 * Build JoyID URL to connect wallet 
 * and generate the unique token for connection between the mini app and server
 * @param initData the initData of telegram web app object to generate token{@link https://core.telegram.org/bots/webapps#initializing-mini-apps}
 * @returns the token and url for connection with JoyID Passkey Wallet
 */
export const buildConnectTokenAndUrl = (initData: string) => {
  const token = generateToken(initData, Action.Connect);
  const url = buildConnectUrl({
    ...BASE_INIT,
    miniAppToken: token,
    callbackUrl: CALLBACK_SERVER_URL,
  });
  return {token, url}
};

/**
 * Build JoyID URL to sign message with JoyID Passkey Wallet 
 * and generate the unique token for connection between the mini app and server
 * @param initData the initData of telegram web app object to generate token{@link https://core.telegram.org/bots/webapps#initializing-mini-apps}
 * @param address the Ethereum address to sign message
 * @param message the message to be signed
 * @returns the token and url for signing with JoyID Passkey Wallet
 */
export const buildSignMsgTokenAndUrl = (initData: string, address: Hex, message: string | Uint8Array) => {
  const token = generateToken(initData, Action.SignMsg);
  const url = buildSignMessageUrl(message, {
    ...BASE_INIT,
    address,
    miniAppToken: token,
    callbackUrl: CALLBACK_SERVER_URL,
  });
  return {token, url};
};

/**
 * Build JoyID URL to send Ethereum transaction with JoyID Passkey Wallet 
 * and generate the unique token for connection between the mini app and server
 * @param initData the initData of telegram web app object to generate token{@link https://core.telegram.org/bots/webapps#initializing-mini-apps}
 * @param address the Ethereum address to sign message
 * @param tx the Ethereum transaction to be signed and sended
 * @returns the token and url for transaction sending with JoyID Passkey Wallet
 */
export const buildSignTxTokenAndUrl = (initData: string, address: Hex, tx: TransactionRequest) => {
  const token = generateToken(initData, Action.SendTx);
  const url = buildSignTxURL({
    ...BASE_INIT,
    tx,
    signerAddress: address,
    miniAppToken: token,
    callbackUrl: CALLBACK_SERVER_URL,
    isSend: false,
    // the network and rpcURL can be empty and if empty, the chain will be the JoyID default chain
    network: {
      name: "Sepolia",
      chainId: SEPOLIA_CHAIN_ID,
    },
    // The Sepolia testnet has been supported by JoyID wallet, so the rpcURL is optional
    // rpcURL: SEPOLIA_RPC,
  });
  return {token, url};
};


/**
 * Build JoyID URL to send Ethereum transaction with JoyID Passkey Wallet 
 * and generate the unique token for connection between the mini app and server
 * @param initData the initData of telegram web app object to generate token{@link https://core.telegram.org/bots/webapps#initializing-mini-apps}
 * @param address the Ethereum address to sign message
 * @param tx the Ethereum transaction to be signed and sended
 * @returns the token and url for transaction sending with JoyID Passkey Wallet
 */
export const buildSendTxTokenAndUrl = (initData: string, address: Hex, tx: TransactionRequest) => {
  const token = generateToken(initData, Action.SendTx);
  const url = buildSignTxURL({
    ...BASE_INIT,
    tx,
    signerAddress: address,
    miniAppToken: token,
    callbackUrl: CALLBACK_SERVER_URL,
    isSend: true,
    // the network and rpcURL can be empty and if empty, the chain will be the JoyID default chain
    // network: {
    //   name: "Sepolia",
    //   chainId: SEPOLIA_CHAIN_ID,
    // },
    // rpcURL: SEPOLIA_RPC,
  });
  return {token, url};
};