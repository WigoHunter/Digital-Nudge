var keys = require("../keys");

/* eslint-disable */
module.exports = {
  servers: {
    one: {
      host: keys.ip,
      username: "ubuntu",
      pem: "../../DigitalNudge.pem"
    }
  },
  app: {
    name: "DigitalNudge",
    path: "../",
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true
    },
    env: {
      ROOT_URL: "https://nudges.ml",
      MONGO_URL: keys.mongo
    },
    docker: {
      image: "abernix/meteord:node-8.4.0-base"
    },
    deployCheckWaitTime: 60,
    enableUploadProgressBar: true
  },
  proxy: {
    domains: "nudges.ml,www.nudges.ml",
    ssl: {
      // Enable let's encrypt to create free certificates.
      // The email is used by Let's Encrypt to notify you when the
      // certificates are close to expiring.
      letsEncryptEmail: "bwzhangtopone@gmail.com",
      forceSSL: true
    }
  }
};
