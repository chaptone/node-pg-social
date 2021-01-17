const app = require("./src/app.js");
const pool = require("./src/pool");
require("dotenv/config");

pool
  .connect({ connectionString: process.env.DATABASE_URL })
  .then(() => {
    app().listen(3005, () => {
      console.log("Listening on port 3005");
    });
  })
  .catch(err => console.error(err));
