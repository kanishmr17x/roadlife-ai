const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`RoadSense backend listening on port ${PORT}`);
});

module.exports = server;
