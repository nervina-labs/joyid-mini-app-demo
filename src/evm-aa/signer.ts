import { SignTypedDataParams, SmartAccountSigner } from "@alchemy/aa-core";
import { type Hex, TypedDataDefinition } from "viem";
import { WebApp } from "@vkruglikov/react-telegram-web-app/lib/core/twa-types";
import { buildConnectTokenAndUrl, buildSignMsgTokenAndUrl, buildSignTypedDataTokenAndUrl } from "../helper";
import { ConnectResp, SignResp, USER_REJECTED, api } from "../api";

export class JoySigner implements SmartAccountSigner {
  address: Hex;
  webApp: WebApp | undefined;

  signerType = "local";
  // useless
  inner = 'useless';

  constructor(webApp: WebApp, address: Hex) {
    this.webApp = webApp;
    this.address = address;
  }

  openUrl = (url: string) => {
    if (this.webApp?.openLink) {
      this.webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  readonly getAddress: () => Promise<Hex> = async () => {
    if (this.address) {
      return new Promise((resolve) => {
        resolve(this.address as Hex);
      })
    }
    const promise = new Promise<Hex>((resolve, reject) => {
      if (!this.webApp) {
        reject("Telegram WebApp cannot be empty");
      } else {
        try {
          const {token, url} = buildConnectTokenAndUrl(this.webApp.initData, true);
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
          }, 1000);
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
          }, 1000);
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
          }, 1000);
        } catch (error) {
          console.error(error);
        }
      }
    });
    return promise;
  };
}
