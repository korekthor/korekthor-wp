class KorekthorMain extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
  }

  appendTo = function (element) {
    this._shadow.appendChild(element);
  };
}

class Block {
  constructor(type, content, node, parent) {
    this.type = type;
    this.content = content;
    this.node = node;
    this.parent = parent;
  }
}

export class ObjectElement {
  constructor(error, underlines, range, parent, element, sendParent, setParent) {
    this.error = error;
    this.underlines = underlines;
    this.range = range;
    this.parent = parent;
    this.element = element;
    this.sendParent = sendParent;
    this.setParent = setParent;
  }

  accept() {
    const underlineContainer = this.underlines[0].parentElement;
    const elementWindow = underlineContainer.ownerDocument.defaultView;

    underlineContainer.innerHTML = "";

    this.range.deleteContents();
    this.range.insertNode(underlineContainer.ownerDocument.createTextNode(this.error.result.replaceAll("&nbsp;", " ")));

    const evn = new Event("input", {
      bubbles: true,
      cancelable: true,
      view: elementWindow,
    });
    this.element.dispatchEvent(evn);

    const newParent = [];
    this.parent.forEach((object) => {
      if (object[0].id === this.error.id) return;

      if (object[2].collapsed) {
        const [underlines, range] = setupError(object[0], this.element, underlineContainer, elementWindow, false);
        newParent.push([object[0], underlines, range]);
      } else {
        const underlines = fromRangeToUnderline(object[2], object[0].id, underlineContainer, false);
        newParent.push([object[0], underlines, object[2]]);
      }
    });

    this.setParent(newParent);
    this.sendParent(...makeReturnObject(newParent, this.element, this.root, this.sendParent, this.setParent));
  }

  reject() {
    const newParent = this.parent.filter((el) => el[0].id !== this.error.id);

    this.setParent(newParent);
    this.sendParent(...makeReturnObject(newParent, this.element, this.root, this.sendParent, this.setParent));

    const underlineContainer = this.underlines[0].parentElement;
    const toDelete = underlineContainer.querySelectorAll(`*[data-id='${this.error.id}']`);

    for (const underline of toDelete) {
      underlineContainer.removeChild(underline);
    }
  }

  highlight() {
    this.underlines.forEach((el) => {
      el.classList.add("underline-highlight");
    });
  }

  unhighlight() {
    this.underlines.forEach((el) => {
      el.classList.remove("underline-highlight");
    });
  }
}

window.customElements.define("korekthor-underlines", KorekthorMain);

function defineRoot(textElement) {
  const root = document.createElement("korekthor-underlines");
  root.style.width = 0;
  root.style.height = 0;
  root.style.position = "relative";
  root.style.display = "none";

  textElement.parentElement.insertBefore(root, textElement);

  const linkStyle = document.createElement("link");
  linkStyle.setAttribute("rel", "stylesheet");
  // linkStyle.setAttribute("href", "http://127.0.0.1:5500/main/style.css");
  linkStyle.setAttribute("href", korekthor_ajax.plugin_url + "/css/highlight.css");

  root.appendTo(linkStyle);

  return root;
}

function setDimensions(from, to, elementWindow) {
  const styles = elementWindow.getComputedStyle(from);

  const width = from.clientWidth;
  const height = from.clientHeight;
  const top = from.clientTop + parseFloat(styles.marginTop);
  const left = from.clientLeft + parseFloat(styles.marginLeft);

  to.style.width = width + "px";
  to.style.height = height + "px";
  to.style.left = left + "px";
  to.style.top = top + "px";
}

function handleScroll(textElement, underlineContainer) {
  let oldY = textElement.scrollTop;
  let oldX = textElement.scrollLeft;

  textElement.addEventListener("scroll", (e) => {
    const Y = textElement.scrollTop;
    const X = textElement.scrollLeft;

    const windowRect = underlineContainer.parentElement.getBoundingClientRect();
    const containerRect = underlineContainer.getBoundingClientRect();

    const top = containerRect.top - windowRect.top;
    const left = containerRect.left - windowRect.left;

    if (oldY < Y) {
      underlineContainer.style.top = top - (Y - oldY) + "px";
    } else {
      underlineContainer.style.top = top + (oldY - Y) + "px";
    }

    if (oldX < X) {
      underlineContainer.style.left = left - (X - oldX) + "px";
    } else {
      underlineContainer.style.left = left + (oldX - X) + "px";
    }

    oldX = X;
    oldY = Y;
  });
}

