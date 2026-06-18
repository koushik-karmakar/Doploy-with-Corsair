import https from "node:https";
import tls from "node:tls";

let cachedAgent: https.Agent | undefined;

/**
 * HTTPS agent that trusts both Node's bundled CAs and the OS certificate store.
 * Needed on Windows when antivirus/proxy SSL inspection breaks default verification.
 */
export function getSystemHttpsAgent(): https.Agent {
  if (!cachedAgent) {
    const systemCerts =
      typeof tls.getCACertificates === "function"
        ? tls.getCACertificates("system")
        : [];

    cachedAgent = new https.Agent({
      ca: [...tls.rootCertificates, ...systemCerts],
    });
  }

  return cachedAgent;
}
