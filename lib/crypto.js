'use strict';

const crypto = require("crypto");

const supportedVersion = "1";

module.exports = {
  encrypt: (key, data) => {
    let iv = new Buffer(crypto.randomBytes(12));
    let cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    let cipherText = cipher.update(data, "utf8", "hex");
    cipherText += cipher.final("hex");
    let tag = cipher.getAuthTag().toString("hex");
    return `${supportedVersion}:${iv.toString("hex")}:${cipherText}:${tag}`;
  },
  decrypt: (key, data) => {
    let [version, iv, cipherText, tag] = data.split(":");
    if (version !== supportedVersion) {
      throw new Error("Invalid version number " + version);
    }
    let cipher = crypto.createDecipheriv("aes-256-gcm", key, new Buffer(iv, "hex"));
    cipher.setAuthTag(new Buffer(tag, "hex"));
    let plainText = cipher.update(cipherText, "hex", "utf8");
    plainText += cipher.final("utf8");
    return plainText;
  }
}
