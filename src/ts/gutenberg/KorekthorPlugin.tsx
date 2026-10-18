import { RichTextToolbarButton as _RichTextToolbarButton } from "@wordpress/block-editor";
import { select, dispatch, useSelect } from "@wordpress/data";
import { PluginSidebar, PluginSidebarMoreMenuItem } from "@wordpress/edit-post";
import $ from "jquery";
import React from "react";
import KorekthorToolbarButton from "./ToolbarButton";
import KorekthorIcon from "./icon";
import StatusLoading from "./status/StatusLoading";
import StatusNone from "./status/StatusNone";
import DictionarySelect from "./dictionary/DictionarySelect";
import StatusError from "./status/StatusError";
import StatusOk from "./status/StatusOk";
import MistakeList, { MistakeSection } from "./mistakes/MistakeList";
import { ObjectElement, runHighlight } from "../../jakubuv-uzasny-highlighter";

const RichTextToolbarButton = _RichTextToolbarButton as any;

interface PartState {
  label: string;
  mistakes: ObjectElement[];
  acceptAll: () => void;
  rejectAll: () => void;
  checked: boolean;
}

interface PartsMap {
  title: PartState;
  perex: PartState;
  text: PartState;
}

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

// Accurate parser matching Jakub's highlighter format without modifying external files
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

const getAllDocuments = (): Document[] => {
  const docs: Document[] = [document];
  const iframes = Array.from(document.querySelectorAll("iframe"));
  for (const iframe of iframes) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc && !docs.includes(doc)) {
        docs.push(doc);
      }
    } catch (e) {
      // Ignore cross-origin frames
    }
  }
  return docs;
};

const getTitleFromData = (): string => {
  try {
    const wpData = (window as any).wp?.data || { select };

    // 1. Check core/editor
    const editor = wpData.select?.("core/editor");
    if (editor) {
      if (typeof editor.getEditedPostAttribute === "function") {
        const val = editor.getEditedPostAttribute("title");
        const str = typeof val === "object" && val !== null ? val.raw || val.rendered || "" : val || "";
        if (typeof str === "string" && str.trim()) return str.trim();
      }
      if (typeof editor.getCurrentPostAttribute === "function") {
        const val = editor.getCurrentPostAttribute("title");
        const str = typeof val === "object" && val !== null ? val.raw || val.rendered || "" : val || "";
        if (typeof str === "string" && str.trim()) return str.trim();
      }
      if (typeof editor.getPostEdits === "function") {
        const edits = editor.getPostEdits();
        if (edits?.title && typeof edits.title === "string" && edits.title.trim()) {
          return edits.title.trim();
        }
      }
      if (typeof editor.getCurrentPost === "function") {
        const post = editor.getCurrentPost();
        if (post) {
          const val = post.title;
          const str = typeof val === "object" && val !== null ? val.raw || val.rendered || "" : val || "";
          if (typeof str === "string" && str.trim()) return str.trim();
        }
      }
    }

    // 2. Check core/edit-site (Site Editor / FSE)
    const editSite = wpData.select?.("core/edit-site");
    if (editSite) {
      if (typeof editSite.getEditedPostAttribute === "function") {
        const val = editSite.getEditedPostAttribute("title");
        const str = typeof val === "object" && val !== null ? val.raw || val.rendered || "" : val || "";
        if (typeof str === "string" && str.trim()) return str.trim();
      }
    }

    // 3. Check core store (entity records)
    const core = wpData.select?.("core");
    if (core && typeof core.getEditedEntityRecord === "function") {
      const postId = editor?.getCurrentPostId?.() || editSite?.getCurrentPostId?.();
      const postType = editor?.getCurrentPostType?.() || editSite?.getCurrentPostType?.() || "post";
      if (postId) {
        const record = core.getEditedEntityRecord("postType", postType, postId);
        if (record) {
          const val = record.title;
          const str = typeof val === "object" && val !== null ? val.raw || val.rendered || "" : val || "";
          if (typeof str === "string" && str.trim()) return str.trim();
        }
      }
    }
  } catch (e) {
    console.warn("[Korekthor] Error querying title from data store:", e);
  }
  return "";
};

