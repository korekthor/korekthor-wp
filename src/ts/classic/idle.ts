import { correct } from "./corrections";
import { setup_dictionary_screen } from "./dictionary";
import { apply_template } from "./templates";

export const setup_idle_screen = () => {
  apply_template("korekthor-classic-idle", true);

  // add event listener to start button
  const button_start = document.getElementById("korekthor-button-check");
  const button_dictionaries = document.getElementById("korekthor-button-dictionaries");

  button_start?.addEventListener("click", () => {
    correct();
  });

  if (button_dictionaries) {
    button_dictionaries.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      setup_dictionary_screen();
    });
  }
};
