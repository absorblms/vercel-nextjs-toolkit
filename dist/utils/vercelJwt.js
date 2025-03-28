const getVercelJwtCookie = (request) => {
  const vercelJwtCookie = request.cookies.get("_vercel_jwt");
  if (!vercelJwtCookie)
    return;
  return vercelJwtCookie.value;
};
const parseVercelJwtCookie = (vercelJwtCookie) => {
  const base64Payload = vercelJwtCookie.split(".")[1];
  if (!base64Payload)
    throw new Error("Malformed `_vercel_jwt` cookie value");
  const base64 = base64Payload.replace("-", "+").replace("_", "/");
  const payload = atob(base64);
  const vercelJwt = JSON.parse(payload);
  assertVercelJwt(vercelJwt);
  return vercelJwt;
};
function assertVercelJwt(value) {
  const vercelJwt = value;
  if (typeof vercelJwt.bypass !== "string")
    throw new TypeError("'bypass' property in VercelJwt is not a string");
  if (typeof vercelJwt.aud !== "string")
    throw new TypeError("'aud' property in VercelJwt is not a string");
  if (typeof vercelJwt.sub !== "string")
    throw new TypeError("'sub' property in VercelJwt is not a string");
  if (typeof vercelJwt.iat !== "number")
    throw new TypeError("'iat' property in VercelJwt is not a number");
}
export {
  getVercelJwtCookie,
  parseVercelJwtCookie
};