const getTitleFromDom = (): { text: string; element: HTMLElement | null } => {
  const docs = getAllDocuments();
  const selectors = [
    "textarea.editor-post-title__input",
    "input.editor-post-title__input",
    ".editor-post-title__input",
    "[data-type='core/post-title'] [contenteditable='true']",
    "[data-type='core/post-title'] h1",
    "[data-type='core/post-title'] h2",
    "[data-type='core/post-title']",
    ".wp-block-post-title[contenteditable='true']",
    ".wp-block-post-title",
    "h1[role='textbox']",
    "[role='textbox'][aria-label*='title' i]",
    "[role='textbox'][aria-label*='titulek' i]",
    "[role='textbox'][aria-label*='název' i]",
    "[role='textbox'][aria-label*='záhlaví' i]",
    ".editor-post-title",
    "#post-title-0",
  ];

  for (const doc of docs) {
    for (const sel of selectors) {
      try {
        const el = doc.querySelector(sel) as HTMLElement | null;
        if (el) {
          let text = "";
          if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
            text = el.value || "";
          } else {
            text = el.innerText || el.textContent || "";
          }
          if (text.trim()) {
            return { text: text.trim(), element: el };
          }
        }
      } catch (e) {}
    }
  }

  for (const doc of docs) {
    for (const sel of selectors) {
      try {
        const el = doc.querySelector(sel) as HTMLElement | null;
        if (el) return { text: "", element: el };
      } catch (e) {}
    }
  }

  return { text: "", element: null };
};

const getExcerptFromData = (): string => {
  try {
    const wpData = (window as any).wp?.data || { select };
    const editor = wpData.select?.("core/editor");
    if (editor && typeof editor.getEditedPostAttribute === "function") {
      const val = editor.getEditedPostAttribute("excerpt");
      const str = typeof val === "object" && val !== null ? val.raw || val.rendered || "" : val || "";
      if (typeof str === "string" && str.trim()) return str.trim();
    }
    if (editor && typeof editor.getCurrentPost === "function") {
      const post = editor.getCurrentPost();
      if (post?.excerpt) {
        const val = post.excerpt;
        const str = typeof val === "object" && val !== null ? val.raw || val.rendered || "" : val || "";
        if (typeof str === "string" && str.trim()) return str.trim();
      }
    }
  } catch (e) {}
  return "";
};

const getExcerptFromDom = (): { text: string; element: HTMLElement | null } => {
  const docs = getAllDocuments();
  const selectors = [
    "[data-type='core/post-excerpt'] [contenteditable='true']",
    "[data-type='core/post-excerpt'] textarea",
    "[data-type='core/post-excerpt']",
    ".wp-block-post-excerpt",
    ".editor-post-excerpt textarea",
    "textarea#post-excerpt",
    ".editor-post-excerpt__textarea",
    ".perex",
    ".is-style-perex",
    ".lead",
    ".is-style-lead",
  ];

  for (const doc of docs) {
    for (const sel of selectors) {
      try {
        const el = doc.querySelector(sel) as HTMLElement | null;
        if (el) {
          let text = "";
          if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
            text = el.value || "";
          } else {
            text = el.innerText || el.textContent || "";
          }
          if (text.trim()) return { text: text.trim(), element: el };
        }
      } catch (e) {}
    }
  }

  for (const doc of docs) {
    for (const sel of selectors) {
      try {
        const el = doc.querySelector(sel) as HTMLElement | null;
        if (el) return { text: "", element: el };
      } catch (e) {}
    }
  }

  return { text: "", element: null };
};

