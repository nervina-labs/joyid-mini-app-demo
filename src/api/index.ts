import axios, { AxiosInstance } from 'axios'
import { CALLBACK_SERVER_URL } from '../env';

export const USER_REJECTED = "rejected";

export enum QueryKey {
  GetBotMessage = "GetBotMessage",
  RequestAccess = "RequestAccess",
}

interface BotResponse {
  message: string
}

class API {
  private axios: AxiosInstance

  constructor(baseURL = CALLBACK_SERVER_URL) {
    this.axios = axios.create({
      baseURL,
      timeout: 30 * 1000,
    })
  }

  public async getTgBotMessage<T>(token: string) {
    const res = await this.axios.get<BotResponse>(`/messages/${ token }` );
    return JSON.parse(res.data.message) as T;
  }

}

export const api = new API();

export interface ConnectResp {
  address: string;
}

export interface SignResp {
  signature: string;
}


export interface SignTxResp {
  signature: string;
}

export interface SendTxResp {
  txHash: string;
}
