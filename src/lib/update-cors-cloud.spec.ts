import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { updateCorsConfig } from "./update-cors-cloud";

const mock = new MockAdapter(axios as any);

describe("libUpdateCorsCloud", () => {
  beforeEach(() => {
    mock.reset();
    mock.onPut("/global-config/services/CorsService/alpha").reply(201, {
      _id: "123",
      acceptedOrigins: ["alreadyAcceptedOrigin.com", "prview-url"],
    });
    mock
      .onPut(
        "/json/global-config/services/CorsService/configuration/ForgeRockSDK"
      )
      .reply(200, {
        _id: "123",
        _rev: "12332",
        maxAge: 0,
        exposedHeaders: [],
        acceptedHeaders: [],
        allowedCredentials: [],
        acceptedMethods: ["GET", "POST"],
        acceptedOrigins: ["alreadyAcceptedOrigin.com", "preview-url"],
        enabled: true,
        _type: {
          _id: "otherid",
          name: "name",
          collection: "the collection",
        },
      });

    mock
      .onGet(
        "/json/global-config/services/CorsService/configuration/ForgeRockSDK"
      )
      .reply(200, {
        _id: "123",
        _rev: "12332",
        maxAge: 0,
        exposedHeaders: [],
        acceptedHeaders: [],
        allowedCredentials: [],
        acceptedMethods: ["GET", "POST"],
        acceptedOrigins: ["alreadyAcceptedOrigin.com"],
        enabled: true,
        _type: {
          _id: "otherid",
          name: "name",
          collection: "the collection",
        },
      });
  });
  it("should successfully update a cors config", async () => {
    const data = {
      AM_URL: "am-cloud.com/am",
      originsToAdd: ["preview-url"],
      ssoToken: "123abc",
      cookieName: "cookieName",
      corsConfigName: "ForgeRockSDK",
      remove: false,
      realm: "alpha",
    };
    const result = (await updateCorsConfig(data)) as {
      acceptedOrigins: string[];
      id: string;
    }; // tests successful branch
    expect(result).toEqual({
      acceptedOrigins: ["alreadyAcceptedOrigin.com", "preview-url"],
      id: "123",
    });
  });
  it("should handle when there is no AM_URL", async () => {
    const data = {
      AM_URL: "",
      originsToAdd: ["preview-url"],
      ssoToken: "123abc",
      cookieName: "cookieName",
      corsConfigName: "js-samples",
      remove: false,
      realm: "alpha",
    };

    expect(updateCorsConfig(data)).rejects.toEqual(
      "You must provide an AM_URL"
    );
  });
  it("should throw when request fails with 404", async () => {
    const data = {
      AM_URL: "am-cloud.com/am",
      originsToAdd: ["preview-url"],
      ssoToken: "123abc",
      corsConfigName: "js-samples",
      cookieName: "cookieName",
      realm: "alpha",
      remove: false,
    };
    mock.reset();
    mock.onPut("global-config/services/CorsService/alpha").replyOnce(404);
    const result = await updateCorsConfig(data).catch((e) => e);

    expect(result).toEqual("Request failed with status code 404");
  });
});
