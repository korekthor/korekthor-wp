import { Dictionary } from "../../types";
import { state } from "./classic-editor";
import { setup_idle_screen } from "./idle";
import { apply_template, clone_template } from "./templates";
import $ from "jquery";

const populate_dictionary_list = (dictionary: Dictionary, fragment: DocumentFragment) => {
  const dict_id = `korekthor-dictionary-${dictionary.id}`;

  const label = fragment.querySelector(".korekthor-classic-dictionary-item");
  label.setAttribute("for", dict_id);

  const input = label.querySelector("input");
  input.setAttribute("id", dict_id);

  if (state.selected_dictionaries.includes(dictionary.id)) {
    input.setAttribute("checked", "checked");
  }

  input.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      state.selected_dictionaries.push(dictionary.id);
    } else {
      state.selected_dictionaries = state.selected_dictionaries.filter((d) => d !== dictionary.id);
    }
  });

  const span = label.querySelector("span");
  span.textContent = dictionary.name;

  const description = fragment.querySelector("p");
  description.textContent = dictionary.description;

  const categories = fragment.querySelector(".korekthor-classic-dictionary-item-categories");
  categories.textContent = dictionary.categories.join(", ");

  return fragment;
};

const update_dictionaries = (search?: string) => {
  const dictionary_list = document.querySelector("#korekthor-classic-dictionaries-list");
  dictionary_list.innerHTML = "";

  if (korekthor_ajax.dictionaries_error)
    document.getElementById("korekthor-classic-dictionaries-error").textContent = korekthor_ajax.dictionaries_error;

  const toProcess = korekthor_ajax.dictionaries.filter((d) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(searchLower) ||
      d.description.toLowerCase().includes(searchLower) ||
      d.categories.some((category) => category.toLowerCase().includes(searchLower))
    );
  });

  for (const dictionary of toProcess) {
    const dictionary_template = clone_template("korekthor-classic-dictionary");

    // populate dictionary list
    const fragment = populate_dictionary_list(dictionary, dictionary_template);
    dictionary_list.appendChild(fragment);
  }

  if (toProcess.length === 0) {
    dictionary_list.textContent = "Nebyly nalezeny žádné slovníky. Zkuste změnit hledaný výraz.";
  }
};

const save_and_close = () => {
  const button = document.getElementById("korekthor-button-idle");
  button.textContent = "Ukládám...";

  $.ajax({
    url: ajaxurl,
    type: "POST",
    data: {
      action: "korekthor_update_dictionaries",
      dictionaries: state.selected_dictionaries,
      nonce: korekthor_ajax.nonce,
    },
    success: () => {
      setup_idle_screen();
    },
    error: (error) => {
      console.error("Error", error);
      button.textContent = "Něco se pokazilo!";
    },
  });
};

export const setup_dictionary_screen = () => {
  const { content, main } = apply_template("korekthor-classic-dictionaries");

  // add back link

  const company_dictionary: Dictionary = {
    id: "company",
    name: "Firemní slovník",
    description: "Slovník definovaný firmou pro interní použití.",
    categories: [],
  };

  if (!korekthor_ajax.dictionaries.find((d) => d.id === "company")) {
    korekthor_ajax.dictionaries.unshift(company_dictionary);
  }

  const search_input = content.querySelector("#korekthor-classic-dictionaries-search");
  search_input?.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    update_dictionaries(target.value);
  });

  main.appendChild(content);

  update_dictionaries();

  const back_link = document.querySelector("#korekthor-button-idle");
  back_link.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    save_and_close();
  });
};
