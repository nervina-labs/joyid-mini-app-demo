import axios, { AxiosInstance } from 'axios'
import { BASE_SERVER_URL } from '../env';

export enum QueryKey {
  GetBotMessage = "GetBotMessage",
}

export interface BotResponse {
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

  public getTgBotMessage(token: string) {
    return this.axios.get<BotResponse>(`/api/v1/message${token}`);
  }

}

export const api = new API();