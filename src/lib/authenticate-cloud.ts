import { CallbackType, FRStep } from "@forgerock/javascript-sdk";
import axios, { AxiosResponse } from "axios";

interface AuthenticateCloudParams {
  AM_URL: string;
  realm: string;
  username: string;
  password: string;
}
interface SSOToken {
  tokenId: string;
  successUrl: string;
  realm: string;
}
async function authenticateCloud({
  // realm,
  AM_URL,
  username,
  password,
}: AuthenticateCloudParams): Promise<string> {
  try {
    const request = axios.create({
      baseURL: AM_URL,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Accept-API-Version": "resource=2.1, protocol=1.0",
        "X-OpenAM-Username": username,
        "X-OpenAM-Password": password,
      },
    });
    const { data: nextData } = await request.post("/json/authenticate");

    const lastStep = new FRStep(nextData);
    lastStep
      .getCallbackOfType(CallbackType.HiddenValueCallback)
      .setInputValue("Skip");
    const {
      data: { tokenId: ssoToken },
    } = await request.post<FRStep, AxiosResponse<SSOToken>>(
      "/json/authenticate",
      lastStep.payload
    );

    return ssoToken;
  } catch (error) {
    return Promise.reject(
      `We encountered an error authorizing your request: ${error}`
    );
  }
}

export { authenticateCloud };
