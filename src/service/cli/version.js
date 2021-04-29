'use strict';

const {getLogger} = require(`../lib/logger`);
const logger = getLogger({name: `version`});
const packageJsonFile = require(`../../../package.json`);

module.exports = {
  name: `--version`,
  run() {
    const version = packageJsonFile.version;
    logger.info(version);
  }
};
