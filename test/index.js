'use strict';

const assert                = require('assert');
const sinon                 = require('sinon');
const ConnectSessionEncrypt = require('../index.js');

const KEY = "https://i.imgur.com/YSho6WQ.jpeg";

describe('connect session encrypt', () => {
  it("takes in a backing store and a key",() => {
    new ConnectSessionEncrypt(KEY, {});
  });

  it("has methods that the backing store has", () => {
    const csc = new ConnectSessionEncrypt(KEY, {all: "doesn't matter"});
    assert(csc.all);
  });

  it("doesn't have methods that the backing store doesn't", () => {
    const csc = new ConnectSessionEncrypt(KEY, {});
    assert(!csc.all);
  });

  it("passes through basic methods", (done) => {
    const destroy = sinon.stub();
    destroy.withArgs("sid").yields(null);

    const csc = new ConnectSessionEncrypt(KEY, {destroy: destroy});

    csc.destroy("sid", done);
  });

  describe("set", () => {
    it("encrypts sessions", (done) => {
      const set = sinon.stub();
      set.withArgs("sid", "encrypted").yields(null);
      const encrypt = sinon.stub();
      encrypt.withArgs("unencrypted").returns("encrypted");

      const csc = new ConnectSessionEncrypt(KEY, {set: set});
      csc.encrypt = encrypt;

      csc.set("sid", "unencrypted", done);
    });
  });

  describe("get", () => {
    it("decrypts sessions that it gets", (done) => {
      const get = sinon.stub();
      get.withArgs("sid").yields(null, "encrypted");
      const decrypt = sinon.stub();
      decrypt.withArgs("encrypted").returns("unencrypted");

      const csc = new ConnectSessionEncrypt(KEY, {get: get});
      csc.decrypt = decrypt;

      csc.get("sid", done);
    });
  });

  describe("touch", () => {
    it("encrypts sessions", (done) => {
      const touch = sinon.stub();
      touch.withArgs("sid", "encrypted").yields(null);
      const encrypt = sinon.stub();
      encrypt.withArgs("unencrypted").returns("encrypted");

      const csc = new ConnectSessionEncrypt(KEY, {touch: touch});
      csc.encrypt = encrypt;

      csc.touch("sid", "unencrypted", done);
    });
  });

  describe("all", () => {
    it("decrypts all the sessions", (done) => {
      const all = sinon.stub();
      all.yields(null, ["encrypted1", "encrypted2"]);
      const decrypt = sinon.stub();
      decrypt.withArgs("encrypted1").returns("unencrypted1");
      decrypt.withArgs("encrypted2").returns("unencrypted2");

      const csc = new ConnectSessionEncrypt(KEY, {all: all});
      csc.decrypt = decrypt;

      csc.all((err, sessions) => {
        assert.ifError(err);

        assert.deepEqual(sessions, ["unencrypted1", "unencrypted2"]);
        done();
      });
    });
  });

  describe("encryption", () => {
    it("can round-robin", () => {
      const csc = new ConnectSessionEncrypt(KEY, {});
      assert.equal(csc.decrypt(csc.encrypt("data")), "data");
      assert.notEqual(csc.encrypt("data"), "data");
    });
  });
});
