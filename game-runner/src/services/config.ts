export const REMOTE_API_BASE_URL =
  // process.env.REMOTE_API_BASE_URL || "http://localhost/tbwa/mexana/admin/apigame/";
  process.env.REMOTE_API_BASE_URL || "https://www.pressstartevolution.com/tbwa/mexana/admin/apigame/";

// Para producción, define BASIC_AUTH_TOKEN o las credenciales en variables de entorno
// y evita hardcodear secretos en el repositorio.
export const BASIC_AUTH_TOKEN =
  process.env.BASIC_AUTH_TOKEN || "UHJlc3NzdGFydGV2b2x1dGlvbjpQcjNzdCQkMjAyNQ==";