function setup(element, underlineObjects, elementWindow) {
  const root = defineRoot(element);
  setTimeout(() => (root.style.display = "block"), 500);

  const underlineWindow = document.createElement("div");
  underlineWindow.className = "window";

  setDimensions(element, underlineWindow, elementWindow);

  root.shadowRoot.appendChild(underlineWindow);

  const underlineContainer = document.createElement("div");
  underlineContainer.className = "underline-container";

  underlineWindow.appendChild(underlineContainer);

  handleScroll(element, underlineContainer);

  console.log("setup");
  return [element, underlineWindow, underlineContainer, root.shadowRoot];
}

function getErrors(data) {
  const wordsWithErrors = [];
  let errors = [];
  let unknown_word = ''
  let shifted = 0;
  let oneToken = "";
  let oneResult = "";

  let connect_to_token = false;
  let connect_to_result = false;

  let index = -1;
  data.flat().forEach((wordData, indexWord) => {
    wordData.errors.forEach((error) => {
      errors.push(error.type);
      if (error.type === 'NEZNAME_SLOVO') unknown_word = error.result
    });

    const token = wordData.original_token.token;
    const result = wordData.result;
    const wordCount = token.trim().split(" ").length;

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

    if (!token_con && !result_con && errors.length > 0) {
      wordsWithErrors.push({
        index: index - shifted,
        token: oneToken.trim(),
        result: oneResult.trim(),
        error: errors,
        unknown_word: unknown_word,
        id: Math.random().toString(36).slice(2, 7),
      });
      errors = [];
      unknown_word = ''
    }
    if (!token_con && !result_con) {
      oneToken = "";
      oneResult = "";
    }

    connect_to_token = token_con;
    connect_to_result = result_con;
  });

  return wordsWithErrors;
}

function setupError(error, mainElement, underlineContainer, elementWindow, animate) {
  const [node, offset] = getNode(error.index, mainElement, elementWindow);
  if (!node) return console.log("ERROR: not able to find node");

  let count = 0;
  error.token.split(" ").forEach((word) => {
    count += getCount(word);
  });

  return createUnderline(offset, node, underlineContainer, count, error.id, elementWindow, animate);
}

function getNode(index, original, elementWindow) {
  const data = getBlocks(original, elementWindow);

  const sym = [" ", "\n", " "];
  let block_index = 0;
  let word_count = -1;
  let node = null;
  let offset = 0;
  let block_end_space = null;
  let in_word = !sym.includes(data[0].content[0]);

  let lastParent = null;
  while (block_index < data.length && node === null) {
    const text = data[block_index].content.replaceAll("&nbsp;", " ").split("");

    let token_index = 0;
    let all_sym_before = true;
    const previousSibling =
      data[block_index].node.previousSibling || data[block_index].node.parentElement.previousSibling;

      if ((lastParent !== data[block_index].parent
        || previousSibling?.nodeName === 'BR'
        || previousSibling?.nodeName === 'TD'
        || data[block_index].node.parentElement.tagName === 'TD'
        || previousSibling?.nodeName === 'TH'
        || data[block_index].node.parentElement.tagName === 'TH'
        || data[block_index].parent.tagName === 'OL'
        || data[block_index].parent.tagName === 'UL') 
        && in_word && block_index !== 0) {
            in_word = false
            ++word_count
        }

    lastParent = data[block_index].parent;

    while (token_index < text.length && node === null) {
      const token = text[token_index];
      const last = token_index === text.length - 1 && block_index === data.length - 1;
      if ((sym.includes(token) && in_word) || last) {
        in_word = false;
        ++word_count;
      }

      if (!sym.includes(token) && !in_word) {
        in_word = true;
      }

      if (word_count === index) {
        if (all_sym_before && !block_end_space && block_index !== 0) {
          node = data[block_index - 1];
          const len = data[block_index - 1].content.length;
          offset = len;
        } else {
          node = data[block_index];
          offset = last ? token_index + 1 : token_index;
        }
      }

      if (!sym.includes(token)) all_sym_before = false;
      ++token_index;
    }

    block_end_space = text[text.length - 1] === " ";
    ++block_index;
  }
  return [node ? node.node : null, offset];
}

