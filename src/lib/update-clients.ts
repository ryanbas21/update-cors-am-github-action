import axios from "axios";
import { GET_OAUTH_CLIENT, PUT_OAUTH_CLIENT } from "./constants";

export interface OAuthClientConfig {
  urls: string[];
  name: string;
}
interface ClientParams {
  redirectUris: OAuthClientConfig[];
  originsToAdd: string[];
  AM_URL: string;
  ssoToken: string;
  cookieName: string;
  realm: string;
}
async function updateRedirectUris({
  AM_URL,
  cookieName,
  originsToAdd,
  realm,
  redirectUris,
  ssoToken,
}: ClientParams): Promise<void> {
  const request = axios.create({
    baseURL: AM_URL,
    headers: {
      "Content-Type": "application/json",
      "accept-api-version": "protocol=2.1, resource=1.0",
      [cookieName]: ssoToken,
    },
  });

  for (const { urls, name } of redirectUris) {
    const amConfigUrl = GET_OAUTH_CLIENT.url(realm, name);

    try {
      const { data: config } = await request.get(amConfigUrl);

      const redirectionUris = originsToAdd.reduce(
        (acc: Array<string>, curr) =>
          acc.concat(
            // sanitize urls for extra /'s'
            urls.map((url) => `${curr}${url}`.replace(/([^:]\/)\/+/g, "$1"))
          ),
        []
      );
      const set = new Set(config.coreOAuth2ClientConfig.redirectionUris.value);

      for (const val of redirectionUris) {
        set.add(val);
      }

      const finalRedirectionUris = Array.from(set);

      config.coreOAuth2ClientConfig.redirectionUris.value =
        finalRedirectionUris;

      delete config._id;
      delete config._rev;

      const {
        data: { _id, _rev, ...body },
      } = await request.put(PUT_OAUTH_CLIENT.url(realm, name), config);

      return body.coreOAuth2ClientConfig.redirectionUris.value;
    } catch (err) {
      throw new Error(
        `failure to update clients, check the redirect uris input ${err}`
      );
    }
  }
}

export { updateRedirectUris };
