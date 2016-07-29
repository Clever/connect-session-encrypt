'use strict';

const async        = require('async');
const EventEmitter = require('events');
const crypto       = require('./lib/crypto.js');

module.exports = class SessionEncrypt extends EventEmitter {
  constructor(key, store) {
    super();
    if (Buffer.byteLength(key, 'utf8') != 32) {
      throw new Error("Invalid key length: must be 32 bytes");
    }

    this.store = store;
    this.key = key;

    // Some methods are optional, so only add them if the backing store has them.
    for (let meth of ['destroy', 'clear', 'length']) {
      if (this.store[meth]) {
        this.add(meth);
      }
    }

    // Touch and all need special behavior, so can't do it in the above loop.
    if (this.store.touch) {
      this.touch = (sid, session, cb) => {
        this.store.touch(sid, this.encrypt(session), cb);
      }
    }

    if (this.store.all) {
      this.all = (cb) => {
        this.store.all((err, sessions) => {
          if (err) {
            cb(err);
            return
          }

          cb(null, sessions.map(this.decrypt.bind(this), cb));
        });
      }
    }
  }

  add(meth) {
    this[meth] = (...args) => {
      this.store[meth].apply(this.store, args);
    }
  }

  get(sid, cb) {
    this.store.get(sid, (err, session) => {
      if (err) {
        cb(err);
        return
      }

      cb(null, this.decrypt(session));
    });
  }

  set(sid, session, cb) {
    this.store.set(sid, this.encrypt(session), cb);
  }

  encrypt(session) {
    return crypto.encrypt(this.key, session);
  }

  decrypt(session) {
    return crypto.decrypt(this.key, session);
  }
}
