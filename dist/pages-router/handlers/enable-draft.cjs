"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const url = require("../../utils/url.cjs");
const vercelJwt = require("../../utils/vercelJwt.cjs");
const enableDraftHandler = async (request, response) => {
  const {
    origin: base,
    path,
    host,
    bypassToken: bypassTokenFromQuery,
    contentfulPreviewSecret: contentfulPreviewSecretFromQuery
  } = url.parseNextApiRequest(request);
  if (process.env.NODE_ENV === "development") {
    response.setDraftMode({ enable: true });
    const redirectUrl2 = url.buildRedirectUrl({ path, base, bypassTokenFromQuery });
    response.redirect(redirectUrl2);
    return;
  }
  const vercelJwtCookie = request.cookies["_vercel_jwt"];
  let bypassToken;
  let aud;
  if (bypassTokenFromQuery) {
    bypassToken = bypassTokenFromQuery;
    aud = host;
  } else if (contentfulPreviewSecretFromQuery) {
    bypassToken = contentfulPreviewSecretFromQuery;
    aud = host;
  } else {
    let vercelJwt$1;
    try {
      if (!vercelJwtCookie) {
        response.status(401).send(
          "Missing _vercel_jwt cookie required for authorization bypass"
        );
        return;
      }
      vercelJwt$1 = vercelJwt.parseVercelJwtCookie(vercelJwtCookie);
    } catch (e) {
      if (!(e instanceof Error))
        throw e;
      response.status(401).send(
        "Malformed bypass authorization token in _vercel_jwt cookie"
      );
      return;
    }
    bypassToken = vercelJwt$1.bypass;
    aud = vercelJwt$1.aud;
  }
  if (bypassToken !== process.env.VERCEL_AUTOMATION_BYPASS_SECRET && contentfulPreviewSecretFromQuery !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    response.status(403).send(
      "The bypass token you are authorized with does not match the bypass secret for this deployment. You might need to redeploy or go back and try the link again."
    );
    return;
  }
  if (aud !== host) {
    response.status(403).send(
      `The bypass token you are authorized with is not valid for this host (${host}). You might need to redeploy or go back and try the link again.`
    );
    return;
  }
  if (!path) {
    response.status(400).send(
      "Missing required value for query parameter `path`"
    );
    return;
  }
  response.setDraftMode({ enable: true });
  const bypassTokenForRedirect = vercelJwtCookie ? void 0 : bypassTokenFromQuery;
  const redirectUrl = url.buildRedirectUrl({ path, base, bypassTokenFromQuery: bypassTokenForRedirect });
  response.redirect(redirectUrl);
  return;
};
exports.enableDraftHandler = enableDraftHandler;
