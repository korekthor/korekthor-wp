import { KorekthorPlugin } from "./ts/gutenberg/KorekthorPlugin";
import { registerPlugin } from "@wordpress/plugins";
import "./scss/editor.scss";
import "./scss/mistake.scss";

registerPlugin("korekthor", {
  render: KorekthorPlugin,
});
