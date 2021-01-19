#!/usr/bin/env node

import {
  ClientMetadata,
  KoaContextWithOIDC,
  Provider,
  ResponseType,
} from "oidc-provider";
import { options } from "yargs";

const stringFlag = { demandOption: true, type: "string" } as const;
const numberFlag = { demandOption: true, type: "number" } as const;
const flags = {
  "client-id": stringFlag,
  "client-secret": stringFlag,
  issuer: stringFlag,
  port: numberFlag,
  "redirect-uri": stringFlag,
};
const { argv } = options(flags);

const openIdClaims = ["email", "sub"];
const claims = { openid: openIdClaims };

const clientId = argv["client-id"];
const clientSecret = argv["client-secret"];
const grantTypes = ["authorization_code"];
const redirectUri = argv["redirect-uri"];
const redirectUris = [redirectUri];
const responseTypes: ResponseType[] = ["code"];
const client: ClientMetadata = {
  client_id: clientId,
  client_secret: clientSecret,
  grant_types: grantTypes,
  redirect_uris: redirectUris,
  response_types: responseTypes,
};
const clients = [client];

const findAccount = (ctx: KoaContextWithOIDC, sub: string) => {
  const claims = () => {
    return { email: sub, sub };
  };
  return {
    accountId: sub,
    claims,
  };
};

const config = { claims, clients, findAccount, responseTypes };
const provider = new Provider(argv.issuer, config);

provider.listen(argv.port);
