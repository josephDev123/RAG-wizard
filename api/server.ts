import { createApp } from "./app";
import { config } from "./src/lib/config";
import { InitDb } from "./src/lib/db";
import { initGptClient } from "./src/lib/OpenAI";

(async function server() {
  try {
    const MongoDbclient = await InitDb();
    const OpenAInit = initGptClient(
      config.OPENAI_API_KEY,
      config.OPENAI_ENDPOINT
    );
    const app = await createApp(config, MongoDbclient, OpenAInit);

    app.listen(config.PORT, () => {
      console.log(`listening on ${config.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
})();
