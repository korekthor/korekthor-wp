import { ObjectElement, getText, runHighlight } from "../../jakubuv-uzasny-highlighter";
import { state } from "./classic-editor";
import { setup_idle_screen } from "./idle";
import { apply_template, clone_template } from "./templates";
import $ from "jquery";

declare var tinyMCE: any;
declare var korekthor_ajax: any;
declare var ajaxurl: string;

const replaceFirstOccurrence = (str: string, token: string, replacement: string): string => {
  if (!token) return str;
  const cleanReplacement = replacement.replaceAll("&nbsp;", " ");
  const cleanToken = token.replaceAll("&nbsp;", " ");
  const idx = str.indexOf(cleanToken);
  if (idx === -1) {
    const lowerIdx = str.toLowerCase().indexOf(cleanToken.toLowerCase());
    if (lowerIdx === -1) {
      const origIdx = str.indexOf(token);
      if (origIdx === -1) return str;
      return str.slice(0, origIdx) + cleanReplacement + str.slice(origIdx + token.length);
    }
    return str.slice(0, lowerIdx) + cleanReplacement + str.slice(lowerIdx + cleanToken.length);
  }
  return str.slice(0, idx) + cleanReplacement + str.slice(idx + cleanToken.length);
};

function parseApiErrors(data: any[]): any[] {
  const wordsWithErrors: any[] = [];
  let errors: string[] = [];
  let unknown_word = "";
  let shifted = 0;
  let connect_to_token = false;
  let connect_to_result = false;

  if (!data || !Array.isArray(data)) return [];

  let index = -1;

  data.forEach((paragraph: any) => {
    let oneToken = "";
    let oneResult = "";
    const words = paragraph.sentences ? paragraph.sentences.flat() : [];

    words.forEach((wordData: any, indexWord: number) => {
      wordData.errors.forEach((error: any) => {
        errors.push(error.type);
        if (error.type === "NEZNAME_SLOVO") unknown_word = error.result;
      });

      const token = wordData.original_token.token;
      const result = wordData.result;
      const wordCount = token.trim().length > 0 ? token.trim().split(" ").length : 0;
      const ends_non_breaking = token.slice(-6) === "&nbsp;";
      const token_con = wordData.original_token.connect_with_after && !ends_non_breaking;
      const result_con = wordData.connect_with_after && !ends_non_breaking;

      if (!connect_to_result && connect_to_token) {
        oneToken += token;
        oneResult += " " + result;
      } else if (connect_to_result && !connect_to_token) {
        oneToken += " " + token;
        oneResult += result;
      } else {
        oneToken += token;
        oneResult += result;
      }

      if (connect_to_token) shifted += wordCount;
      index += wordCount;

      if (((!token_con && !result_con) || indexWord + 1 === words.length) && errors.length > 0) {
        wordsWithErrors.push({
          index: index - shifted,
          token: oneToken.trim(),
          result: oneResult.trim(),
          error: [...new Set(errors)],
          unknown_word: unknown_word,
          id: Math.random().toString(36).slice(2, 7),
        });

        errors = [];
        unknown_word = "";
      }

      if (!token_con && !result_con) {
        oneToken = "";
        oneResult = "";
      }

      connect_to_token = token_con;
      connect_to_result = result_con;
    });
  });

  return wordsWithErrors;
}

const getMistakeNoun = (count: number): string => {
  if (count === 1) return "chyba";
  if (count >= 2 && count <= 4) return "chyby";
  return "chyb";
};

const correct_request = (text: string) =>
  new Promise((resolve, reject) => {
    if (!text) {
      resolve({ data: { data: [] } });
      return;
    }
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
  const tAnno = document.getElementById("korekthor-title-annotations");
  if (tAnno) tAnno.remove();
  const pAnno = document.getElementById("korekthor-perex-annotations");
  if (pAnno) pAnno.remove();

  const titleInput = document.getElementById("title") as HTMLInputElement | null;
  if (titleInput) titleInput.classList.remove("korekthor-input-highlight");
  const perexInput = document.getElementById("excerpt") as HTMLTextAreaElement | null;
  if (perexInput) perexInput.classList.remove("korekthor-input-highlight");

  apply_template("korekthor-classic-ok", true);

  const pEl = document.querySelector("#korekthor-classic-main .korekthor-text-ok p");
  if (pEl) {
    pEl.textContent = "Všechny části (titulek, perex i text) jsou v pořádku.";
  }

  const link = document.getElementById("korekthor-button-idle");
  if (link) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      setup_idle_screen();
    });
  }
};