const display = ['block', 'table-cell']

function getBlocks(element, elementWindow) {
  let data = [new Block(1, element, null, null)]
  let areChilds = true

  while (areChilds) {
      areChilds = false
      let newData = []

      let indexBlock = 0
      for (const oneBlock of data) {
          
          if (oneBlock.type === 1) {
              const parent = oneBlock.content
              const childElements = parent.children
              const childNodes = parent.childNodes
              let skipped = 0
              
              childNodes.forEach((node, indexNode) => {
                  let parentBlock = oneBlock.parent

                  if (display.includes(window.getComputedStyle(parent).display)) parentBlock = parent

                  if (node.nodeType === 1) {
                      areChilds = true
                      const element = childElements[indexNode - skipped]
              
                      newData.push(new Block(1 ,element, null, parentBlock))
              
                  }
                  else if (node.nodeType === 3 && node.data !== undefined) {
                      ++skipped
                      newData.push(new Block(2, node.data, node, parentBlock))
                  }
                  else {
                      
                      ++skipped
                  }
              })
          } else if (oneBlock.type === 2) newData.push(oneBlock)
          
          ++indexBlock
      }

      data = newData
  }
  data = data.filter(el => el.type === 2)
  return data
}

function fromRangeToUnderline(range, id, container, animate = false) {
  const rects = range.getClientRects();
  const containerRect = container.getBoundingClientRect();

  const underlines = [];

  for (const rect of rects) {
    const underline = document.createElement("div");
    underline.classList = animate ? "underline underline-animate" : "underline";
    underline.style.width = rect.width + "px";
    underline.style.maxWidth = rect.width + "px";
    underline.style.height = rect.height + "px";
    underline.style.left = rect.left - containerRect.left + "px";
    underline.style.top = rect.top - containerRect.top + "px";
    underline.setAttribute("data-id", id);

    container.appendChild(underline);
    underlines.push(underline);
  }

  return underlines;
}

function createUnderline(offset, node, underlineContainer, count, id, elementWindow, animate) {
  const sel = elementWindow.getSelection();

  // word press needs the same thing twice to do something
  sel.collapse(node, offset);
  sel.collapse(node, offset);

  for (let i = 0; i < count; ++i) {
    sel.modify("extend", "backward", "word");
  }
  const edit_range = sel.getRangeAt(0);
  const underlines = fromRangeToUnderline(edit_range, id, underlineContainer, animate);

  sel.removeAllRanges();
  return [underlines, edit_range];
}

const perex = ['k', 'h', 'da', 'd', 'c', 'm', 'μ', 'p', 'f', 'a', 'z', 'y', 'g', 't', 'e', '']
const units = ['m', 'g', 's', 'a', 'k', 'mol', 'cd', 'l', 'w', 'h', 'hz']

const allUnits = units.map(el => perex.map(unit => unit + el)).flat()

function getCount(word) {
  let count = 0
  let create_new = false
  const inter = ['?', ',', '!', ':', '-', '(', ')', '[', ']', '{', '}', '#', '"', '*', '>', '<', ';', '…', '/', '–', '@', '%', '.', '“', '„']
  const inter_big = inter + ['°', '˚', '+', '=']
  
  const numInWord = word.match(/\d+([.,]\d+)?/)?.at(0)
  
  if (numInWord?.includes('.') || numInWord?.includes(',')) {
      count += 1
      word = word.replace(numInWord, '')
      if (allUnits.includes(word)) return count
  }
      
  const splitWord = word.replaceAll('&nbsp;', ' ').split('')
  splitWord.forEach((el, i) => {
      if (create_new || i === 0 || inter_big.includes(el)) {
          if (i !== 0) {
              if (!inter.includes(splitWord[i -1]) || !inter_big.includes(el)) ++count
          } else ++count
      } 
      create_new = inter_big.includes(el)
  })
  return count
}

