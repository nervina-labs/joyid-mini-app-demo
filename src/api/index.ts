import axios, { AxiosInstance } from 'axios'
import { BASE_SERVER_URL } from '../env';

export interface BotResponse {
  result: string
}

class API {
  private axios: AxiosInstance

  constructor(baseURL = BASE_SERVER_URL) {
    this.axios = axios.create({
      baseURL,
      timeout: 30 * 1000,
    })
  }

  public getBotState(token: string) {
    return this.axios.get<BotResponse>(`/api/v1/bot_token${token}`);
  }

}

export const api = new API();