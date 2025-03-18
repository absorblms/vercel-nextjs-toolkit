"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const headers_js = require("next/headers.js");
const navigation_js = require("next/navigation.js");
const url = require("../../utils/url.cjs");
const vercelJwt = require("../../utils/vercelJwt.cjs");
async function enableDraftHandler(request) {
  const {
    origin: base,
    path,
    host,
    bypassToken: bypassTokenFromQuery,
    contentfulPreviewSecret: contentfulPreviewSecretFromQuery
  } = url.parseRequestUrl(request.url);
  if (process.env.NODE_ENV === "development") {
    headers_js.draftMode().enable();
    const cookieStore = await headers_js.cookies();
    const cookie = cookieStore.get("__prerender_bypass");
    cookieStore.set({
      name: "__prerender_bypass",
      value: cookie == null ? void 0 : cookie.value,
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none"
    });
    const redirectUrl2 = url.buildRedirectUrl({ path, base, bypassTokenFromQuery });
    return navigation_js.redirect(redirectUrl2);
  }
  const vercelJwtCookie = vercelJwt.getVercelJwtCookie(request);
  let bypassToken;
  let aud;
  let vercelJwt$1 = null;
  if (bypassTokenFromQuery) {
    bypassToken = bypassTokenFromQuery;
    aud = host;
  } else if (contentfulPreviewSecretFromQuery) {
    bypassToken = contentfulPreviewSecretFromQuery;
    aud = host;
  } else {
    if (!vercelJwtCookie) {
      return new Response(
        "Missing _vercel_jwt cookie required for authorization bypass",
        { status: 401 }
      );
    }
    try {
      vercelJwt$1 = vercelJwt.parseVercelJwtCookie(vercelJwtCookie);
    } catch (e) {
      if (!(e instanceof Error))
        throw e;
      return new Response(
        "Malformed bypass authorization token in _vercel_jwt cookie",
        { status: 401 }
      );
    }
    bypassToken = vercelJwt$1.bypass;
    aud = vercelJwt$1.aud;
  }
  if (bypassToken !== process.env.VERCEL_AUTOMATION_BYPASS_SECRET && contentfulPreviewSecretFromQuery !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response(
      "The bypass token you are authorized with does not match the bypass secret for this deployment. You might need to redeploy or go back and try the link again.",
      { status: 403 }
    );
  }
  if (aud !== host) {
    return new Response(
      `The bypass token you are authorized with is not valid for this host (${host}). You might need to redeploy or go back and try the link again.`,
      { status: 403 }
    );
  }
  if (!path) {
    return new Response("Missing required value for query parameter `path`", {
      status: 400
    });
  }
  headers_js.draftMode().enable();
  const bypassTokenForRedirect = vercelJwtCookie ? void 0 : bypassTokenFromQuery;
  const redirectUrl = url.buildRedirectUrl({
    path,
    base,
    bypassTokenFromQuery: bypassTokenForRedirect
  });
  navigation_js.redirect(redirectUrl);
}
exports.enableDraftHandler = enableDraftHandler;
