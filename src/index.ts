import * as core from "@actions/core";
import { updateCorsConfig } from "./lib/update-cors-cloud";
import { authenticateCloud } from "./lib/authenticate-cloud";

import { OAuthClientConfig, updateRedirectUris } from "./lib/update-clients";
import * as dotenv from "dotenv";

const { TEST_ENV } = process.env;

if (TEST_ENV === "true") {
  // only care about loading process.env in test becuase otherwise github handles
  // adding the variables to process
  dotenv.config();
}

const AM_URL = core.getInput("AM_URL");
const username = core.getInput("USERNAME");
const password = core.getInput("PASSWORD");
const realm = core.getInput("REALM_PATH");
const originsJSON = core.getInput("ORIGINS"); // this is json as input
const remove = Boolean(core.getInput("REMOVE_ORIGINS"));
const cookieName = core.getInput("COOKIE_NAME");
const redirectionUrisJSON = core.getInput("REDIRECTION_URIS");
const corsConfigName = core.getInput("CORS_CONFIG_NAME");

async function update(): Promise<void> {
  try {
    // We first need to authenticate to get an sso token
    const ssoToken = await authenticateCloud({
      AM_URL,
      realm,
      username,
      password,
    });

    const originsToAdd = JSON.parse(originsJSON)
      // in a world where you can somehow get an empty url from your input if not manually written
      .map((val: { url: string; private: boolean }) => val?.url ?? "")
      .filter(Boolean); // just remove all false values

    const output = await updateCorsConfig({
      AM_URL,
      originsToAdd,
      ssoToken,
      remove,
      cookieName,
      corsConfigName,
      realm,
    });

    // not a required argument to the action
    if (redirectionUrisJSON) {
      // this is json input from the action
      const redirectUris: OAuthClientConfig[] = JSON.parse(redirectionUrisJSON);
      await updateRedirectUris({
        AM_URL,
        originsToAdd,
        cookieName,
        realm,
        redirectUris,
        ssoToken,
      });
    }
    core.setOutput("cors config", output);
  } catch (err) {
    return core.setFailed((err as Error).message);
  }
}

update();

export { update };