function makeReturnObject(obj, element, root, sendObj, setObj) {
  const objects = obj.map((el) => {
    return new ObjectElement(el[0], el[1], el[2], obj, element, sendObj, setObj);
  });

  function correct_all() {
    const element = objects[0];
    const underlineContainer = element.underlines[0].parentElement;
    const elementWindow = underlineContainer.ownerDocument.defaultView;

    underlineContainer.innerHTML = "";

    objects.forEach((el) => {
      el.range.deleteContents();
      el.range.insertNode(underlineContainer.ownerDocument.createTextNode(el.error.result.replaceAll("&nbsp;", " ")));
    });

    const evn = new Event("input", {
      bubbles: true,
      cancelable: true,
      view: elementWindow,
    });
    element.element.dispatchEvent(evn);

    element.setParent([]);
    element.sendParent(...makeReturnObject([], element.element, element.root, element.sendParent, element.setParent));
  }

  function reject_all() {
    const element = objects[0];
    const underlineContainer = element.underlines[0].parentElement;

    underlineContainer.innerHTML = "";

    element.setParent([]);
    element.sendParent(...makeReturnObject([], element.element, element.root, element.sendParent, element.setParent));
  }

  return [objects, correct_all, reject_all];
}

const processed_elements = [];

/**
 * @param {Element} element
 */

export function getText(element) {
  const blocks = getBlocks(element, window)
  let text = ''
  let lastParent = null
  
  blocks.forEach((block) => { 
    const nextSibling = block.node.nextSibling || block.node.parentElement.nextSibling
    
    if ((lastParent !== block.parent && lastParent !== null)
    || nextSibling?.nodeName === 'BR'
    || nextSibling?.nodeName === 'TH'
    || nextSibling?.nodeName === 'TD'
    || block.parent.tagName === 'OL'
    || block.parent.tagName === 'UL')  {
        text += '\n' + block.content + '\n'
    } else text += block.content
        
    lastParent = block.parent
  })

  text = text.replaceAll(' ', ' ').replace(/ +/g, ' ').trim()
  return text
}

