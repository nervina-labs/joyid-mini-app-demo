import { TransactionRequest, buildConnectUrl, buildSignMessageUrl, buildSignTxURL } from "@joyid/evm";
import { Hex, keccak256 } from "viem"
import { JOYID_APP_URL, JOYID_MINI_APP_URL } from "../env";

export enum Action {
  Connect,
  SignMsg,
  SendTx,
}

const Colon = '%3A'
const Comma = '%2C'
export const generateToken = (initData: string, action: Action) => {
  if (initData.length === 0) {
    throw new Error("Telegram webApp initData cannot be empty");
  }
  const data = decodeURI(initData)
  const userId = data.substring(data.indexOf(Colon) + Colon.length, data.indexOf(Comma));
  const hash = keccak256(`0x${Number(userId).toString(16)}` as Hex).substring(2);
  console.log(hash);
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

export const buildConnectTokenAndUrl = (initData: string) => {
  const token = generateToken(initData, Action.Connect);
  const url = buildConnectUrl({
    joyidAppURL: `${JOYID_APP_URL}?token=${token}`,
    redirectURL: JOYID_MINI_APP_URL,
  });
  return {token, url}
};

export const buildSignMsgTokenAndUrl = (initData: string, address: Hex, message: string | Uint8Array) => {
  const token = generateToken(initData, Action.SignMsg);
  const url = buildSignMessageUrl(message,{
    address,
    joyidAppURL: `${JOYID_APP_URL}?token=${token}`,
    redirectURL: JOYID_MINI_APP_URL,
  });
  return {token, url};
};

export const buildSendTxTokenAndUrl = (initData: string, address: Hex, tx: TransactionRequest) => {
  const token = generateToken(initData, Action.SendTx);
  const url = buildSignTxURL({
    tx,
    signerAddress: address,
    isSend: true,
    joyidAppURL: `${JOYID_APP_URL}?token=${token}`,
    redirectURL: JOYID_MINI_APP_URL,
  });
  return {token, url};
};