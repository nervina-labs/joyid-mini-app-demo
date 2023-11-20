import axios, { AxiosInstance } from 'axios'
import { BASE_SERVER_URL } from '../env';

export enum QueryKey {
  GetBotMessage = "GetBotMessage",
}

export interface BotResponse<T> {
  message: string
}

class API {
  private axios: AxiosInstance

  constructor(baseURL = BASE_SERVER_URL) {
    this.axios = axios.create({
      baseURL,
      timeout: 30 * 1000,
    })
  }

  public async getTgBotMessage<T>(token: string) {
    const res = await this.axios.get<BotResponse<T>>( `/api/v1/messages/${ token }` );
    const message = res.data.message;
    return JSON.parse( message ) as T;
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