export const KorekthorPlugin = () => {
  const [loading, setLoading] = React.useState(false);
  const [parts, setParts] = React.useState<PartsMap | null>(null);
  const [enabledDictionaries, setEnabledDictionaries] = React.useState([] as string[]);
  const [error, setError] = React.useState("");

  const { storeTitle, storeExcerpt, postId, postType } = useSelect((selectFn) => {
    const editor = selectFn("core/editor") as any;
    const core = selectFn("core") as any;
    let title = "";
    let excerpt = "";
    let pId = null;
    let pType = "post";

    if (editor) {
      if (typeof editor.getEditedPostAttribute === "function") {
        const t = editor.getEditedPostAttribute("title");
        title = typeof t === "object" && t !== null ? t.raw || t.rendered || "" : t || "";
        const ex = editor.getEditedPostAttribute("excerpt");
        excerpt = typeof ex === "object" && ex !== null ? ex.raw || ex.rendered || "" : ex || "";
      }
      if (!title && typeof editor.getCurrentPost === "function") {
        const p = editor.getCurrentPost();
        if (p) {
          title = typeof p.title === "object" && p.title !== null ? p.title.raw || p.title.rendered || "" : p.title || "";
          excerpt = typeof p.excerpt === "object" && p.excerpt !== null ? p.excerpt.raw || p.excerpt.rendered || "" : p.excerpt || "";
        }
      }
      if (typeof editor.getCurrentPostId === "function") pId = editor.getCurrentPostId();
      if (typeof editor.getCurrentPostType === "function") pType = editor.getCurrentPostType();
    }

    if (!title && core && pId && pType) {
      if (typeof core.getEditedEntityRecord === "function") {
        const rec = core.getEditedEntityRecord("postType", pType, pId);
        if (rec) {
          title = typeof rec.title === "object" && rec.title !== null ? rec.title.raw || rec.title.rendered || "" : rec.title || "";
          excerpt = typeof rec.excerpt === "object" && rec.excerpt !== null ? rec.excerpt.raw || rec.excerpt.rendered || "" : rec.excerpt || "";
        }
      }
    }

    return {
      storeTitle: typeof title === "string" ? title.trim() : "",
      storeExcerpt: typeof excerpt === "string" ? excerpt.trim() : "",
      postId: pId,
      postType: pType,
    };
  }, []);

  const selectedBlock = useSelect((selectFn) => {
    const { getSelectedBlock } = selectFn("core/block-editor") as any;
    return getSelectedBlock ? getSelectedBlock() : null;
  }, []);

  const getTitleInfo = () => {
    if (storeTitle) {
      const dom = getTitleFromDom();
      return { text: storeTitle, element: dom.element };
    }

    const dataTitle = getTitleFromData();
    if (dataTitle) {
      const dom = getTitleFromDom();
      return { text: dataTitle, element: dom.element };
    }

    const dom = getTitleFromDom();
    return { text: dom.text, element: dom.element };
  };

  const getPerexInfo = () => {
    if (storeExcerpt) {
      const dom = getExcerptFromDom();
      return { text: storeExcerpt, element: dom.element };
    }

    const dataExcerpt = getExcerptFromData();
    if (dataExcerpt) {
      const dom = getExcerptFromDom();
      return { text: dataExcerpt, element: dom.element };
    }

    const dom = getExcerptFromDom();
    return { text: dom.text, element: dom.element };
  };

  const getTextInfo = () => {
    const docs = getAllDocuments();
    let textElement: HTMLElement | null = null;
    let text = "";

    if (
      selectedBlock?.clientId &&
      selectedBlock.name !== "core/post-title" &&
      selectedBlock.name !== "core/post-excerpt"
    ) {
      const query = `[data-block="${selectedBlock.clientId}"]`;
      for (const doc of docs) {
        textElement = doc.querySelector(query) as HTMLElement | null;
        if (textElement) {
          text = textElement.textContent || "";
          break;
        }
      }
    }

    if (!text) {
      const containerSelectors = [
        ".is-root-container",
        ".block-editor-block-list__layout",
        ".editor-styles-wrapper",
      ];
      for (const doc of docs) {
        for (const sel of containerSelectors) {
          const el = doc.querySelector(sel) as HTMLElement | null;
          if (el && el.textContent?.trim()) {
            textElement = el;
            text = el.textContent || "";
            break;
          }
        }
        if (text) break;
      }
    }

    return { text: text.trim(), element: textElement };
  };

  const applyTitleChange = (newTitle: string) => {
    console.log("[Korekthor] Applying title change:", newTitle);

    // 1. Redux store (core/editor)
    try {
      const editorDispatch = (dispatch("core/editor") as any) || (dispatch("core") as any);
      if (editorDispatch?.editPost) {
        editorDispatch.editPost({ title: newTitle });
      }
    } catch (e) {
      console.warn("[Korekthor] editPost error:", e);
    }

    // 2. Core entity record
    try {
      const coreDispatch = dispatch("core") as any;
      if (coreDispatch?.editEntityRecord && postId && postType) {
        coreDispatch.editEntityRecord("postType", postType, postId, { title: newTitle });
      }
    } catch (e) {}

    // 3. Block attributes if core/post-title block exists
    try {
      const blockSelect = select("core/block-editor") as any;
      const blockDispatch = dispatch("core/block-editor") as any;
      if (blockSelect?.getBlocks && blockDispatch?.updateBlockAttributes) {
        const findTitleBlock = (blocks: any[]): any => {
          for (const b of blocks) {
            if (b.name === "core/post-title") return b;
            if (b.innerBlocks?.length) {
              const f = findTitleBlock(b.innerBlocks);
              if (f) return f;
            }
          }
          return null;
        };
        const titleBlock = findTitleBlock(blockSelect.getBlocks());
        if (titleBlock) {
          blockDispatch.updateBlockAttributes(titleBlock.clientId, { content: newTitle });
        }
      }
    } catch (e) {}

    // 4. Update DOM element
    const domInfo = getTitleFromDom();
    const titleElement = domInfo.element;
    if (titleElement) {
      const win = (titleElement.ownerDocument && titleElement.ownerDocument.defaultView) || window;
      if (titleElement instanceof win.HTMLTextAreaElement || titleElement instanceof win.HTMLInputElement) {
        const proto = titleElement instanceof win.HTMLTextAreaElement ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        if (nativeSetter) {
          nativeSetter.call(titleElement, newTitle);
        } else {
          (titleElement as any).value = newTitle;
        }
      } else {
        titleElement.textContent = newTitle;
        titleElement.innerText = newTitle;
      }
      try {
        titleElement.dispatchEvent(new win.Event("input", { bubbles: true, cancelable: true }));
        titleElement.dispatchEvent(new win.Event("change", { bubbles: true, cancelable: true }));
      } catch (e) {}
    }
  };

  const applyPerexChange = (newPerex: string) => {
    console.log("[Korekthor] Applying perex change:", newPerex);

    // 1. Redux store
    try {
      const editorDispatch = (dispatch("core/editor") as any) || (dispatch("core") as any);
      if (editorDispatch?.editPost) {
        editorDispatch.editPost({ excerpt: newPerex });
      }
    } catch (e) {}

    // 2. Core entity record
    try {
      const coreDispatch = dispatch("core") as any;
      if (coreDispatch?.editEntityRecord && postId && postType) {
        coreDispatch.editEntityRecord("postType", postType, postId, { excerpt: newPerex });
      }
    } catch (e) {}

    // 3. Block attributes
    try {
      const blockSelect = select("core/block-editor") as any;
      const blockDispatch = dispatch("core/block-editor") as any;
      if (blockSelect?.getBlocks && blockDispatch?.updateBlockAttributes) {
        const findExcerptBlock = (blocks: any[]): any => {
          for (const b of blocks) {
            if (b.name === "core/post-excerpt") return b;
            if (b.innerBlocks?.length) {
              const f = findExcerptBlock(b.innerBlocks);
              if (f) return f;
            }
          }
          return null;
        };
        const excerptBlock = findExcerptBlock(blockSelect.getBlocks());
        if (excerptBlock) {
          blockDispatch.updateBlockAttributes(excerptBlock.clientId, { content: newPerex });
        }
      }
    } catch (e) {}

    // 4. Update DOM element
    const domInfo = getExcerptFromDom();
    const perexElement = domInfo.element;
    if (perexElement) {
      const win = (perexElement.ownerDocument && perexElement.ownerDocument.defaultView) || window;
      if (perexElement instanceof win.HTMLTextAreaElement || perexElement instanceof win.HTMLInputElement) {
        const proto = perexElement instanceof win.HTMLTextAreaElement ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
        if (nativeSetter) {
          nativeSetter.call(perexElement, newPerex);
        } else {
          (perexElement as any).value = newPerex;
        }
      } else {
        perexElement.textContent = newPerex;
        perexElement.innerText = newPerex;
      }
      try {
        perexElement.dispatchEvent(new win.Event("input", { bubbles: true, cancelable: true }));
        perexElement.dispatchEvent(new win.Event("change", { bubbles: true, cancelable: true }));
      } catch (e) {}
    }
  };

  const updatePart = (
    key: "title" | "perex" | "text",
    mistakes: ObjectElement[],
    acceptAll: () => void,
    rejectAll: () => void
  ) => {
    setParts((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          mistakes,
          acceptAll,
          rejectAll,
        },
      };
    });
  };

  const createPartManager = (
    key: "title" | "perex",
    initialText: string,
    rawErrors: any[],
    onApplyChange: (newText: string) => void,
    targetElement?: HTMLElement | null
  ) => {
    let currentText = initialText;
    let currentErrors = [...rawErrors];

    const buildElements = (errors: any[]): ObjectElement[] => {
      return errors.map((err) => ({
        error: err,
        underlines: [],
        range: null,
        parent: [],
        element: null,
        sendParent: () => {},
        setParent: () => {},
        highlight: () => {
          if (targetElement) {
            targetElement.style.outline = "2px dashed #e74c3c";
            targetElement.style.outlineOffset = "3px";
          }
        },
        unhighlight: () => {
          if (targetElement) {
            targetElement.style.outline = "";
            targetElement.style.outlineOffset = "";
          }
        },
        accept: () => {
          currentText = replaceFirstOccurrence(currentText, err.token, err.result);
          currentErrors = currentErrors.filter((e) => e.id !== err.id);
          onApplyChange(currentText);
          const next = buildElements(currentErrors);
          updatePart(key, next, acceptAll, rejectAll);
        },
        reject: () => {
          currentErrors = currentErrors.filter((e) => e.id !== err.id);
          const next = buildElements(currentErrors);
          updatePart(key, next, acceptAll, rejectAll);
        },
      })) as ObjectElement[];
    };

    const acceptAll = () => {
      currentErrors.forEach((err) => {
        currentText = replaceFirstOccurrence(currentText, err.token, err.result);
      });
      currentErrors = [];
      onApplyChange(currentText);
      updatePart(key, [], acceptAll, rejectAll);
    };

    const rejectAll = () => {
      currentErrors = [];
      updatePart(key, [], acceptAll, rejectAll);
    };

    return {
      elements: buildElements(currentErrors),
      acceptAll,
      rejectAll,
    };
  };

  const handleCorrection = async () => {
    (dispatch("core/edit-post") as any).openGeneralSidebar("korekthor/korekthor-sidebar");

    setLoading(true);
    setError("");

    const titleInfo = getTitleInfo();
    const perexInfo = getPerexInfo();
    const textInfo = getTextInfo();

    console.log("[Korekthor] Kontrola příspěvku:", {
      titulek: titleInfo.text,
      titulekElement: titleInfo.element,
      perex: perexInfo.text,
      perexElement: perexInfo.element,
      textDelka: textInfo.text.length,
      textElement: textInfo.element,
    });

    if (!titleInfo.text && !perexInfo.text && !textInfo.text) {
      setError("Nebyl nalezen žádný text ke kontrole.");
      setLoading(false);
      return;
    }

    const callApi = (text: string) =>
      new Promise<any>((resolve) => {
        if (!text) {
          resolve({ data: { data: [] } });
          return;
        }
        $.post(ajaxurl, {
          nonce: korekthor_ajax.nonce,
          action: "korekthor_correction",
          contentType: "application/x-www-form-urlencoded;charset=utf-8",
          text: text,
          dictionaries: enabledDictionaries,
        })
          .done((res: any) => resolve(res))
          .fail(() => resolve({ error: "Chyba při komunikaci se serverem." }));
      });

    try {
      const [titleRes, perexRes, textRes] = await Promise.all([
        callApi(titleInfo.text),
        callApi(perexInfo.text),
        callApi(textInfo.text),
      ]);

      if (titleRes?.error || perexRes?.error || textRes?.error) {
        setError(titleRes?.error || perexRes?.error || textRes?.error);
        setLoading(false);
        return;
      }

      const titleErrors = parseApiErrors(titleRes?.data?.data || []);
      const titleManager = createPartManager(
        "title",
        titleInfo.text,
        titleErrors,
        applyTitleChange,
        titleInfo.element
      );

      const perexErrors = parseApiErrors(perexRes?.data?.data || []);
      const perexManager = createPartManager(
        "perex",
        perexInfo.text,
        perexErrors,
        applyPerexChange,
        perexInfo.element
      );

      const newParts: PartsMap = {
        title: {
          label: "Titulek",
          mistakes: titleManager.elements,
          acceptAll: titleManager.acceptAll,
          rejectAll: titleManager.rejectAll,
          checked: true,
        },
        perex: {
          label: "Perex",
          mistakes: perexManager.elements,
          acceptAll: perexManager.acceptAll,
          rejectAll: perexManager.rejectAll,
          checked: !!perexInfo.text,
        },
        text: {
          label: "Text",
          mistakes: [],
          acceptAll: () => {},
          rejectAll: () => {},
          checked: true,
        },
      };

      setParts(newParts);

      // Handle Text with Jakub's runHighlight
      if (textInfo.element && textRes?.data?.data) {
        runHighlight(textInfo.element, textRes.data.data, (mistakes: ObjectElement[], acceptAll: () => void, rejectAll: () => void) => {
          updatePart("text", mistakes, acceptAll, rejectAll);
        });
      }

      setLoading(false);
    } catch (e: any) {
      setError(e?.message || "Došlo k chybě při kontrole.");
      setLoading(false);
    }
  };

  const sections: MistakeSection[] = parts
    ? [
        {
          id: "title",
          label: "Titulek",
          mistakes: parts.title.mistakes,
          acceptAll: parts.title.acceptAll,
          rejectAll: parts.title.rejectAll,
        },
        {
          id: "perex",
          label: "Perex",
          mistakes: parts.perex.mistakes,
          acceptAll: parts.perex.acceptAll,
          rejectAll: parts.perex.rejectAll,
        },
        {
          id: "text",
          label: "Text",
          mistakes: parts.text.mistakes,
          acceptAll: parts.text.acceptAll,
          rejectAll: parts.text.rejectAll,
        },
      ].filter((section) => section.mistakes.length > 0)
    : [];

  const totalMistakes = sections.reduce((sum, s) => sum + s.mistakes.length, 0);

  const handleAcceptAllGlobal = () => {
    if (parts?.title.acceptAll) parts.title.acceptAll();
    if (parts?.perex.acceptAll) parts.perex.acceptAll();
    if (parts?.text.acceptAll) parts.text.acceptAll();
  };

  const handleRejectAllGlobal = () => {
    if (parts?.title.rejectAll) parts.title.rejectAll();
    if (parts?.perex.rejectAll) parts.perex.rejectAll();
    if (parts?.text.rejectAll) parts.text.rejectAll();
  };

  return (
    <>
      <PluginSidebarMoreMenuItem target="korekthor-sidebar" icon={<KorekthorIcon />}>
        Korekthor
      </PluginSidebarMoreMenuItem>
      <PluginSidebar name="korekthor-sidebar" title="Korekthor" className="korekthor-sidebar" icon={<KorekthorIcon />}>
        <div className="korekthor-sidebar-plugin">
          {loading ? (
            <StatusLoading />
          ) : parts === null ? (
            <StatusNone onCheck={handleCorrection} />
          ) : error ? (
            <StatusError error={error} />
          ) : totalMistakes > 0 ? (
            <MistakeList
              sections={sections}
              acceptAllGlobal={handleAcceptAllGlobal}
              rejectAllGlobal={handleRejectAllGlobal}
              onRecheck={handleCorrection}
            />
          ) : (
            <StatusOk onRecheck={handleCorrection} />
          )}
        </div>

        <DictionarySelect onDictionariesChange={setEnabledDictionaries} />
      </PluginSidebar>

      <KorekthorToolbarButton onClick={handleCorrection} />

      <RichTextToolbarButton icon={<KorekthorIcon />} title="Opravit text" onClick={handleCorrection} />
    </>
  );
};
