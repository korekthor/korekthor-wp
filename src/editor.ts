import { KorekthorPlugin } from "./ts/KorekthorPlugin";
import { registerPlugin } from "@wordpress/plugins";

registerPlugin("korekthor-correct", {
  render: KorekthorPlugin,
});
