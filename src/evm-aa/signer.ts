import { SignTypedDataParams, SmartAccountSigner } from "@alchemy/aa-core";
import { HDAccount, type Hex, TypedDataDefinition, hexToBytes } from "viem";
import {HDKey, hdKeyToAccount} from "viem/accounts";
import { WebApp } from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import { buildConnectTokenAndUrl, buildSignMsgTokenAndUrl, buildSignTypedDataTokenAndUrl } from "../helper";
import { ConnectResp, SignResp, USER_REJECTED, api } from "../api";

export class JoySigner implements SmartAccountSigner<HDAccount> {
  signerType = "local";
  address: Hex;
  webApp: WebApp | undefined;
  
  // useless
  inner: HDAccount = hdKeyToAccount(HDKey.fromMasterSeed(hexToBytes("0x0000000000000000000000000000000000000000000000000000000000000000")));

  constructor(webApp: WebApp, address: Hex) {
    this.webApp = webApp;
    this.address = address;
  }

  openUrl = (url: string) => {
    if (this.webApp) {
      this.webApp.openLink && this.webApp.openLink(url);
    }
  };

  readonly getAddress: () => Promise<Hex> = async () => {
    const promise = new Promise<Hex>((resolve, reject) => {
      if (!this.webApp) {
        reject("Telegram WebApp cannot be empty");
      } else {
        try {
          const {token, url} = buildConnectTokenAndUrl(this.webApp.initData);
          this.openUrl(url);
          const interval = setInterval(() => {
            api.getTgBotMessage<ConnectResp>(token).then(({address}) => {
              if (address === USER_REJECTED) {
                reject("User refuses to get address from JoyID");
              } else {
                resolve(address as Hex);
              }
              clearInterval(interval);
            });
          }, 500);
        } catch (error) {
          console.log(error);
        }
      }
    });
    return promise;
  };

  readonly signMessage: (msg: string | Uint8Array) => Promise<Hex> = (msg) => {
    const promise = new Promise<Hex>((resolve, reject) => {
      if (!this.webApp) {
        reject("Telegram WebApp cannot be empty");
      } else {
        try {
          const {token, url} = buildSignMsgTokenAndUrl(this.webApp.initData, this.address, msg);
          this.openUrl(url);
          const interval = setInterval(() => {
            api.getTgBotMessage<SignResp>(token).then(({signature}) => {
              if (signature === USER_REJECTED) {
                reject("User refuses to sign message from JoyID");
              } else {
                resolve(signature as Hex);
              }
              clearInterval(interval);
            });
          }, 500);
        } catch (error) {
          console.error(error);
        }
      }
    });
    return promise;
  };

  readonly signTypedData = (params: SignTypedDataParams) => {
    const typedData = params as TypedDataDefinition;
    const promise = new Promise<Hex>((resolve, reject) => {
      if (!this.webApp) {
        reject("Telegram WebApp cannot be empty");
      } else {
        try {
          const {token, url} = buildSignTypedDataTokenAndUrl(this.webApp.initData, this.address, typedData);
          this.openUrl(url);
          const interval = setInterval(() => {
            api.getTgBotMessage<SignResp>(token).then(({signature}) => {
              if (signature === USER_REJECTED) {
                reject("User refuses to sign typed data from JoyID");
              } else {
                resolve(signature as Hex);
              }
              clearInterval(interval);
            });
          }, 500);
        } catch (error) {
          console.error(error);
        }
      }
    });
    return promise;
  };
}
