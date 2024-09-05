import "dotenv/config";
import { startApi } from "./api/api.js";

const startApp = async () => {
  await startApi();
};

startApp();
