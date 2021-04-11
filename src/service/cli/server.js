'use strict';

const express = require(`express`);
const chalk = require(`chalk`);
const fs = require(`fs`).promises;
const {HttpCode, ExitCode} = require(`../../constants`);
const routes = require(`../api`);

const DEFAULT_PORT = 3000;
const FILENAME = `mocks.json`;
const API_PREFIX = `/api`;

const app = express();
app.use(express.json());

app.get(`/offers`, async (req, res) => {
  try {
    const fileContent = await fs.readFile(FILENAME);
    const mocks = JSON.parse(fileContent);
    res.json(mocks);

  } catch (err) {
    res.json([]);
  }
});

app.use(API_PREFIX, routes);

app.use((req, res) => res
  .status(HttpCode.NOT_FOUND)
  .send(`Not found`));

module.exports = {
  name: `--server`,
  run(args) {
    const [customPort] = args;
    const port = Number.parseInt(customPort, 10) || DEFAULT_PORT;

    try {
      app.listen(port, (err) => {
        if (err) {
          return console.error(`Ошибка при создании сервера`, err);
        }

        return console.info(chalk.green(`Ожидаю соединений на ${port} порту`));
      });

    } catch (err) {
      console.error(`Ошибка при создании сервера`, err);
      process.exit(ExitCode.ERROR);
    }
  }
};
