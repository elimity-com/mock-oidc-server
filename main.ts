#!/usr/bin/env node

import {
  ClientMetadata,
  KoaContextWithOIDC,
  Provider,
  ResponseType,
} from "oidc-provider";
import { options } from "yargs";

const clientIdFlag = { demandOption: true, type: "string" } as const;
const portFlag = { demandOption: true, type: "number" } as const;
const redirectUriFlag = { demandOption: true, type: "string" } as const;
const flags = {
  "client-id": clientIdFlag,
  port: portFlag,
  "redirect-uri": redirectUriFlag,
};
const { argv } = options(flags);

const port = argv.port;
const issuer = `http://localhost:${port}`;

const openIdClaims = ["sub", "upn"];
const claims = { openid: openIdClaims };

const clientId = argv["client-id"];
const grantTypes = ["authorization_code"];
const redirectUri = argv["redirect-uri"];
const redirectUris = [redirectUri];
const responseTypes: ResponseType[] = ["code"];
const client: ClientMetadata = {
  client_id: clientId,
  client_secret: "secret",
  grant_types: grantTypes,
  redirect_uris: redirectUris,
  response_types: responseTypes,
  token_endpoint_auth_method: "none",
};
const clients = [client];

const findAccount = (ctx: KoaContextWithOIDC, sub: string) => {
  const claims = () => {
    return { sub, upn: sub };
  };
  return {
    accountId: sub,
    claims,
  };
};

const config = { claims, clients, findAccount, responseTypes };
const provider = new Provider(issuer, config);

provider.listen(port);
