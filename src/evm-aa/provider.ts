import { ECDSAProvider } from "@zerodev/sdk";
import { JoySigner } from "./signer";
import { ZERO_DEV_PROJECT_ID } from "../env";

export const getAAProvider = async (signer: JoySigner) => {
  return await ECDSAProvider.init({
    projectId: ZERO_DEV_PROJECT_ID,
    owner: signer,
  });
};
