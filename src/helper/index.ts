import { keccak256 } from "viem"

export enum Action {
  Connect,
  Sign,
  Send,
}

export const generateToken = (userId: string, action: Action) => {
  const hash = keccak256(new TextEncoder().encode(userId));
  const rand = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
  switch (action) {
    case Action.Connect: 
      return `conn${hash}${rand}`
    case Action.Sign:
      return `sign${hash}${rand}`;
    default:
      return `send${hash}${rand}`;
  }
}