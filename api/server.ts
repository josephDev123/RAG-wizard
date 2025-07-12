import { createApp } from "./app";
import { config } from "./src/lib/config";

(async function server() {
  try {
    const app = await createApp(config);
    app.listen(config.PORT, () => {
      console.log(`listening on ${config.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
})();
