/* js/crypto.js — V1.0
   Mã hóa và giải mã dữ liệu bằng AES-GCM thông qua Web Crypto API.
   Sử dụng Passphrase (Mã PIN) để tạo Key thông qua PBKDF2. */

const ITERATIONS = 100000;
const SALT = new TextEncoder().encode('so-chi-tieu-secure-salt-v1');

// Chuyển ArrayBuffer sang Base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Chuyển Base64 sang ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Tạo CryptoKey từ Passphrase
async function deriveKey(passphrase) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Mã hóa object thành chuỗi Base64
 * @param {Object} data - Dữ liệu cần mã hóa
 * @param {string} passphrase - Mã PIN
 * @returns {Promise<string>} Chuỗi JSON chứa IV và Ciphertext
 */
export async function encryptData(data, passphrase) {
  try {
    const key = await deriveKey(passphrase);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV cho AES-GCM
    const enc = new TextEncoder();
    
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      enc.encode(JSON.stringify(data))
    );

    return JSON.stringify({
      iv: arrayBufferToBase64(iv),
      payload: arrayBufferToBase64(ciphertext)
    });
  } catch (err) {
    console.error('[Crypto] Lỗi mã hóa:', err);
    throw new Error('Mã hóa thất bại');
  }
}

/**
 * Giải mã chuỗi Base64 thành object
 * @param {string} encryptedStr - Chuỗi JSON chứa IV và Ciphertext
 * @param {string} passphrase - Mã PIN
 * @returns {Promise<Object>} Dữ liệu đã giải mã
 */
export async function decryptData(encryptedStr, passphrase) {
  try {
    const { iv, payload } = JSON.parse(encryptedStr);
    const key = await deriveKey(passphrase);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(iv)) },
      key,
      base64ToArrayBuffer(payload)
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (err) {
    console.error('[Crypto] Lỗi giải mã (có thể sai Mã PIN):', err);
    throw new Error('Giải mã thất bại. Vui lòng kiểm tra lại Mã PIN.');
  }
}