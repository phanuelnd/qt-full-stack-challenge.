// Utilities for Web Crypto verification and PEM parsing

export async function importPublicKey(pem: string): Promise<CryptoKey> {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "spki",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

export async function verifySignature(
  publicKey: CryptoKey,
  hashHex: string,
  signatureBase64: string,
): Promise<boolean> {
  const enc = new TextEncoder();
  const data = enc.encode(hashHex);
  const sig = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));
  return await crypto.subtle.verify(
    { name: "RSASSA-PKCS1-v1_5" },
    publicKey,
    sig,
    data,
  );
}

