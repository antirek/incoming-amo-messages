const config = require('config');

const {createApp} = require('./app');

const bootstrap = async () => {
  const app = createApp();
  app.listen(config.apps['messages-api'].port, () => {
    console.log(`started with config`, config);
  });
};

(bootstrap)();
