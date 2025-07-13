import { createApp } from "./app";
import { config } from "./src/lib/config";
import { run } from "./src/lib/db";

(async function server() {
  try {
    await run();
    const app = await createApp(config);

    app.listen(config.PORT, () => {
      console.log(`listening on ${config.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
})();