export function runHighlight(element, content, sendObj) {
  const elementWindow = element.ownerDocument.defaultView;

  let underlineObjects = [];

  const setObj = (obj) => (underlineObjects = obj);

  let founded_processed_element = processed_elements.find((el) => el[0] === element);

  processed_elements.forEach((el) => {
    if (el[0] !== element) el[2].innerHTML = "";
  });

  if (founded_processed_element === undefined) {
    founded_processed_element = setup(element, underlineObjects, elementWindow);
    processed_elements.push(founded_processed_element);

    let first = true;

    const roEl = new ResizeObserver((entry) => {
      if (!first) {
        setDimensions(element, underlineWindow, elementWindow);
        const rectTextElement = element.getBoundingClientRect();
        const rectUnderlineWindow = underlineWindow.getBoundingClientRect();
        const topWindow = parseInt(elementWindow.getComputedStyle(underlineWindow).top);
        const leftWindow = parseInt(elementWindow.getComputedStyle(underlineWindow).left);

        underlineWindow.style.top = rectTextElement.y - rectUnderlineWindow.y + topWindow + "px";
        underlineWindow.style.left = rectTextElement.x - rectUnderlineWindow.x + leftWindow + "px";
      }
      first = false;

      underlineContainer.innerHTML = "";

      const newUnderlineObjects = [];

      underlineObjects.forEach((object) => {
        const underlines = fromRangeToUnderline(object[2], object[0].id, underlineContainer, false);
        newUnderlineObjects.push([object[0], underlines, object[2]]);
      });

      underlineObjects = newUnderlineObjects;
      sendObj(...makeReturnObject(underlineObjects, element, root, sendObj, setObj));
    });

    roEl.observe(element);
  }

  const underlineWindow = founded_processed_element[1];
  const underlineContainer = founded_processed_element[2];
  const root = founded_processed_element[3];

  const ro = new ResizeObserver((entry) => {
    const rect = underlineContainer.getBoundingClientRect();
    if (rect.width !== 0) {
      ro.disconnect();

      const errors = getErrors(content);
      underlineObjects = [];
      underlineContainer.innerHTML = "";

      const focused = document.activeElement === element;

      const rectTextElement = element.getBoundingClientRect();
      const rectUnderlineWindow = underlineWindow.getBoundingClientRect();
      const topWindow = parseInt(elementWindow.getComputedStyle(underlineWindow).top);
      const leftWindow = parseInt(elementWindow.getComputedStyle(underlineWindow).left);

      underlineWindow.style.top = rectTextElement.y - rectUnderlineWindow.y + topWindow + "px";
      underlineWindow.style.left = rectTextElement.x - rectUnderlineWindow.x + leftWindow + "px";

      errors.forEach((error) => {
        const [underlines, range] = setupError(error, element, underlineContainer, elementWindow, true);
        underlineObjects.push([error, underlines, range]);
      });

      if (!focused) element.blur();

      console.log("done");
      sendObj(...makeReturnObject(underlineObjects, element, root, sendObj, setObj));
    }
  });
  ro.observe(underlineContainer);

  element.addEventListener("input", handleInput);

  let old_text = element.innerText.replace(/\s+/g, " ").trim().split(" ");
  function handleInput(e) {
    if (!e.isTrusted) {
      old_text = element.innerText.replace(/\s+/g, " ").trim().split(" ");
      return;
    }

    let new_text = element.innerText.replace(/\s+/g, " ").trim().split(" ");
    if (old_text.join(' ') === new_text.join(' ')) return

    const rectTextElement = element.getBoundingClientRect();
    const rectUnderlineWindow = underlineWindow.getBoundingClientRect();
    const topWindow = parseInt(elementWindow.getComputedStyle(underlineWindow).top);
    const leftWindow = parseInt(elementWindow.getComputedStyle(underlineWindow).left);

    underlineWindow.style.top = rectTextElement.y - rectUnderlineWindow.y + topWindow + "px";
    underlineWindow.style.left = rectTextElement.x - rectUnderlineWindow.x + leftWindow + "px";

    underlineWindow.style.width = element.clientWidth + "px";
    underlineWindow.style.height = element.clientHeight + "px";

    let same_before = 0;
    for (let index in new_text) {
      index = parseInt(index);
      if (old_text[index] !== new_text[index]) break;
      const token = old_text[index];
      if (token === old_text[index + 1] || token === new_text[index + 1]) {
        break;
      }
      ++same_before;
    }
    new_text.reverse();
    old_text.reverse();

    let same_after = 0;
    for (let index in new_text) {
      index = parseInt(index);
      if (new_text[index] !== old_text[index]) break;
      const token = old_text[index];
      if (token === old_text[index + 1] || token === new_text[index + 1]) break;

      ++same_after;
    }
    let between = old_text.length - (same_after + same_before);
    if (new_text.length - old_text.length + between < 0) between += new_text.length - old_text.length;

    const newUnderlineObjects = [];
    underlineContainer.innerHTML = "";

    const sel = elementWindow.getSelection();
    const allRangesBefore = [];

    for (let i = 0; i < sel.rangeCount; ++i) allRangesBefore.push(sel.getRangeAt(i));
    sel.removeAllRanges();

    underlineObjects.forEach((object) => {
      const error = object[0];
      let index = error.index;

      const token_len = error.token.split(" ").length;

      if (index - (token_len - 1) > same_before + between - 1) {
        if (new_text.length !== old_text.length) index += new_text.length - old_text.length;
      } else if (index > same_before - 1) return;

      error.index = index;
      const [underlines, range] = setupError(error, element, underlineContainer, elementWindow, false);
      newUnderlineObjects.push([error, underlines, range]);
    });
    underlineObjects = newUnderlineObjects;
    sendObj(...makeReturnObject(underlineObjects, element, root, sendObj, setObj));

    allRangesBefore.forEach((ran) => {
      sel.addRange(ran);
    });

    old_text = new_text.reverse();
  }
}
