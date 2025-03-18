const parseNextApiRequest = (request) => {
  const hostHeader = request.headers.host;
  if (!hostHeader)
    throw new Error("missing `host` header from request");
  const protocol = request.headers["x-forwarded-proto"] || "https";
  const requestUrl = request.url && new URL(request.url, `${protocol}://${hostHeader}`).toString();
  return parseRequestUrl(requestUrl);
};
const parseRequestUrl = (requestUrl) => {
  if (!requestUrl)
    throw new Error("missing `url` value in request");
  const { searchParams, origin, host } = new URL(requestUrl);
  const rawPath = searchParams.get("path") || "";
  const bypassToken = searchParams.get("x-vercel-protection-bypass") || "";
  const contentfulPreviewSecret = searchParams.get("x-contentful-preview-secret") || "";
  const path = decodeURIComponent(rawPath);
  return { origin, path, host, bypassToken, contentfulPreviewSecret };
};
const buildRedirectUrl = ({
  path,
  base,
  bypassTokenFromQuery
}) => {
  const redirectUrl = new URL(path, base);
  if (bypassTokenFromQuery) {
    redirectUrl.searchParams.set(
      "x-vercel-protection-bypass",
      bypassTokenFromQuery
    );
    redirectUrl.searchParams.set("x-vercel-set-bypass-cookie", "samesitenone");
  }
  return redirectUrl.toString();
};
export {
  buildRedirectUrl,
  parseNextApiRequest,
  parseRequestUrl
};
