import * as core from "@actions/core";
import axios from "axios";
import { ADD_CONFIG, GET_CONFIG } from "./constants";
import type { OAuthAppConfigAxios } from "./update-oauth-client";

interface CorsConfigValues {
  AM_URL: string;
  originsToAdd: string[];
  ssoToken: string;
  cookieName: string;
  corsConfigName: string;
  realm: string;
  remove?: boolean;
}
interface AMIdAndConfig {
  id: string;
  acceptedOrigins: string[];
}
export async function updateCorsConfig({
  AM_URL,
  originsToAdd,
  ssoToken,
  cookieName,
  remove = false, // default to not remove origins
  corsConfigName,
}: CorsConfigValues): Promise<AMIdAndConfig> {
  if (!AM_URL) {
    core.info("You must provide an AM_URL");
    return Promise.reject("You must provide an AM_URL");
  }
  if (!originsToAdd) {
    core.info(
      "You must provide a list of origins to update the cors config with"
    );
    return Promise.reject(
      "You must provide a list of origins to update the cors config with"
    );
  }
  if (!ssoToken) {
    core.info(
      "No SSO Token provided to update the cors config, exiting without a network call"
    );
    return Promise.reject(
      "No SSO Token provided to update the cors config, exiting without a network call"
    );
  }
  try {
    const request = axios.create({
      baseURL: AM_URL,
      headers: {
        [cookieName]: ssoToken,
        "Content-Type": "application/json",
        "accept-api-version": "protocol=2.0, resource=1.0",
        Accept: "*/*",
      },
    });
    /*
     * On success, AM returns an HTTP 201 response code,
     * and a representation of the CORS settings, in JSON format.
     * AM generates a UUID for the configuration, returned as the value of the
     * _id property. You can use this ID value to update or delete
     * the configuration with additional REST calls.
     * The new settings take effect immediately.
     */
    const {
      data: { _id, _rev, ...body },
    } = await request(ADD_CONFIG.url(), {
      method: GET_CONFIG.type,
    });

    const response = await request.put<OAuthAppConfigAxios>(
      ADD_CONFIG.url(corsConfigName),
      {
        ...body,
        acceptedOrigins: remove
          ? body.acceptedOrigins.filter(
              (origin: string) => !originsToAdd.includes(origin) // filter over the existing origins and if that value exists, remove.
            )
          : [...body.acceptedOrigins, ...originsToAdd],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "accept-api-version": "protocol=2.1, resource=1.0",
          [cookieName]: ssoToken,
        },
      }
    );

    if (response.status === 201 || response.status === 200) {
      // we return the origins that AM now has if successful if needed in subsequent steps
      return {
        id: response.data._id,
        acceptedOrigins: response.data.acceptedOrigins,
      };
    }
    if (response.status === 401) {
      core.info("You must provide an SSO token for authorization");
      return Promise.reject("You must provide an SSO token for authorization");
    }
    core.info("Request did not return a 201 status code");
    return Promise.reject("Request did not return a 201 status code");
  } catch (err: any) {
    if (err instanceof Error) {
      core.info(err.message);
      return Promise.reject(err.message);
    }
    core.info(String(err));
    return Promise.reject(String(err));
  }
}
