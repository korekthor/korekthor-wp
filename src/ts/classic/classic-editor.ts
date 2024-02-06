import { setup_dictionary_screen } from "./dictionary";
import { setup_idle_screen } from "./idle";

export const state = {
  selected_dictionaries: korekthor_ajax.dictionaries_selected,
};

export const main = () => {
  setup_idle_screen();
};
