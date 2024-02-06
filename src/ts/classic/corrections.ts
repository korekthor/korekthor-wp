import { state } from "./classic-editor";
import { setup_idle_screen } from "./idle";
import { apply_template } from "./templates";
import $ from "jquery";

const correct_request = (text: string) =>
  new Promise((resolve, reject) => {
    $.post(ajaxurl, {
      nonce: korekthor_ajax.nonce,
      action: "korekthor_correction",
      contentType: "application/x-www-form-urlencoded;charset=utf-8",
      text: text,
      dictionaries: state.selected_dictionaries,
    })
      .done((data: any) => {
        if (data.error) reject(data.error);
        resolve(data);
      })
      .fail((error) => {
        reject(error);
      });
  });

const setup_correction_screen = (data: any) => {
  const { content, main } = apply_template("korekthor-classic-results");

  console.log(data);

  // do the magic

  main.appendChild(content);
};

export const correct = () => {
  if (!tinyMCE) throw new Error("tinyMCE is not defined!");
  apply_template("korekthor-classic-running", true);

  const content = tinyMCE.activeEditor.getContent({
    format: "text",
  });

  correct_request(content)
    .then((data: any) => {
      const main = document.getElementById("korekthor-classic-main");
      if (!main) throw new Error("Main element not found!");

      setup_correction_screen(data);
    })
    .catch((error) => {
      apply_template("korekthor-classic-error", true);

      document.getElementById("korekthor-button-idle").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        setup_idle_screen();
      });

      console.log(error);

      document.getElementById("korekthor-error-detail").textContent = error?.message || error || "Něco se pokazilo!";
    });
};
