#!/usr/bin/env node

import { ClientMetadata, Provider, ResponseType } from "oidc-provider";
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

const clientId = argv["client-id"];
const grantTypes = ["implicit"];
const redirectUri = argv["redirect-uri"];
const redirectUris = [redirectUri];
const responseTypes: ResponseType[] = ["id_token token"];
const client: ClientMetadata = {
  client_id: clientId,
  client_secret: "secret",
  grant_types: grantTypes,
  redirect_uris: redirectUris,
  response_types: responseTypes,
};
const clients = [client];

const config = { clients, responseTypes };
const provider = new Provider(issuer, config);

// ugly hack to allow redirects to localhost over http
// see https://github.com/panva/node-oidc-provider/blob/master/recipes/implicit_http_localhost.md for more information
const Client: any = provider.Client; // eslint-disable-line @typescript-eslint/no-explicit-any
const schema = Client.Schema.prototype;
const invalidate = schema.invalidate;
schema.invalidate = function (message: string, code: string) {
  if (code === "implicit-force-https" || code === "implicit-forbid-localhost") {
    return;
  }
  invalidate.call(this, message, code);
};

provider.listen(port);
