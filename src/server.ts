import app from "./app/app";
import { config } from "./config/config";
import { initDB } from "./db";

const main = () => {
  initDB();
  app.listen(config.PORT, () => {
    console.log(`Example app listening on port ${config.PORT}`);
  });
};

main();