export const correct = async () => {
  apply_template("korekthor-classic-running", true);

  // 1. Title
  const titleInput = (document.getElementById("title") || document.querySelector("input[name='post_title']")) as HTMLInputElement | null;
  const titleText = titleInput ? titleInput.value.trim() : "";

  // 2. Perex (Excerpt)
  const perexInput = (document.getElementById("excerpt") || document.querySelector("textarea[name='excerpt']")) as HTMLTextAreaElement | null;
  const perexText = perexInput ? perexInput.value.trim() : "";

  // 3. Text (TinyMCE Content)
  let editorElement: HTMLElement | null = null;
  let contentText = "";

  const activeEditor = typeof tinyMCE !== "undefined" ? tinyMCE.activeEditor || tinyMCE.get("content") : null;
  if (activeEditor && !activeEditor.isHidden?.()) {
    editorElement = activeEditor.getDoc()?.body || null;
    if (editorElement) {
      contentText = getText(editorElement).trim();
    }
  }

  if (!contentText) {
    const rawContentEl = document.getElementById("content") as HTMLTextAreaElement | null;
    if (rawContentEl && rawContentEl.value) {
      contentText = rawContentEl.value.trim();
    }
  }

  console.log("[Korekthor Classic] Kontrola:", {
    title: titleText,
    perex: perexText,
    contentLength: contentText.length,
  });

  if (!titleText && !perexText && !contentText) {
    apply_template("korekthor-classic-error", true);
    const detail = document.getElementById("korekthor-error-detail");
    if (detail) detail.textContent = "Nebyl nalezen žádný text ke kontrole.";
    document.getElementById("korekthor-button-idle")?.addEventListener("click", (e) => {
      e.preventDefault();
      setup_idle_screen();
    });
    return;
  }

  try {
    const [titleRes, perexRes, textRes]: any = await Promise.all([
      titleText ? correct_request(titleText) : Promise.resolve({ data: { data: [] } }),
      perexText ? correct_request(perexText) : Promise.resolve({ data: { data: [] } }),
      contentText ? correct_request(contentText) : Promise.resolve({ data: { data: [] } }),
    ]);

    let currentTitleText = titleInput ? titleInput.value : titleText;
    let titleMistakes = parseApiErrors(titleRes?.data?.data || []);

    let currentPerexText = perexInput ? perexInput.value : perexText;
    let perexMistakes = parseApiErrors(perexRes?.data?.data || []);

    let textMistakes: ObjectElement[] = [];
    let textCorrectAll: (() => void) | null = null;
    let textRejectAll: (() => void) | null = null;

    const updateTitleAnnotations = (mistakes: any[]) => {
      let container = document.getElementById("korekthor-title-annotations");
      if (mistakes.length === 0) {
        if (container) container.remove();
        if (titleInput) titleInput.classList.remove("korekthor-input-highlight");
        return;
      }

      if (!container) {
        container = document.createElement("div");
        container.id = "korekthor-title-annotations";
        container.className = "korekthor-field-annotations";
        const titlewrap = document.getElementById("titlewrap") || titleInput?.parentElement;
        if (titlewrap && titlewrap.parentElement) {
          titlewrap.parentElement.insertBefore(container, titlewrap.nextSibling);
        }
      }

      container.innerHTML = "";
      const label = document.createElement("span");
      label.className = "korekthor-annotation-label";
      label.textContent = "Chyby v titulku:";
      container.appendChild(label);

      mistakes.forEach((m) => {
        const pill = document.createElement("span");
        pill.className = "korekthor-annotation-pill";
        pill.setAttribute("data-id", m.id);

        const wrong = document.createElement("span");
        wrong.className = "korekthor-annotation-wrong";
        wrong.textContent = m.token;

        const arrow = document.createElement("span");
        arrow.className = "korekthor-annotation-arrow";
        arrow.textContent = "→";

        const suggest = document.createElement("span");
        suggest.className = "korekthor-annotation-suggest";
        suggest.textContent = m.result;

        pill.appendChild(wrong);
        pill.appendChild(arrow);
        pill.appendChild(suggest);

        pill.style.cursor = "pointer";
        pill.title = "Klikněte pro přijetí této opravy";
        pill.addEventListener("click", () => {
          acceptTitleMistake(m);
        });

        container.appendChild(pill);
      });
    };

    const updatePerexAnnotations = (mistakes: any[]) => {
      let container = document.getElementById("korekthor-perex-annotations");
      if (mistakes.length === 0) {
        if (container) container.remove();
        if (perexInput) perexInput.classList.remove("korekthor-input-highlight");
        return;
      }

      if (!container) {
        container = document.createElement("div");
        container.id = "korekthor-perex-annotations";
        container.className = "korekthor-field-annotations";
        if (perexInput && perexInput.parentElement) {
          perexInput.parentElement.appendChild(container);
        }
      }

      container.innerHTML = "";
      const label = document.createElement("span");
      label.className = "korekthor-annotation-label";
      label.textContent = "Chyby v perexu:";
      container.appendChild(label);

      mistakes.forEach((m) => {
        const pill = document.createElement("span");
        pill.className = "korekthor-annotation-pill";
        pill.setAttribute("data-id", m.id);

        const wrong = document.createElement("span");
        wrong.className = "korekthor-annotation-wrong";
        wrong.textContent = m.token;

        const arrow = document.createElement("span");
        arrow.className = "korekthor-annotation-arrow";
        arrow.textContent = "→";

        const suggest = document.createElement("span");
        suggest.className = "korekthor-annotation-suggest";
        suggest.textContent = m.result;

        pill.appendChild(wrong);
        pill.appendChild(arrow);
        pill.appendChild(suggest);

        pill.style.cursor = "pointer";
        pill.title = "Klikněte pro přijetí této opravy";
        pill.addEventListener("click", () => {
          acceptPerexMistake(m);
        });

        container.appendChild(pill);
      });
    };

    const acceptTitleMistake = (m: any) => {
      if (titleInput) {
        currentTitleText = replaceFirstOccurrence(currentTitleText, m.token, m.result);
        titleInput.value = currentTitleText;
        titleInput.dispatchEvent(new Event("input", { bubbles: true }));
        titleInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      titleMistakes = titleMistakes.filter((item) => item.id !== m.id);
      updateTitleAnnotations(titleMistakes);
      renderResults();
    };

    const rejectTitleMistake = (m: any) => {
      titleMistakes = titleMistakes.filter((item) => item.id !== m.id);
      updateTitleAnnotations(titleMistakes);
      renderResults();
    };

    const acceptAllTitle = () => {
      if (titleInput) {
        titleMistakes.forEach((m) => {
          currentTitleText = replaceFirstOccurrence(currentTitleText, m.token, m.result);
        });
        titleInput.value = currentTitleText;
        titleInput.dispatchEvent(new Event("input", { bubbles: true }));
        titleInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      titleMistakes = [];
      updateTitleAnnotations([]);
    };

    const rejectAllTitle = () => {
      titleMistakes = [];
      updateTitleAnnotations([]);
    };

    const acceptPerexMistake = (m: any) => {
      if (perexInput) {
        currentPerexText = replaceFirstOccurrence(currentPerexText, m.token, m.result);
        perexInput.value = currentPerexText;
        perexInput.dispatchEvent(new Event("input", { bubbles: true }));
        perexInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      perexMistakes = perexMistakes.filter((item) => item.id !== m.id);
      updatePerexAnnotations(perexMistakes);
      renderResults();
    };

    const rejectPerexMistake = (m: any) => {
      perexMistakes = perexMistakes.filter((item) => item.id !== m.id);
      updatePerexAnnotations(perexMistakes);
      renderResults();
    };

    const acceptAllPerex = () => {
      if (perexInput) {
        perexMistakes.forEach((m) => {
          currentPerexText = replaceFirstOccurrence(currentPerexText, m.token, m.result);
        });
        perexInput.value = currentPerexText;
        perexInput.dispatchEvent(new Event("input", { bubbles: true }));
        perexInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      perexMistakes = [];
      updatePerexAnnotations([]);
    };

    const rejectAllPerex = () => {
      perexMistakes = [];
      updatePerexAnnotations([]);
    };

    const renderResults = () => {
      updateTitleAnnotations(titleMistakes);
      updatePerexAnnotations(perexMistakes);

      const totalCount = titleMistakes.length + perexMistakes.length + textMistakes.length;
      if (totalCount === 0) {
        setup_ok_screen();
        return;
      }

      apply_template("korekthor-classic-results", true);
      const list = document.getElementById("korekthor-mistake-list");
      if (!list) return;

      list.innerHTML = "";

      // 1. Accept/Reject all buttons
      const buttonsFragment = clone_template("korekthor-classic-buttons");
      const accept_all_button = buttonsFragment.querySelector("#korekthor-button-accept-all") as HTMLElement;
      const reject_all_button = buttonsFragment.querySelector("#korekthor-button-reject-all") as HTMLElement;

      accept_all_button.addEventListener("click", (e) => {
        e.preventDefault();
        acceptAllTitle();
        acceptAllPerex();
        if (textCorrectAll) textCorrectAll();
        renderResults();
      });

      reject_all_button.addEventListener("click", (e) => {
        e.preventDefault();
        rejectAllTitle();
        rejectAllPerex();
        if (textRejectAll) textRejectAll();
        renderResults();
      });

      list.appendChild(buttonsFragment);

      // 2. Recheck link
      const recheckDiv = document.createElement("div");
      recheckDiv.className = "korekthor-recheck-wrapper";
      recheckDiv.style.marginBottom = "0.75rem";
      const recheckBtn = document.createElement("button");
      recheckBtn.type = "button";
      recheckBtn.className = "button button-link";
      recheckBtn.textContent = "↻ Překontrolovat";
      recheckBtn.addEventListener("click", (e) => {
        e.preventDefault();
        correct();
      });
      recheckDiv.appendChild(recheckBtn);
      list.appendChild(recheckDiv);

      // 3. Sections: only include sections with at least 1 mistake
      const allSections = [
        {
          id: "title",
          label: "Titulek",
          mistakes: titleMistakes,
          isTextPart: false,
          onAccept: acceptTitleMistake,
          onReject: rejectTitleMistake,
          onHighlight: (m: any) => {
            if (titleInput) {
              titleInput.classList.add("korekthor-input-highlight");
              const idx = titleInput.value.indexOf(m.token);
              if (idx !== -1) {
                try {
                  titleInput.focus({ preventScroll: true });
                  titleInput.setSelectionRange(idx, idx + m.token.length);
                } catch (e) {}
              }
            }
            const pill = document.querySelector(`#korekthor-title-annotations .korekthor-annotation-pill[data-id="${m.id}"]`) as HTMLElement;
            if (pill) {
              pill.style.backgroundColor = "#ffe0e0";
              pill.style.borderColor = "#e74c3c";
            }
          },
          onUnhighlight: (m: any) => {
            if (titleInput) {
              titleInput.classList.remove("korekthor-input-highlight");
            }
            const pill = document.querySelector(`#korekthor-title-annotations .korekthor-annotation-pill[data-id="${m.id}"]`) as HTMLElement;
            if (pill) {
              pill.style.backgroundColor = "";
              pill.style.borderColor = "";
            }
          },
        },
        {
          id: "perex",
          label: "Perex",
          mistakes: perexMistakes,
          isTextPart: false,
          onAccept: acceptPerexMistake,
          onReject: rejectPerexMistake,
          onHighlight: (m: any) => {
            if (perexInput) {
              perexInput.classList.add("korekthor-input-highlight");
              const idx = perexInput.value.indexOf(m.token);
              if (idx !== -1) {
                try {
                  perexInput.focus({ preventScroll: true });
                  perexInput.setSelectionRange(idx, idx + m.token.length);
                } catch (e) {}
              }
            }
            const pill = document.querySelector(`#korekthor-perex-annotations .korekthor-annotation-pill[data-id="${m.id}"]`) as HTMLElement;
            if (pill) {
              pill.style.backgroundColor = "#ffe0e0";
              pill.style.borderColor = "#e74c3c";
            }
          },
          onUnhighlight: (m: any) => {
            if (perexInput) {
              perexInput.classList.remove("korekthor-input-highlight");
            }
            const pill = document.querySelector(`#korekthor-perex-annotations .korekthor-annotation-pill[data-id="${m.id}"]`) as HTMLElement;
            if (pill) {
              pill.style.backgroundColor = "";
              pill.style.borderColor = "";
            }
          },
        },
        {
          id: "text",
          label: "Text",
          mistakes: textMistakes,
          isTextPart: true,
          onAccept: (m: ObjectElement) => m.accept(),
          onReject: (m: ObjectElement) => m.reject(),
          onHighlight: (m: ObjectElement) => m.highlight(),
          onUnhighlight: (m: ObjectElement) => m.unhighlight(),
        },
      ];

      // Filter: only display categories where there are mistakes
      const activeSections = allSections.filter((section) => section.mistakes.length > 0);

      if (activeSections.length === 0) {
        setup_ok_screen();
        return;
      }

      for (const section of activeSections) {
        const count = section.mistakes.length;
        const sectionEl = document.createElement("div");
        sectionEl.className = "korekthor-part-section";

        const headerEl = document.createElement("div");
        headerEl.className = "korekthor-part-header";

        const titleSpan = document.createElement("span");
        titleSpan.className = "korekthor-part-title";
        titleSpan.textContent = section.label;

        const badgeSpan = document.createElement("span");
        badgeSpan.className = `korekthor-part-badge ${count === 0 ? "is-zero" : ""}`;
        badgeSpan.textContent = `${count} ${getMistakeNoun(count)}`;

        headerEl.appendChild(titleSpan);
        headerEl.appendChild(badgeSpan);
        sectionEl.appendChild(headerEl);

        const contentEl = document.createElement("div");
        contentEl.className = "korekthor-part-content";

        for (const mistake of section.mistakes) {
          const fragment = clone_template("korekthor-classic-mistake");
          const slashIcon = fragment.querySelector(".korekthor-icon-slash") as HTMLElement;
          const alertIcon = fragment.querySelector(".korekthor-icon-alert") as HTMLElement;
          const arrowIcon = fragment.querySelector(".korekthor-icon-arrow") as HTMLElement;
          const suggestion = fragment.querySelector(".korekthor-mistake-suggestion") as HTMLElement;
          const original = fragment.querySelector(".korekthor-mistake-original") as HTMLElement;
          const details = fragment.querySelector(".korekthor-mistake-details") as HTMLElement;

          const errObj = section.isTextPart ? mistake.error : mistake;
          const errorsList: string[] = errObj.error || [];

          if (errorsList.includes("NEZNAME_SLOVO")) {
            slashIcon.style.display = "block";
            suggestion.textContent = "Neznámé slovo";
          } else if (errorsList.length === 1 && errorsList[0] === "PRILIS_DLOUHE") {
            alertIcon.style.display = "block";
            suggestion.textContent = "Tohle se nám nepovedlo zpracovat...";
          } else {
            original.textContent = errObj.token;
            original.style.display = "block";
            arrowIcon.style.display = "block";
            suggestion.textContent = errObj.result;
          }

          const errorCodesMap = (window as any).korekthor_ajax?.error_codes || {};
          details.textContent = errorsList.map((e: string) => errorCodesMap[e] || e).join(", ");

          const acceptBtn = fragment.querySelector(".korekthor-button-accept") as HTMLElement;
          acceptBtn.addEventListener("click", () => {
            section.onAccept(mistake);
          });

          const rejectBtn = fragment.querySelector(".korekthor-button-reject") as HTMLElement;
          rejectBtn.addEventListener("click", () => {
            section.onReject(mistake);
          });

          const wrapperDiv = fragment.querySelector(".korekthor-mistake") as HTMLElement;
          wrapperDiv.addEventListener("mouseenter", () => {
            section.onHighlight(mistake);
          });
          wrapperDiv.addEventListener("mouseleave", () => {
            section.onUnhighlight(mistake);
          });

          contentEl.appendChild(fragment);
        }

        sectionEl.appendChild(contentEl);
        list.appendChild(sectionEl);
      }
    };

    // Initialize highlighter on TinyMCE body if present
    if (editorElement && textRes?.data?.data) {
      runHighlight(editorElement, textRes.data.data, (mistakes: ObjectElement[], cAll: () => void, rAll: () => void) => {
        textMistakes = mistakes;
        textCorrectAll = cAll;
        textRejectAll = rAll;
        renderResults();
      });
    } else {
      renderResults();
    }
  } catch (error: any) {
    apply_template("korekthor-classic-error", true);

    document.getElementById("korekthor-button-idle")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      setup_idle_screen();
    });

    const errorDetail = document.getElementById("korekthor-error-detail");
    if (errorDetail) {
      errorDetail.textContent = error?.message || error || "Něco se pokazilo!";
    }
  }
};

