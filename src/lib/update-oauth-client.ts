interface StringArrayInterfaceValue {
  inherited: boolean;
  value: string[];
}

interface StringInterfaceValue {
  inherited: boolean;
  value: string;
}
/*
 * Values that are omitted from this config will be removed from the aplication configuration.
 * It is imperative that all the values required are included in every request so that the application that is being
 * edited is still functioning as intended
 */
export interface OAuthAppConfigAxios {
  _id: string;
  _rev: string;
  maxAge: number;
  exposedHeaders: string[];
  acceptedHeaders: string[];
  allowCredentials: boolean;
  acceptedMethods: string[];
  acceptedOrigins: string[];
  enabled: boolean;
  _type: {
    _id: string;
    name: string;
    collection: boolean;
  };
}
