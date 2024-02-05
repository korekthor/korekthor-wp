import { KorekthorPlugin } from "./ts/KorekthorPlugin";
import { registerPlugin } from "@wordpress/plugins";
import "./scss/editor.scss";

registerPlugin("korekthor", {
  render: KorekthorPlugin,
});
