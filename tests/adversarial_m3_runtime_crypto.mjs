/**
 * EMPIRICAL RUNTIME CRYPTO HARNESS — MILESTONE 3
 * Directly imports and stress-tests src/lib/api-key-encryption.ts
 */

import "dotenv/config";
import assert from "node:assert/strict";
import crypto from "node:crypto";

if (!process.env.API_KEY_ENCRYPTION_SECRET || process.env.API_KEY_ENCRYPTION_SECRET.length < 32) {
  process.env.API_KEY_ENCRYPTION_SECRET = "offeranalyst-runtime-crypto-test-secret-key-32bytes!";
}

import {
  encryptApiKeyToParts,
  decryptApiKeyFromParts,
  encryptAPIKey,
  decryptAPIKey,
  testEncryption
} from "../src/lib/api-key-encryption.ts";

console.log("=========================================================================");
console.log("⚡ DIRECT RUNTIME CRYPTO VERIFICATION — src/lib/api-key-encryption.ts");
console.log("=========================================================================");

let passed = 0;
let failed = 0;

function run(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

// 1. Built-in testEncryption
run("testEncryption() returns true", () => {
  assert.strictEqual(testEncryption(), true);
});

// 2. Direct encryptApiKeyToParts & decryptApiKeyFromParts round-trip
run("encryptApiKeyToParts & decryptApiKeyFromParts round-trip", () => {
  const secretKey = "sk-or-v1-super-secret-runtime-key-abc123xyz789";
  const parts = encryptApiKeyToParts(secretKey);
  
  assert.ok(parts.ciphertext, "Missing ciphertext");
  assert.ok(parts.iv, "Missing iv");
  assert.ok(parts.tag, "Missing tag");
  assert.strictEqual(parts.iv.length, 32, "IV must be 16 bytes = 32 hex characters");
  assert.strictEqual(parts.tag.length, 32, "Tag must be 16 bytes = 32 hex characters");

  const recovered = decryptApiKeyFromParts(parts);
  assert.strictEqual(recovered, secretKey, "Recovered plaintext must match original");
});

// 3. Overloaded decryptAPIKey supports structured parts object
run("decryptAPIKey overloaded function handles EncryptedApiKeyParts object", () => {
  const secretKey = "sk-ant-api03-runtime-overload-test-0001";
  const parts = encryptApiKeyToParts(secretKey);
  const recovered = decryptAPIKey(parts);
  assert.strictEqual(recovered, secretKey);
});

// 4. Overloaded decryptAPIKey handles legacy base64 string
run("decryptAPIKey handles legacy base64 string", () => {
  const secretKey = "sk-openai-legacy-base64-compat-key-9999";
  const base64Encrypted = encryptAPIKey(secretKey);
  assert.strictEqual(typeof base64Encrypted, "string");
  const recovered = decryptAPIKey(base64Encrypted);
  assert.strictEqual(recovered, secretKey);
});

// 5. Tamper test: Corrupted ciphertext throws
run("decryptApiKeyFromParts rejects corrupted ciphertext with Error", () => {
  const parts = encryptApiKeyToParts("sk-or-v1-tamper-target-12345");
  const corruptedCiphertext = parts.ciphertext.slice(0, -2) + (parts.ciphertext.slice(-2) === "00" ? "ff" : "00");
  assert.throws(() => {
    decryptApiKeyFromParts({ ...parts, ciphertext: corruptedCiphertext });
  }, /Failed to decrypt API key/);
});

// 6. Tamper test: Corrupted auth tag throws
run("decryptApiKeyFromParts rejects corrupted auth tag with Error", () => {
  const parts = encryptApiKeyToParts("sk-or-v1-tag-tamper-target-12345");
  const corruptedTag = "00" + parts.tag.slice(2);
  assert.throws(() => {
    decryptApiKeyFromParts({ ...parts, tag: corruptedTag });
  }, /Failed to decrypt API key/);
});

// 7. Tamper test: Corrupted IV throws
run("decryptApiKeyFromParts rejects corrupted IV with Error", () => {
  const parts = encryptApiKeyToParts("sk-or-v1-iv-tamper-target-12345");
  const corruptedIv = "ff" + parts.iv.slice(2);
  assert.throws(() => {
    decryptApiKeyFromParts({ ...parts, iv: corruptedIv });
  }, /Failed to decrypt API key/);
});

// 8. 50 consecutive calls produce distinct IVs
run("50 calls to encryptApiKeyToParts produce 50 unique IVs", () => {
  const ivs = new Set();
  for (let i = 0; i < 50; i++) {
    const parts = encryptApiKeyToParts("sk-test-entropy-same-key");
    ivs.add(parts.iv);
  }
  assert.strictEqual(ivs.size, 50);
});

console.log("=========================================================================");
console.log(`🎯 DIRECT RUNTIME CRYPTO RESULT: ${passed} Passed, ${failed} Failed`);
console.log("=========================================================================");

if (failed > 0) process.exit(1);
