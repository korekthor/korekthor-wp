import { ObjectElement, runHighlight } from "../../jakubuv-uzasny-highlighter";
import { state } from "./classic-editor";
import { setup_idle_screen } from "./idle";
import { apply_template, clone_template } from "./templates";
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

const setup_ok_screen = () => {
  apply_template("korekthor-classic-ok", true);

  const link = document.getElementById("korekthor-button-idle");
  console.log(link);
  link.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    setup_idle_screen();
  });
};

const update_corrections = (data: ObjectElement[]) => {
  if (data.length === 0) {
    setup_ok_screen();
    return;
  }

  const list = document.getElementById("korekthor-mistake-list");
  list.innerHTML = "";

  for (const mistake of data) {
    const fragment = clone_template("korekthor-classic-mistake");

    // setup summary
    const slashIcon = fragment.querySelector(".korekthor-icon-slash") as HTMLElement;
    const alertIcon = fragment.querySelector(".korekthor-icon-alert") as HTMLElement;
    const arrowIcon = fragment.querySelector(".korekthor-icon-arrow") as HTMLElement;
    const suggestion = fragment.querySelector(".korekthor-mistake-suggestion") as HTMLElement;
    const original = fragment.querySelector(".korekthor-mistake-original") as HTMLElement;

    if (mistake.error.error.find((error: string) => error === "NEZNAME_SLOVO")) {
      slashIcon.style.display = "block";
      suggestion.textContent = "Neznámé slovo";
    } else if (mistake.error.error.length === 1 && mistake.error.error[0] === "PRILIS_DLOUHE") {
      alertIcon.style.display = "block";
      suggestion.textContent = "Tohle se nám nepovedlo zpracovat...";
    } else {
      original.textContent = mistake.error.token;
      original.style.display = "block";
      arrowIcon.style.display = "block";
      suggestion.textContent = mistake.error.result;
    }

    // populate mistake details
    const details = fragment.querySelector(".korekthor-mistake-details");
    details.textContent = mistake.error.error.map((e: string) => korekthor_ajax.error_codes[e]).join(",");

    // make buttons work
    const accept = fragment.querySelector(".korekthor-button-accept");
    accept.addEventListener("click", () => {
      mistake.accept();
    });

    const reject = fragment.querySelector(".korekthor-button-reject");
    reject.addEventListener("click", () => {
      mistake.reject();
    });

    // add to list
    list.appendChild(fragment);
  }
};

const setup_correction_screen = (data: any) => {
  if (data.data.data.length === 0) {
    setup_ok_screen();
    return;
  }

  apply_template("korekthor-classic-results", true);

  const editor = tinyMCE.activeEditor;
  const editorElement = editor.getDoc().body;

  console.log(editorElement, data.data.data);

  runHighlight(editorElement, data.data.data, update_corrections);
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
