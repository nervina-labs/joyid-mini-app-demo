import axios, { AxiosInstance } from 'axios'
import { BASE_SERVER_URL } from '../env';

export enum QueryKey {
  GetBotMessage = "GetBotMessage",
}

export interface BotResponse<T> {
  message: T
}

class API {
  private axios: AxiosInstance

  constructor(baseURL = BASE_SERVER_URL) {
    this.axios = axios.create({
      baseURL,
      timeout: 30 * 1000,
    })
  }

  public getTgBotMessage<T>(token: string) {
    return this.axios.get<BotResponse<T>>(`/api/v1/message${token}`);
  }

}

export const api = new API();

export interface ConnectResp {
  address: string;
}

export interface SignResp {
  signature: string;
}

export interface SendResp {
  txHash: string;
}
