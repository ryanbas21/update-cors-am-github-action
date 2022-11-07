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
const cookieName = core.getInput("COOKIE_NAME");
const remove = core.getBooleanInput("REMOVE");
const redirectionUrisJSON = core.getInput("REDIRECTION_URIS");
const corsConfigName = core.getInput("CORS_CONFIG_NAME");

async function update() {
  try {
    // We first need to authenticate to get an sso token
    const ssoToken = await authenticateCloud({
      AM_URL,
      realm,
      username,
      password,
    });
    core.info("Authenticated Correctly!");
    const originsToAdd = JSON.parse(originsJSON)
      // in a world where you can somehow get an empty url from your input if not manually written
      .map((val: { url: string }) => val?.url ?? "")
      .filter(Boolean); // just remove all false values

    core.info("origins parsed correctly!");
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
      const value = await updateRedirectUris({
        AM_URL,
        originsToAdd,
        cookieName,
        realm,
        redirectUris,
        ssoToken,
        remove,
      });
      core.info("Uri values parsed and updated correctly");
      return core.setOutput("uris and config", { output, value });
    }
    return core.setOutput("cors config", output);
  } catch (err) {
    if (err instanceof Error) {
      core.info("error message " + err.message);
      core.info("error stack " + err.stack);
    }
    return core.setFailed((err as Error).message);
  }
}

update();

export { update };
