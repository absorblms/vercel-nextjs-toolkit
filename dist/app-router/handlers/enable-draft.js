import { draftMode, cookies } from "next/headers.js";
import { redirect } from "next/navigation.js";
import { parseRequestUrl, buildRedirectUrl } from "../../utils/url.js";
import { getVercelJwtCookie, parseVercelJwtCookie } from "../../utils/vercelJwt.js";
async function enableDraftHandler(request) {
  const {
    origin: base,
    path,
    host,
    bypassToken: bypassTokenFromQuery,
    contentfulPreviewSecret: contentfulPreviewSecretFromQuery
  } = parseRequestUrl(request.url);
  if (process.env.NODE_ENV === "development") {
    draftMode().enable();
    const cookieStore = await cookies();
    const cookie = cookieStore.get("__prerender_bypass");
    cookieStore.set({
      name: "__prerender_bypass",
      value: cookie == null ? void 0 : cookie.value,
      httpOnly: true,
      path: "/",
      secure: true,
      sameSite: "none"
    });
    const redirectUrl2 = buildRedirectUrl({ path, base, bypassTokenFromQuery });
    return redirect(redirectUrl2);
  }
  const vercelJwtCookie = getVercelJwtCookie(request);
  let bypassToken;
  let aud;
  let vercelJwt = null;
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
      vercelJwt = parseVercelJwtCookie(vercelJwtCookie);
    } catch (e) {
      if (!(e instanceof Error))
        throw e;
      return new Response(
        "Malformed bypass authorization token in _vercel_jwt cookie",
        { status: 401 }
      );
    }
    bypassToken = vercelJwt.bypass;
    aud = vercelJwt.aud;
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
  draftMode().enable();
  const bypassTokenForRedirect = vercelJwtCookie ? void 0 : bypassTokenFromQuery;
  const redirectUrl = buildRedirectUrl({
    path,
    base,
    bypassTokenFromQuery: bypassTokenForRedirect
  });
  redirect(redirectUrl);
}
export {
  enableDraftHandler
};
