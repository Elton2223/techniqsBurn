const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(raw);
}

export async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = base64ToArrayBuffer(base64Key);
  return crypto.subtle.importKey("raw", raw, { name: ALGORITHM }, false, [
    "decrypt",
  ]);
}

export async function encryptSecret(
  plaintext: string,
  key: CryptoKey
): Promise<{ encryptedData: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  return {
    encryptedData: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

export async function decryptSecret(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const ciphertextBuffer = base64ToArrayBuffer(encryptedData);
  const ivBuffer = new Uint8Array(base64ToArrayBuffer(iv));

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: ivBuffer },
    key,
    ciphertextBuffer
  );

  return new TextDecoder().decode(plaintext);
}

export async function hashPassphrase(passphrase: string): Promise<string> {
  const encoded = new TextEncoder().encode(passphrase);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return arrayBufferToBase64(hash);
}
