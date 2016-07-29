'use strict';

const crypto = require("crypto");

const supportedVersion = "1";

module.exports = {
  encrypt: (key, data) => {
    const iv = new Buffer(crypto.randomBytes(12));
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const cipherText = cipher.update(data, "utf8", "hex") + cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    return `${supportedVersion}:${iv.toString("hex")}:${cipherText}:${tag}`;
  },
  decrypt: (key, data) => {
    const [version, iv, cipherText, tag] = data.split(":");
    if (version !== supportedVersion) {
      throw new Error("Invalid version number " + version);
    }
    const cipher = crypto.createDecipheriv("aes-256-gcm", key, new Buffer(iv, "hex"));
    cipher.setAuthTag(new Buffer(tag, "hex"));
    const plainText = cipher.update(cipherText, "hex", "utf8") + cipher.final("utf8");
    return plainText;
  }
}
