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
    let csc = new ConnectSessionEncrypt(KEY, {all: "doesn't matter"});
    assert(csc.all);
  });

  it("doesn't have methods that the backing store doesn't", () => {
    let csc = new ConnectSessionEncrypt(KEY, {});
    assert(!csc.all);
  });

  it("passes through basic methods", (done) => {
    let destroy = sinon.stub();
    destroy.withArgs("sid").yields(null);

    let csc = new ConnectSessionEncrypt(KEY, {destroy: destroy});

    csc.destroy("sid", done);
  });

  describe("set", () => {
    it("encrypts sessions", (done) => {
      let set = sinon.stub();
      set.withArgs("sid", "encrypted").yields(null);
      let encrypt = sinon.stub();
      encrypt.withArgs("unencrypted").returns("encrypted");

      let csc = new ConnectSessionEncrypt(KEY, {set: set});
      csc.encrypt = encrypt;

      csc.set("sid", "unencrypted", done);
    });
  });

  describe("get", () => {
    it("decrypts sessions that it gets", (done) => {
      let get = sinon.stub();
      get.withArgs("sid").yields(null, "encrypted");
      let decrypt = sinon.stub();
      decrypt.withArgs("encrypted").returns("unencrypted");

      let csc = new ConnectSessionEncrypt(KEY, {get: get});
      csc.decrypt = decrypt;

      csc.get("sid", done);
    });
  });

  describe("touch", () => {
    it("encrypts sessions", (done) => {
      let touch = sinon.stub();
      touch.withArgs("sid", "encrypted").yields(null);
      let encrypt = sinon.stub();
      encrypt.withArgs("unencrypted").returns("encrypted");

      let csc = new ConnectSessionEncrypt(KEY, {touch: touch});
      csc.encrypt = encrypt;

      csc.touch("sid", "unencrypted", done);
    });
  });

  describe("all", () => {
    it("decrypts all the sessions", (done) => {
      let all = sinon.stub();
      all.yields(null, ["encrypted1", "encrypted2"]);
      let decrypt = sinon.stub();
      decrypt.withArgs("encrypted1").returns("unencrypted1");
      decrypt.withArgs("encrypted2").returns("unencrypted2");

      let csc = new ConnectSessionEncrypt(KEY, {all: all});
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
      let csc = new ConnectSessionEncrypt(KEY, {});
      assert.equal(csc.decrypt(csc.encrypt("data")), "data");
      assert.notEqual(csc.encrypt("data"), "data");
    });
  });
});
