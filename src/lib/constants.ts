export type METHOD = "GET" | "PUT" | "POST" | "DELETE" | "PATCH" | "OPTIONS";

interface RestConfig {
  type: METHOD;
  url: (a?: string, b?: string) => string;
}

const ADD_CONFIG: RestConfig = {
  type: "POST",
  url: (name = "ForgeRockSDK") =>
    `/json/global-config/services/CorsService/configuration/${name}`,
};
const GET_CONFIG: RestConfig = {
  type: "GET",
  url: () => `/json/global-config/services/CorsService`,
};
const REMOVE_CONFIG: RestConfig = {
  type: "DELETE",
  url: () => "/global-config/services/CorsService",
};

const GET_OAUTH_CLIENT: Pick<RestConfig, "url"> = {
  url: (realm, name) =>
    `/json/realms/${realm}/realm-config/agents/OAuth2Client/${name}`,
};
const PUT_OAUTH_CLIENT: Pick<RestConfig, "url"> = {
  url: (realm, name) =>
    `/json/realms/${realm}/realm-config/agents/OAuth2Client/${name}`,
};

export {
  ADD_CONFIG,
  REMOVE_CONFIG,
  GET_CONFIG,
  GET_OAUTH_CLIENT,
  PUT_OAUTH_CLIENT,
};
