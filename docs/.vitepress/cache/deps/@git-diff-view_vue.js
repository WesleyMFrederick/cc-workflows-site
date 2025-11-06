import {
  DefaultDiffExpansionStep,
  DiffFile,
  DiffFileLineType,
  DiffHunk,
  DiffHunkExpansionType,
  DiffHunkHeader,
  DiffLine,
  DiffLineType,
  DiffParser,
  File,
  HiddenBidiCharsRegex,
  SplitSide,
  _cacheMap,
  _getAST,
  assertNever,
  changeDefaultComposeLength,
  changeMaxLengthToIgnoreLineDiff,
  checkCurrentLineIsHidden,
  checkDiffLineIncludeChange,
  composeLen,
  defaultTransform,
  diffChanges,
  disableCache,
  escapeHtml,
  getCurrentComposeLength,
  getDiffRange,
  getEnableFastDiffTemplate,
  getFile,
  getHunkHeaderExpansionType,
  getLang,
  getLargestLineNumber,
  getMaxLengthToIgnoreLineDiff,
  getPlainDiffTemplate,
  getPlainDiffTemplateByFastDiff,
  getPlainLineTemplate,
  getSplitContentLines,
  getSplitLines,
  getSyntaxDiffTemplate,
  getSyntaxDiffTemplateByFastDiff,
  getSyntaxLineTemplate,
  getUnifiedContentLine,
  getUnifiedLines,
  highlighter,
  isTransformEnabled,
  numIterator,
  parseInstance,
  processAST,
  processTransformForFile,
  processTransformTemplateContent,
  relativeChanges,
  resetDefaultComposeLength,
  resetEnableFastDiffTemplate,
  resetMaxLengthToIgnoreLineDiff,
  resetTransform,
  setEnableFastDiffTemplate,
  setTransformForFile,
  setTransformForTemplateContent,
  versions
} from "./chunk-AGQJGIUD.js";
import {
  Fragment,
  computed,
  createTextVNode,
  createVNode,
  defineComponent,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
  watchEffect,
  watchPostEffect
} from "./chunk-JAPIL3UL.js";
import "./chunk-ZKAWKZG5.js";

// node_modules/@git-diff-view/vue/dist/vue-git-diff-view.mjs
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (typeof state === "function" ? receiver !== state || true : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return state.set(receiver, value), value;
}
var _TextMeasure_instances;
var _TextMeasure_key;
var _TextMeasure_map;
var _TextMeasure_getInstance;
var canvasCtx = null;
var getKey = (font, text) => {
  return `${font.fontFamily}-${font.fontStyle}-${font.fontSize}-${text}`;
};
var getStableKey = (font, text) => {
  return getKey(font, "0".repeat(text.length));
};
var TextMeasure = class {
  constructor() {
    _TextMeasure_instances.add(this);
    _TextMeasure_key.set(this, "");
    _TextMeasure_map.set(this, {});
  }
  measure(text, font) {
    const currentKey = getStableKey(font, text);
    if (__classPrivateFieldGet(this, _TextMeasure_map, "f")[currentKey]) {
      return __classPrivateFieldGet(this, _TextMeasure_map, "f")[currentKey];
    }
    const instance2 = __classPrivateFieldGet(this, _TextMeasure_instances, "m", _TextMeasure_getInstance).call(this);
    if (font) {
      const currentFontKey = `${font.fontFamily}-${font.fontStyle}-${font.fontSize}`;
      if (__classPrivateFieldGet(this, _TextMeasure_key, "f") !== currentFontKey) {
        __classPrivateFieldSet(this, _TextMeasure_key, currentFontKey);
        instance2.font = `${font.fontStyle || ""} ${font.fontSize || ""} ${font.fontFamily || ""}`;
      }
    } else {
      instance2.font = "";
    }
    const textWidth = instance2.measureText(text).width;
    return textWidth;
  }
};
_TextMeasure_key = /* @__PURE__ */ new WeakMap(), _TextMeasure_map = /* @__PURE__ */ new WeakMap(), _TextMeasure_instances = /* @__PURE__ */ new WeakSet(), _TextMeasure_getInstance = function _TextMeasure_getInstance2() {
  canvasCtx = canvasCtx || document.createElement("canvas").getContext("2d");
  return canvasCtx;
};
var instance = null;
var getTextMeasureInstance = () => {
  instance = instance || new TextMeasure();
  return instance;
};
var addContentBGName = "--diff-add-content--";
var delContentBGName = "--diff-del-content--";
var borderColorName = "--diff-border--";
var addLineNumberBGName = "--diff-add-lineNumber--";
var delLineNumberBGName = "--diff-del-lineNumber--";
var plainContentBGName = "--diff-plain-content--";
var expandContentBGName = "--diff-expand-content--";
var plainLineNumberColorName = "--diff-plain-lineNumber-color--";
var expandLineNumberColorName = "--diff-expand-lineNumber-color--";
var plainLineNumberBGName = "--diff-plain-lineNumber--";
var expandLineNumberBGName = "--diff-expand-lineNumber--";
var hunkContentBGName = "--diff-hunk-content--";
var hunkContentColorName = "--diff-hunk-content-color--";
var hunkLineNumberBGName = "--diff-hunk-lineNumber--";
var addContentHighlightBGName = "--diff-add-content-highlight--";
var delContentHighlightBGName = "--diff-del-content-highlight--";
var addWidgetBGName = "--diff-add-widget--";
var addWidgetColorName = "--diff-add-widget-color--";
var emptyBGName = "--diff-empty-content--";
var getContentBG = (isAdded, isDelete, hasDiff) => {
  return isAdded ? `var(${addContentBGName})` : isDelete ? `var(${delContentBGName})` : hasDiff ? `var(${plainContentBGName})` : `var(${expandContentBGName})`;
};
var getLineNumberBG = (isAdded, isDelete, hasDiff) => {
  return isAdded ? `var(${addLineNumberBGName})` : isDelete ? `var(${delLineNumberBGName})` : hasDiff ? `var(${plainLineNumberBGName})` : `var(${expandLineNumberBGName})`;
};
var removeAllSelection = () => {
  const selection = window.getSelection();
  for (let i = 0; i < selection.rangeCount; i++) {
    selection.removeRange(selection.getRangeAt(i));
  }
};
var syncScroll = (left, right) => {
  const onScroll = function(event) {
    if (event === null || event.target === null)
      return;
    if (event.target === left) {
      right.scrollTop = left.scrollTop;
      right.scrollLeft = left.scrollLeft;
    } else {
      left.scrollTop = right.scrollTop;
      left.scrollLeft = right.scrollLeft;
    }
  };
  if (!left.onscroll) {
    left.onscroll = onScroll;
  }
  if (!right.onscroll) {
    right.onscroll = onScroll;
  }
  return () => {
    left.onscroll = null;
    right.onscroll = null;
  };
};
var getElementRoot = (element) => {
  if (element) {
    const root = element.getRootNode();
    if (root instanceof ShadowRoot) {
      return root;
    }
    return element.ownerDocument;
  }
  return document;
};
var getDiffIdFromElement = (element) => {
  var _a, _b;
  if (element) {
    if (typeof element.closest === "function") {
      const diffRoot = element.closest('[data-component="git-diff-view"]');
      const ele = (_a = diffRoot === null || diffRoot === void 0 ? void 0 : diffRoot.querySelector) === null || _a === void 0 ? void 0 : _a.call(diffRoot, ".diff-view-wrapper");
      return (_b = ele === null || ele === void 0 ? void 0 : ele.getAttribute) === null || _b === void 0 ? void 0 : _b.call(ele, "id");
    } else {
      let el = element;
      while (el) {
        if (el.getAttribute && el.getAttribute("data-component") === "git-diff-view") {
          const ele = el.querySelector(".diff-view-wrapper");
          return ele.getAttribute("id");
        }
        el = el.parentElement;
      }
    }
  }
};
var diffFontSizeName = "--diff-font-size--";
var diffAsideWidthName = "--diff-aside-width--";
var NewLineSymbol;
(function(NewLineSymbol2) {
  NewLineSymbol2[NewLineSymbol2["CRLF"] = 1] = "CRLF";
  NewLineSymbol2[NewLineSymbol2["CR"] = 2] = "CR";
  NewLineSymbol2[NewLineSymbol2["LF"] = 3] = "LF";
  NewLineSymbol2[NewLineSymbol2["NEWLINE"] = 4] = "NEWLINE";
  NewLineSymbol2[NewLineSymbol2["NORMAL"] = 5] = "NORMAL";
  NewLineSymbol2[NewLineSymbol2["NULL"] = 6] = "NULL";
})(NewLineSymbol || (NewLineSymbol = {}));
var getSymbol = (symbol) => {
  switch (symbol) {
    case NewLineSymbol.LF:
      return "␊";
    case NewLineSymbol.CR:
      return "␍";
    case NewLineSymbol.CRLF:
      return "␍␊";
    default:
      return "";
  }
};
var DiffModeEnum;
(function(DiffModeEnum2) {
  DiffModeEnum2[DiffModeEnum2["SplitGitHub"] = 1] = "SplitGitHub";
  DiffModeEnum2[DiffModeEnum2["SplitGitLab"] = 2] = "SplitGitLab";
  DiffModeEnum2[DiffModeEnum2["Split"] = 3] = "Split";
  DiffModeEnum2[DiffModeEnum2["Unified"] = 4] = "Unified";
})(DiffModeEnum || (DiffModeEnum = {}));
var idSymbol = Symbol();
var domSymbol = Symbol();
var mountedSymbol = Symbol();
var modeSymbol = Symbol();
var fontSizeSymbol = Symbol();
var enableWrapSymbol = Symbol();
var enableHighlightSymbol = Symbol();
var enableAddWidgetSymbol = Symbol();
var slotsSymbol = Symbol();
var extendDataSymbol = Symbol();
var onAddWidgetClickSymbol = Symbol();
var widgetStateSymbol = Symbol();
var setWidgetStateSymbol = Symbol();
var useId = () => inject(idSymbol);
var useDom = () => inject(domSymbol);
var useMode = () => inject(modeSymbol);
var useIsMounted$1 = () => inject(mountedSymbol);
var useFontSize = () => inject(fontSizeSymbol);
var useEnableWrap = () => inject(enableWrapSymbol);
var useEnableHighlight = () => inject(enableHighlightSymbol);
var useEnableAddWidget = () => inject(enableAddWidgetSymbol);
var useExtendData = () => inject(extendDataSymbol);
var useOnAddWidgetClick = () => inject(onAddWidgetClickSymbol);
var useSlots = () => inject(slotsSymbol);
var useWidget = () => inject(widgetStateSymbol);
var useSetWidget = () => inject(setWidgetStateSymbol);
var useIsMounted = () => {
  const isMount = ref(false);
  onMounted(() => {
    isMount.value = true;
  });
  return isMount;
};
var useProvide = (props, key, keySymbol, option) => {
  const value = ref((props == null ? void 0 : props[key]) || (option == null ? void 0 : option.defaultValue));
  watch(
    () => props == null ? void 0 : props[key],
    () => {
      value.value = props[key];
    },
    { deep: option == null ? void 0 : option.deepWatch }
  );
  provide(keySymbol, value);
};
var useSubscribeDiffFile = (props, onUpdate) => {
  const initSubscribe = (onClean) => {
    const diffFile = props.diffFile;
    onUpdate(diffFile);
    const clean = diffFile.subscribe(() => onUpdate(diffFile));
    onClean(clean);
  };
  watchEffect(initSubscribe);
};
var useTextWidth = ({
  text,
  font
}) => {
  const isMounted = useIsMounted();
  const fontSize = parseInt(font.value.fontSize);
  let baseSize = 6;
  baseSize += fontSize > 10 ? (fontSize - 10) * 0.6 : 0;
  const width = ref(baseSize * text.value.length);
  const measureText = () => {
    if (!isMounted.value) return;
    width.value = getTextMeasureInstance().measure(text.value || "", font.value);
  };
  watchPostEffect(measureText);
  return width;
};
var DiffSplitAddWidget = ({
  side,
  className,
  lineNumber,
  onWidgetClick,
  onOpenAddWidget
}) => {
  return createVNode("div", {
    "class": "diff-add-widget-wrapper invisible select-none transition-transform hover:scale-110 group-hover:visible" + (className ? " " + className : ""),
    "style": {
      width: `calc(var(${diffFontSizeName}) * 1.4)`,
      height: `calc(var(${diffFontSizeName}) * 1.4)`,
      top: `calc(var(${diffFontSizeName}) * 0.1)`
    }
  }, [createVNode("button", {
    "class": "diff-add-widget z-[1] flex h-full w-full origin-center cursor-pointer items-center justify-center rounded-md text-[1.2em]",
    "style": {
      color: `var(${addWidgetColorName})`,
      backgroundColor: `var(${addWidgetBGName})`
    },
    "onClick": () => {
      onOpenAddWidget(lineNumber, side);
      onWidgetClick == null ? void 0 : onWidgetClick("onAddWidgetClick", lineNumber, side);
    }
  }, [createTextVNode("+")])]);
};
var DiffUnifiedAddWidget = ({
  lineNumber,
  side,
  onWidgetClick,
  onOpenAddWidget
}) => {
  return createVNode("div", {
    "class": "diff-add-widget-wrapper invisible absolute left-[100%] translate-x-[-50%] select-none transition-transform hover:scale-110 group-hover:visible",
    "style": {
      width: `calc(var(${diffFontSizeName}) * 1.4)`,
      height: `calc(var(${diffFontSizeName}) * 1.4)`,
      top: `calc(var(${diffFontSizeName}) * 0.1)`
    }
  }, [createVNode("button", {
    "class": "diff-add-widget z-[1] flex h-full w-full origin-center cursor-pointer items-center justify-center rounded-md text-[1.2em]",
    "style": {
      color: `var(${addWidgetColorName})`,
      backgroundColor: `var(${addWidgetBGName})`
    },
    "onClick": () => {
      onOpenAddWidget(lineNumber, side);
      onWidgetClick == null ? void 0 : onWidgetClick("onAddWidgetClick", lineNumber, side);
    }
  }, [createTextVNode("+")])]);
};
var DiffNoNewLine = () => {
  return createVNode("svg", {
    "aria-label": "No newline at end of file",
    "role": "img",
    "viewBox": "0 0 16 16",
    "version": "1.1",
    "fill": "currentColor"
  }, [createVNode("path", {
    "d": "M4.25 7.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z"
  }, null), createVNode("path", {
    "d": "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z"
  }, null)]);
};
var DiffString = ({
  rawLine,
  diffLine,
  operator,
  plainLine,
  enableWrap,
  enableTemplate
}) => {
  const changes = diffLine == null ? void 0 : diffLine.changes;
  if (changes == null ? void 0 : changes.hasLineChange) {
    const isNewLineSymbolChanged = changes.newLineSymbol;
    if (enableTemplate && !(diffLine == null ? void 0 : diffLine.plainTemplate) && typeof getPlainDiffTemplate === "function") {
      getPlainDiffTemplate({
        diffLine,
        rawLine,
        operator
      });
    }
    if (enableTemplate && (diffLine == null ? void 0 : diffLine.plainTemplate)) {
      return createVNode("span", {
        "class": "diff-line-content-raw"
      }, [createVNode("span", {
        "data-template": true,
        "innerHTML": diffLine.plainTemplate
      }, null), isNewLineSymbolChanged === NewLineSymbol.NEWLINE && createVNode("span", {
        "data-no-newline-at-end-of-file-symbol": true,
        "class": enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500",
        "style": {
          width: `var(${diffFontSizeName})`,
          height: `var(${diffFontSizeName})`
        }
      }, [createVNode(DiffNoNewLine, null, null)])]);
    } else {
      const range = changes.range;
      const str1 = rawLine.slice(0, range.location);
      const str2 = rawLine.slice(range.location, range.location + range.length);
      const str3 = rawLine.slice(range.location + range.length);
      const isLast = str2.includes("\n");
      const _str2 = isLast ? str2.replace("\n", "").replace("\r", "") : str2;
      return createVNode("span", {
        "class": "diff-line-content-raw"
      }, [createVNode("span", {
        "data-range-start": range.location,
        "data-range-end": range.location + range.length
      }, [str1, createVNode("span", {
        "data-diff-highlight": true,
        "class": "rounded-[0.2em]",
        "style": {
          backgroundColor: operator === "add" ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`
        }
      }, [isLast ? createVNode(Fragment, null, [_str2, createVNode("span", {
        "data-newline-symbol": true
      }, [getSymbol(isNewLineSymbolChanged)])]) : str2]), str3]), isNewLineSymbolChanged === NewLineSymbol.NEWLINE && createVNode("span", {
        "data-no-newline-at-end-of-file-symbol": true,
        "class": enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500",
        "style": {
          width: `var(${diffFontSizeName})`,
          height: `var(${diffFontSizeName})`
        }
      }, [createVNode(DiffNoNewLine, null, null)])]);
    }
  }
  if (enableTemplate && plainLine && !(plainLine == null ? void 0 : plainLine.template)) {
    plainLine.template = getPlainLineTemplate(plainLine.value);
  }
  if (enableTemplate && (plainLine == null ? void 0 : plainLine.template)) {
    return createVNode("span", {
      "class": "diff-line-content-raw"
    }, [createVNode("span", {
      "data-template": true,
      "innerHTML": plainLine.template
    }, null)]);
  }
  return createVNode("span", {
    "class": "diff-line-content-raw"
  }, [rawLine]);
};
var DiffSyntax = ({
  rawLine,
  diffLine,
  operator,
  syntaxLine,
  enableWrap,
  enableTemplate
}) => {
  var _a, _b;
  if (!syntaxLine) {
    return createVNode(DiffString, {
      "rawLine": rawLine,
      "diffLine": diffLine,
      "operator": operator,
      "enableWrap": enableWrap,
      "enableTemplate": enableTemplate
    }, null);
  }
  const changes = diffLine == null ? void 0 : diffLine.changes;
  if (changes == null ? void 0 : changes.hasLineChange) {
    const isNewLineSymbolChanged = changes.newLineSymbol;
    if (enableTemplate && !(diffLine == null ? void 0 : diffLine.syntaxTemplate) && typeof getSyntaxDiffTemplate === "function") {
      getSyntaxDiffTemplate({
        diffLine,
        syntaxLine,
        operator
      });
    }
    if (enableTemplate && (diffLine == null ? void 0 : diffLine.syntaxTemplate)) {
      return createVNode("span", {
        "class": "diff-line-syntax-raw"
      }, [createVNode("span", {
        "data-template": true,
        "innerHTML": diffLine.syntaxTemplate
      }, null), isNewLineSymbolChanged === NewLineSymbol.NEWLINE && createVNode("span", {
        "data-no-newline-at-end-of-file-symbol": true,
        "class": enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500",
        "style": {
          width: `var(${diffFontSizeName})`,
          height: `var(${diffFontSizeName})`
        }
      }, [createVNode(DiffNoNewLine, null, null)])]);
    } else {
      const range = changes.range;
      return createVNode("span", {
        "class": "diff-line-syntax-raw"
      }, [createVNode("span", {
        "data-range-start": range.location,
        "data-range-end": range.location + range.length
      }, [(_a = syntaxLine.nodeList) == null ? void 0 : _a.map(({
        node,
        wrapper
      }, index) => {
        var _a2, _b2, _c, _d, _e, _f;
        if (node.endIndex < range.location || range.location + range.length < node.startIndex) {
          return createVNode("span", {
            "key": index,
            "data-start": node.startIndex,
            "data-end": node.endIndex,
            "class": (_b2 = (_a2 = wrapper == null ? void 0 : wrapper.properties) == null ? void 0 : _a2.className) == null ? void 0 : _b2.join(" "),
            "style": (_c = wrapper == null ? void 0 : wrapper.properties) == null ? void 0 : _c.style
          }, [node.value]);
        } else {
          const index1 = range.location - node.startIndex;
          const index2 = index1 < 0 ? 0 : index1;
          const str1 = node.value.slice(0, index2);
          const str2 = node.value.slice(index2, index1 + range.length);
          const str3 = node.value.slice(index1 + range.length);
          const isStart = str1.length || range.location === node.startIndex;
          const isEnd = str3.length || node.endIndex === range.location + range.length - 1;
          const isLast = str2.includes("\n");
          const _str2 = isLast ? str2.replace("\n", "").replace("\r", "") : str2;
          return createVNode("span", {
            "key": index,
            "data-start": node.startIndex,
            "data-end": node.endIndex,
            "class": (_e = (_d = wrapper == null ? void 0 : wrapper.properties) == null ? void 0 : _d.className) == null ? void 0 : _e.join(" "),
            "style": (_f = wrapper == null ? void 0 : wrapper.properties) == null ? void 0 : _f.style
          }, [str1, createVNode("span", {
            "data-diff-highlight": true,
            "style": {
              backgroundColor: operator === "add" ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`,
              borderTopLeftRadius: isStart ? "0.2em" : void 0,
              borderBottomLeftRadius: isStart ? "0.2em" : void 0,
              borderTopRightRadius: isEnd || isLast ? "0.2em" : void 0,
              borderBottomRightRadius: isEnd || isLast ? "0.2em" : void 0
            }
          }, [isLast ? createVNode(Fragment, null, [_str2, createVNode("span", {
            "data-newline-symbol": true
          }, [getSymbol(isNewLineSymbolChanged)])]) : str2]), str3]);
        }
      })]), isNewLineSymbolChanged === NewLineSymbol.NEWLINE && createVNode("span", {
        "data-no-newline-at-end-of-file-symbol": true,
        "class": enableWrap ? "block !text-red-500" : "inline-block align-middle !text-red-500",
        "style": {
          width: `var(${diffFontSizeName})`,
          height: `var(${diffFontSizeName})`
        }
      }, [createVNode(DiffNoNewLine, null, null)])]);
    }
  }
  if (enableTemplate && !syntaxLine.template) {
    syntaxLine.template = getSyntaxLineTemplate(syntaxLine);
  }
  if (enableTemplate && syntaxLine.template) {
    return createVNode("span", {
      "class": "diff-line-syntax-raw"
    }, [createVNode("span", {
      "data-template": true,
      "innerHTML": syntaxLine.template
    }, null)]);
  }
  return createVNode("span", {
    "class": "diff-line-syntax-raw"
  }, [(_b = syntaxLine == null ? void 0 : syntaxLine.nodeList) == null ? void 0 : _b.map(({
    node,
    wrapper
  }, index) => {
    var _a2, _b2, _c;
    return createVNode("span", {
      "key": index,
      "data-start": node.startIndex,
      "data-end": node.endIndex,
      "class": (_b2 = (_a2 = wrapper == null ? void 0 : wrapper.properties) == null ? void 0 : _a2.className) == null ? void 0 : _b2.join(" "),
      "style": (_c = wrapper == null ? void 0 : wrapper.properties) == null ? void 0 : _c.style
    }, [node.value]);
  })]);
};
var DiffContent = ({
  diffLine,
  rawLine,
  diffFile,
  plainLine,
  syntaxLine,
  enableWrap,
  enableHighlight
}) => {
  var _a, _b;
  const isAdded = (diffLine == null ? void 0 : diffLine.type) === DiffLineType.Add;
  const isDelete = (diffLine == null ? void 0 : diffLine.type) === DiffLineType.Delete;
  const isMaxLineLengthToIgnoreSyntax = ((_a = syntaxLine == null ? void 0 : syntaxLine.nodeList) == null ? void 0 : _a.length) > 150;
  const isEnableTemplate = ((_b = diffFile == null ? void 0 : diffFile.getIsEnableTemplate) == null ? void 0 : _b.call(diffFile)) ?? true;
  return createVNode("div", {
    "class": "diff-line-content-item pl-[2.0em]",
    "style": {
      whiteSpace: enableWrap ? "pre-wrap" : "pre",
      wordBreak: enableWrap ? "break-all" : "initial"
    }
  }, [createVNode("span", {
    "data-operator": isAdded ? "+" : isDelete ? "-" : void 0,
    "class": "diff-line-content-operator ml-[-1.5em] inline-block w-[1.5em] select-none indent-[0.2em]"
  }, [isAdded ? "+" : isDelete ? "-" : " "]), enableHighlight && syntaxLine && !isMaxLineLengthToIgnoreSyntax ? createVNode(DiffSyntax, {
    "operator": isAdded ? "add" : isDelete ? "del" : void 0,
    "rawLine": rawLine,
    "diffLine": diffLine,
    "syntaxLine": syntaxLine,
    "enableWrap": enableWrap,
    "enableTemplate": isEnableTemplate
  }, null) : createVNode(DiffString, {
    "operator": isAdded ? "add" : isDelete ? "del" : void 0,
    "rawLine": rawLine,
    "diffLine": diffLine,
    "plainLine": plainLine,
    "enableWrap": enableWrap,
    "enableTemplate": isEnableTemplate
  }, null)]);
};
var DiffSplitContentLine$1 = defineComponent((props) => {
  var _a, _b, _c, _d;
  const setWidget = useSetWidget();
  const enableAddWidget = useEnableAddWidget();
  const enableHighlight = useEnableHighlight();
  const onAddWidgetClick = useOnAddWidgetClick();
  const currentLine = computed(() => props.side === SplitSide.old ? props.diffFile.getSplitLeftLine(props.index) : props.diffFile.getSplitRightLine(props.index));
  const currentLineHasDiff = computed(() => {
    var _a2;
    return !!((_a2 = currentLine.value) == null ? void 0 : _a2.diff);
  });
  const currentLineHasChange = computed(() => {
    var _a2;
    return checkDiffLineIncludeChange((_a2 = currentLine.value) == null ? void 0 : _a2.diff);
  });
  const currentLineHasHidden = computed(() => {
    var _a2;
    return (_a2 = currentLine.value) == null ? void 0 : _a2.isHidden;
  });
  const currentLineHasContent = computed(() => {
    var _a2;
    return (_a2 = currentLine.value) == null ? void 0 : _a2.lineNumber;
  });
  const currentSyntaxLine = ref(props.side === SplitSide.old ? props.diffFile.getOldSyntaxLine((_a = currentLine.value) == null ? void 0 : _a.lineNumber) : props.diffFile.getNewSyntaxLine((_b = currentLine.value) == null ? void 0 : _b.lineNumber));
  const currentPlainLine = ref(props.side === SplitSide.old ? props.diffFile.getOldPlainLine((_c = currentLine.value) == null ? void 0 : _c.lineNumber) : props.diffFile.getNewPlainLine((_d = currentLine.value) == null ? void 0 : _d.lineNumber));
  useSubscribeDiffFile(props, (diffFile) => {
    var _a2, _b2, _c2, _d2;
    currentSyntaxLine.value = props.side === SplitSide.old ? diffFile.getOldSyntaxLine((_a2 = currentLine.value) == null ? void 0 : _a2.lineNumber) : diffFile.getNewSyntaxLine((_b2 = currentLine.value) == null ? void 0 : _b2.lineNumber);
    currentPlainLine.value = props.side === SplitSide.old ? diffFile.getOldPlainLine((_c2 = currentLine.value) == null ? void 0 : _c2.lineNumber) : diffFile.getNewPlainLine((_d2 = currentLine.value) == null ? void 0 : _d2.lineNumber);
  });
  const onOpenAddWidget = (lineNumber, side) => setWidget({
    side,
    lineNumber
  });
  return () => {
    var _a2, _b2, _c2, _d2, _e, _f;
    if (currentLineHasHidden.value) return null;
    const isAdded = ((_b2 = (_a2 = currentLine.value) == null ? void 0 : _a2.diff) == null ? void 0 : _b2.type) === DiffLineType.Add;
    const isDelete = ((_d2 = (_c2 = currentLine.value) == null ? void 0 : _c2.diff) == null ? void 0 : _d2.type) === DiffLineType.Delete;
    const contentBG = getContentBG(isAdded, isDelete, currentLineHasDiff.value);
    const lineNumberBG = getLineNumberBG(isAdded, isDelete, currentLineHasDiff.value);
    return createVNode("tr", {
      "data-line": props.lineNumber,
      "data-state": currentLineHasDiff.value || !currentLineHasContent.value ? "diff" : "plain",
      "data-side": SplitSide[props.side],
      "class": "diff-line" + (currentLineHasContent.value ? " group" : "")
    }, [currentLineHasContent.value ? createVNode(Fragment, null, [createVNode("td", {
      "class": `diff-line-${SplitSide[props.side]}-num sticky left-0 z-[1] w-[1%] min-w-[40px] select-none pl-[10px] pr-[10px] text-right align-top`,
      "style": {
        backgroundColor: lineNumberBG,
        color: `var(${currentLineHasDiff.value ? plainLineNumberColorName : expandLineNumberColorName})`,
        width: `var(${diffAsideWidthName})`,
        minWidth: `var(${diffAsideWidthName})`,
        maxWidth: `var(${diffAsideWidthName})`
      }
    }, [currentLineHasDiff.value && enableAddWidget.value && createVNode(DiffSplitAddWidget, {
      "index": props.index,
      "lineNumber": currentLine.value.lineNumber,
      "side": props.side,
      "diffFile": props.diffFile,
      "onWidgetClick": onAddWidgetClick,
      "className": "absolute left-[100%] z-[1] translate-x-[-50%]",
      "onOpenAddWidget": onOpenAddWidget
    }, null), createVNode("span", {
      "data-line-num": currentLine.value.lineNumber,
      "style": {
        opacity: currentLineHasChange.value ? void 0 : 0.5
      }
    }, [currentLine.value.lineNumber])]), createVNode("td", {
      "class": `diff-line-${SplitSide[props.side]}-content pr-[10px] align-top`,
      "style": {
        backgroundColor: contentBG
      }
    }, [createVNode(DiffContent, {
      "enableWrap": false,
      "diffFile": props.diffFile,
      "rawLine": ((_e = currentLine.value) == null ? void 0 : _e.value) || "",
      "diffLine": (_f = currentLine.value) == null ? void 0 : _f.diff,
      "plainLine": currentPlainLine.value,
      "syntaxLine": currentSyntaxLine.value,
      "enableHighlight": enableHighlight.value
    }, null)])]) : createVNode("td", {
      "class": `diff-line-${SplitSide[props.side]}-placeholder select-none`,
      "style": {
        backgroundColor: `var(${emptyBGName})`
      },
      "colspan": 2
    }, [createVNode("span", null, [createTextVNode(" ")])])]);
  };
}, {
  name: "DiffSplitContentLine",
  props: ["diffFile", "index", "lineNumber", "side"]
});
var useDomWidth = ({ selector, enable }) => {
  const id = useId();
  const dom = useDom();
  const mounted = useIsMounted$1();
  const width = ref(0);
  const observeWidth = (onCancel) => {
    if (!mounted.value) return;
    if (enable.value) {
      const rootDocument = getElementRoot(dom.value);
      const container = rootDocument.querySelector(`#diff-root${id.value}`);
      const wrapper = container == null ? void 0 : container.querySelector(selector.value);
      if (!wrapper) return;
      const typedWrapper = wrapper;
      const cb = () => {
        const rect = wrapper == null ? void 0 : wrapper.getBoundingClientRect();
        width.value = (rect == null ? void 0 : rect.width) ?? 0;
      };
      cb();
      const cleanCb = () => {
        var _a;
        typedWrapper.__observeCallback.delete(cb);
        if (typedWrapper.__observeCallback.size === 0) {
          (_a = typedWrapper.__observeInstance) == null ? void 0 : _a.disconnect();
          typedWrapper.removeAttribute("data-observe");
          delete typedWrapper.__observeCallback;
          delete typedWrapper.__observeInstance;
        }
      };
      if (typedWrapper.__observeCallback) {
        typedWrapper.__observeCallback.add(cb);
        onCancel(() => cleanCb());
        return;
      }
      typedWrapper.__observeCallback = /* @__PURE__ */ new Set();
      typedWrapper.__observeCallback.add(cb);
      const observer = new ResizeObserver(() => typedWrapper.__observeCallback.forEach((cb2) => cb2()));
      typedWrapper.__observeInstance = observer;
      observer.observe(typedWrapper);
      typedWrapper.setAttribute("data-observe", "height");
      onCancel(() => cleanCb());
    }
  };
  watchPostEffect((onCancel) => observeWidth(onCancel));
  return width;
};
var useSyncHeight = ({
  selector,
  wrapper,
  side,
  enable
}) => {
  const id = useId();
  const dom = useDom();
  const isMounted = useIsMounted$1();
  const observeHeight = (onCancel) => {
    if (!isMounted.value) return;
    if (enable.value) {
      let clean = () => {
      };
      const rootDocument = getElementRoot(dom.value);
      const container = rootDocument.querySelector(`#diff-root${id.value}`);
      const elements = Array.from((container == null ? void 0 : container.querySelectorAll(selector.value)) || []);
      const wrappers = wrapper.value ? Array.from((container == null ? void 0 : container.querySelectorAll(wrapper == null ? void 0 : wrapper.value)) || []) : elements;
      if (elements.length === 2 && wrappers.length === 2) {
        const ele1 = elements[0];
        const ele2 = elements[1];
        const wrapper1 = wrappers[0];
        const wrapper2 = wrappers[1];
        const target = ele1.getAttribute("data-side") === side.value ? ele1 : ele2;
        const typedTarget = target;
        const cb = () => {
          ele1.style.height = "auto";
          ele2.style.height = "auto";
          const rect1 = ele1.getBoundingClientRect();
          const rect2 = ele2.getBoundingClientRect();
          const maxHeight = Math.max(rect1.height, rect2.height);
          wrapper1.style.height = maxHeight + "px";
          wrapper2.style.height = maxHeight + "px";
          wrapper1.setAttribute("data-sync-height", String(maxHeight));
          wrapper2.setAttribute("data-sync-height", String(maxHeight));
        };
        cb();
        const cleanCb = () => {
          var _a;
          typedTarget.__observeCallback.delete(cb);
          if (typedTarget.__observeCallback.size === 0) {
            (_a = typedTarget.__observeInstance) == null ? void 0 : _a.disconnect();
            target.removeAttribute("data-observe");
            delete typedTarget.__observeCallback;
            delete typedTarget.__observeInstance;
          }
        };
        if (typedTarget.__observeCallback) {
          typedTarget.__observeCallback.add(cb);
          clean = cleanCb;
          return;
        }
        typedTarget.__observeCallback = /* @__PURE__ */ new Set();
        typedTarget.__observeCallback.add(cb);
        const observer = new ResizeObserver(() => typedTarget.__observeCallback.forEach((cb2) => cb2()));
        typedTarget.__observeInstance = observer;
        observer.observe(target);
        target.setAttribute("data-observe", "height");
        clean = cleanCb;
      }
      onCancel(() => clean());
    }
  };
  watchPostEffect(observeHeight);
};
var DiffSplitExtendLine$1 = defineComponent((props) => {
  const extendData = useExtendData();
  const slots = useSlots();
  const lineSelector = computed(() => `div[data-line="${props.lineNumber}-extend-content"]`);
  const lineWrapperSelector = computed(() => `tr[data-line="${props.lineNumber}-extend"]`);
  const wrapperSelector = computed(() => props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper");
  const oldLine = computed(() => props.diffFile.getSplitLeftLine(props.index));
  const newLine = computed(() => props.diffFile.getSplitRightLine(props.index));
  const enableExpand = computed(() => props.diffFile.getExpandEnabled());
  const oldLineExtend = computed(() => {
    var _a, _b, _c;
    return (_c = (_a = extendData.value) == null ? void 0 : _a.oldFile) == null ? void 0 : _c[(_b = oldLine.value) == null ? void 0 : _b.lineNumber];
  });
  const newLineExtend = computed(() => {
    var _a, _b;
    return (_b = (_a = extendData.value) == null ? void 0 : _a.newFile) == null ? void 0 : _b[newLine.value.lineNumber];
  });
  const currentItem = computed(() => props.side === SplitSide.old ? oldLine.value : newLine.value);
  const currentIsHidden = computed(() => currentItem.value.isHidden);
  const currentExtend = computed(() => props.side === SplitSide.old ? oldLineExtend.value : newLineExtend.value);
  const currentLineNumber = computed(() => props.side === SplitSide.old ? oldLine.value.lineNumber : newLine.value.lineNumber);
  const currentIsShow = computed(() => Boolean((oldLineExtend.value || newLineExtend.value) && (!currentIsHidden.value || enableExpand.value) && slots.extend));
  const currentEnable = computed(() => (props.side === SplitSide.old ? !!oldLineExtend.value : !!newLineExtend.value) && currentIsShow.value);
  const extendSide = computed(() => SplitSide[currentExtend.value ? props.side : props.side === SplitSide.new ? SplitSide.old : SplitSide.new]);
  useSyncHeight({
    selector: lineSelector,
    wrapper: lineWrapperSelector,
    side: extendSide,
    enable: currentIsShow
  });
  const width = useDomWidth({
    selector: wrapperSelector,
    enable: currentEnable
  });
  return () => {
    var _a;
    if (!currentIsShow.value) return null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-extend`,
      "data-state": "extend",
      "data-side": SplitSide[props.side],
      "class": "diff-line diff-line-extend"
    }, [currentExtend.value ? createVNode("td", {
      "class": `diff-line-extend-${SplitSide[props.side]}-content p-0`,
      "colspan": 2
    }, [createVNode("div", {
      "data-line": `${props.lineNumber}-extend-content`,
      "data-side": SplitSide[props.side],
      "class": "diff-line-extend-wrapper sticky left-0 z-[1]",
      "style": {
        width: width.value + "px"
      }
    }, [width.value > 0 && ((_a = slots.extend) == null ? void 0 : _a.call(slots, {
      diffFile: props.diffFile,
      side: props.side,
      lineNumber: currentLineNumber.value,
      data: currentExtend.value.data,
      onUpdate: props.diffFile.notifyAll
    }))])]) : createVNode("td", {
      "class": `diff-line-extend-${SplitSide[props.side]}-placeholder select-none p-0`,
      "style": {
        backgroundColor: `var(${emptyBGName})`
      },
      "colspan": 2
    }, [createVNode("div", {
      "data-line": `${props.lineNumber}-extend-content`,
      "data-side": SplitSide[props.side]
    }, null)])]);
  };
}, {
  name: "DiffSplitExtendLine",
  props: ["index", "diffFile", "lineNumber", "side"]
});
var ExpandDown = ({
  className
}) => {
  return createVNode("svg", {
    "aria-hidden": "true",
    "height": "16",
    "viewBox": "0 0 16 16",
    "version": "1.1",
    "width": "16",
    "class": className
  }, [createVNode("path", {
    "d": "m8.177 14.323 2.896-2.896a.25.25 0 0 0-.177-.427H8.75V7.764a.75.75 0 1 0-1.5 0V11H5.104a.25.25 0 0 0-.177.427l2.896 2.896a.25.25 0 0 0 .354 0ZM2.25 5a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM6 4.25a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5a.75.75 0 0 1 .75.75ZM8.25 5a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM12 4.25a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5a.75.75 0 0 1 .75.75Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5Z"
  }, null)]);
};
var ExpandUp = ({
  className
}) => {
  return createVNode("svg", {
    "aria-hidden": "true",
    "height": "16",
    "viewBox": "0 0 16 16",
    "version": "1.1",
    "width": "16",
    "class": className
  }, [createVNode("path", {
    "d": "M7.823 1.677 4.927 4.573A.25.25 0 0 0 5.104 5H7.25v3.236a.75.75 0 1 0 1.5 0V5h2.146a.25.25 0 0 0 .177-.427L8.177 1.677a.25.25 0 0 0-.354 0ZM13.75 11a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Zm-3.75.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75ZM7.75 11a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM4 11.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75ZM1.75 11a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Z"
  }, null)]);
};
var ExpandAll = ({
  className
}) => {
  return createVNode("svg", {
    "aria-hidden": "true",
    "height": "16",
    "viewBox": "0 0 16 16",
    "version": "1.1",
    "width": "16",
    "class": className
  }, [createVNode("path", {
    "d": "m8.177.677 2.896 2.896a.25.25 0 0 1-.177.427H8.75v1.25a.75.75 0 0 1-1.5 0V4H5.104a.25.25 0 0 1-.177-.427L7.823.677a.25.25 0 0 1 .354 0ZM7.25 10.75a.75.75 0 0 1 1.5 0V12h2.146a.25.25 0 0 1 .177.427l-2.896 2.896a.25.25 0 0 1-.354 0l-2.896-2.896A.25.25 0 0 1 5.104 12H7.25v-1.25Zm-5-2a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM6 8a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5A.75.75 0 0 1 6 8Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM12 8a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5A.75.75 0 0 1 12 8Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5Z"
  }, null)]);
};
var DiffSplitHunkLineGitHub$1 = defineComponent((props) => {
  const currentHunk = computed(() => props.diffFile.getSplitHunkLine(props.index));
  const enableExpand = computed(() => props.diffFile.getExpandEnabled());
  const couldExpand = computed(() => enableExpand.value && currentHunk.value && currentHunk.value.splitInfo);
  const lineSelector = computed(() => `tr[data-line="${props.lineNumber}-hunk"]`);
  const currentShowExpand = computed(() => props.side === SplitSide.old);
  const currentSyncHeightSide = computed(() => SplitSide[SplitSide.old]);
  const currentIsFirstLine = computed(() => currentHunk.value && currentHunk.value.isFirst);
  const currentIsLastLine = computed(() => currentHunk.value && currentHunk.value.isLast);
  const currentIsPureHunk = computed(() => currentHunk.value && props.diffFile._getIsPureDiffRender() && !currentHunk.value.splitInfo);
  const currentShowExpandAll = ref(currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen);
  const currentIsShow = ref(currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex);
  useSubscribeDiffFile(props, () => {
    currentShowExpandAll.value = currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen;
    currentIsShow.value = currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex;
  });
  const currentEnableSyncHeight = computed(() => props.side === SplitSide.new && (currentIsShow.value || currentIsPureHunk.value));
  useSyncHeight({
    selector: lineSelector,
    wrapper: lineSelector,
    side: currentSyncHeightSide,
    enable: currentEnableSyncHeight
  });
  return () => {
    var _a;
    if (!currentIsShow.value && !currentIsPureHunk.value) return null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-hunk`,
      "data-state": "hunk",
      "data-side": SplitSide[props.side],
      "style": {
        backgroundColor: `var(${hunkContentBGName})`
      },
      "class": "diff-line diff-line-hunk"
    }, [currentShowExpand.value ? createVNode(Fragment, null, [createVNode("td", {
      "class": "diff-line-hunk-action sticky left-0 w-[1%] min-w-[40px] select-none p-[1px]",
      "style": {
        backgroundColor: `var(${hunkLineNumberBGName})`,
        color: `var(${plainLineNumberColorName})`,
        width: `var(${diffAsideWidthName})`,
        minWidth: `var(${diffAsideWidthName})`,
        maxWidth: `var(${diffAsideWidthName})`
      }
    }, [couldExpand.value ? currentIsFirstLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onSplitHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)]) : currentIsLastLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onSplitHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]) : currentShowExpandAll.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand All",
      "data-title": "Expand All",
      "onClick": () => props.diffFile.onSplitHunkExpand("all", props.index)
    }, [createVNode(ExpandAll, {
      "className": "fill-current"
    }, null)]) : createVNode(Fragment, null, [createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onSplitHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]), createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onSplitHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)])]) : createVNode("div", {
      "class": "min-h-[28px]"
    }, [createTextVNode(" ")])]), createVNode("td", {
      "class": "diff-line-hunk-content pr-[10px] align-middle",
      "style": {
        backgroundColor: `var(${hunkContentBGName})`
      }
    }, [createVNode("div", {
      "class": "pl-[1.5em]",
      "style": {
        color: `var(${hunkContentColorName})`
      }
    }, [((_a = currentHunk.value.splitInfo) == null ? void 0 : _a.plainText) || currentHunk.value.text])])]) : createVNode("td", {
      "class": "diff-line-hunk-placeholder select-none",
      "colspan": 2,
      "style": {
        backgroundColor: `var(${hunkContentBGName})`
      }
    }, [createVNode("div", {
      "class": "min-h-[28px]"
    }, [createTextVNode(" ")])])]);
  };
}, {
  name: "DiffSplitHunkLine",
  props: ["diffFile", "index", "lineNumber", "side"]
});
var DiffSplitHunkLineGitLab$1 = defineComponent((props) => {
  const currentHunk = computed(() => props.diffFile.getSplitHunkLine(props.index));
  const enableExpand = computed(() => props.diffFile.getExpandEnabled());
  const lineSelector = computed(() => `tr[data-line="${props.lineNumber}-hunk"]`);
  const couldExpand = computed(() => enableExpand.value && currentHunk.value && currentHunk.value.splitInfo);
  const currentShowExpandAll = ref(currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen);
  const currentIsFirstLine = computed(() => currentHunk.value && currentHunk.value.isFirst);
  const currentIsPureHunk = computed(() => currentHunk.value && props.diffFile._getIsPureDiffRender() && !currentHunk.value.splitInfo);
  const currentIsLastLine = computed(() => currentHunk.value && currentHunk.value.isLast);
  const currentIsShow = ref(currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex);
  const currentSyncHeightSide = computed(() => SplitSide[SplitSide.old]);
  const currentEnableSyncHeight = computed(() => props.side === SplitSide.new && (currentIsShow.value || currentIsPureHunk.value));
  useSyncHeight({
    selector: lineSelector,
    wrapper: lineSelector,
    side: currentSyncHeightSide,
    enable: currentEnableSyncHeight
  });
  useSubscribeDiffFile(props, () => {
    currentShowExpandAll.value = currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen;
    currentIsShow.value = currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex;
  });
  return () => {
    var _a;
    if (!currentIsShow.value && !currentIsPureHunk.value) return null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-hunk`,
      "data-state": "hunk",
      "data-side": SplitSide[props.side],
      "style": {
        backgroundColor: `var(${hunkContentBGName})`
      },
      "class": "diff-line diff-line-hunk"
    }, [createVNode("td", {
      "class": "diff-line-hunk-action sticky left-0 w-[1%] min-w-[40px] select-none p-[1px]",
      "style": {
        backgroundColor: `var(${hunkLineNumberBGName})`,
        color: `var(${plainLineNumberColorName})`,
        width: `var(${diffAsideWidthName})`,
        minWidth: `var(${diffAsideWidthName})`,
        maxWidth: `var(${diffAsideWidthName})`
      }
    }, [couldExpand.value ? currentIsFirstLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onSplitHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)]) : currentIsLastLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onSplitHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]) : currentShowExpandAll.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand All",
      "data-title": "Expand All",
      "onClick": () => props.diffFile.onSplitHunkExpand("all", props.index)
    }, [createVNode(ExpandAll, {
      "className": "fill-current"
    }, null)]) : createVNode(Fragment, null, [createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onSplitHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]), createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onSplitHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)])]) : createVNode("div", {
      "class": "min-h-[28px]"
    }, [createTextVNode(" ")])]), createVNode("td", {
      "class": "diff-line-hunk-content pr-[10px] align-middle",
      "style": {
        backgroundColor: `var(${hunkContentBGName})`
      }
    }, [createVNode("div", {
      "class": "pl-[1.5em]",
      "style": {
        color: `var(${hunkContentColorName})`
      }
    }, [((_a = currentHunk.value.splitInfo) == null ? void 0 : _a.plainText) || currentHunk.value.text])])]);
  };
}, {
  name: "DiffSplitHunkLine",
  props: ["diffFile", "index", "lineNumber", "side"]
});
var DiffSplitHunkLine$1 = defineComponent((props) => {
  const diffViewMode = useMode();
  return () => {
    if (diffViewMode.value === DiffModeEnum.SplitGitHub || diffViewMode.value === DiffModeEnum.Split) {
      return createVNode(DiffSplitHunkLineGitHub$1, {
        "index": props.index,
        "side": props.side,
        "diffFile": props.diffFile,
        "lineNumber": props.lineNumber
      }, null);
    } else {
      return createVNode(DiffSplitHunkLineGitLab$1, {
        "index": props.index,
        "side": props.side,
        "diffFile": props.diffFile,
        "lineNumber": props.lineNumber
      }, null);
    }
  };
}, {
  name: "DiffSplitHunkLine",
  props: ["diffFile", "index", "lineNumber", "side"]
});
var DiffSplitWidgetLine$1 = defineComponent((props) => {
  const slots = useSlots();
  const widget = useWidget();
  const setWidget = useSetWidget();
  const oldLine = computed(() => props.diffFile.getSplitLeftLine(props.index));
  const newLine = computed(() => props.diffFile.getSplitRightLine(props.index));
  const oldLineWidget = computed(() => oldLine.value.lineNumber && widget.value.side === SplitSide.old && widget.value.lineNumber === oldLine.value.lineNumber);
  const newLineWidget = computed(() => newLine.value.lineNumber && widget.value.side === SplitSide.new && widget.value.lineNumber === newLine.value.lineNumber);
  const currentLine = computed(() => props.side === SplitSide.old ? oldLine.value : newLine.value);
  const currentIsHidden = computed(() => currentLine.value.isHidden);
  const lineSelector = computed(() => `div[data-line="${props.lineNumber}-widget-content"]`);
  const lineWrapperSelector = computed(() => `tr[data-line="${props.lineNumber}-widget"]`);
  const wrapperSelector = computed(() => props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper");
  const currentWidget = computed(() => props.side === SplitSide.old ? oldLineWidget.value : newLineWidget.value);
  const observeSide = computed(() => SplitSide[currentWidget ? props.side : props.side === SplitSide.old ? SplitSide.new : SplitSide.old]);
  const currentIsShow = computed(() => (!!oldLineWidget.value || !!newLineWidget.value) && !currentIsHidden.value && !!slots.widget);
  const currentEnable = computed(() => currentWidget.value && !!currentIsShow.value);
  const onCloseWidget = () => setWidget({});
  useSyncHeight({
    selector: lineSelector,
    wrapper: lineWrapperSelector,
    side: observeSide,
    enable: currentIsShow
  });
  const width = useDomWidth({
    selector: wrapperSelector,
    enable: currentEnable
  });
  return () => {
    var _a;
    if (!currentIsShow.value) return null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-widget`,
      "data-state": "widget",
      "data-side": SplitSide[props.side],
      "class": "diff-line diff-line-widget"
    }, [currentWidget.value ? createVNode("td", {
      "class": `diff-line-widget-${SplitSide[props.side]}-content p-0`,
      "colspan": 2
    }, [createVNode("div", {
      "data-line": `${props.lineNumber}-widget-content`,
      "data-side": SplitSide[props.side],
      "class": "diff-line-widget-wrapper sticky left-0 z-[1]",
      "style": {
        width: width.value + "px"
      }
    }, [width.value > 0 && ((_a = slots.widget) == null ? void 0 : _a.call(slots, {
      diffFile: props.diffFile,
      side: props.side,
      lineNumber: currentLine.value.lineNumber,
      onClose: onCloseWidget
    }))])]) : createVNode("td", {
      "class": `diff-line-widget-${SplitSide[props.side]}-placeholder select-none p-0`,
      "style": {
        backgroundColor: `var(${emptyBGName})`
      },
      "colspan": 2
    }, [createVNode("div", {
      "data-line": `${props.lineNumber}-widget-content`,
      "data-side": SplitSide[props.side]
    }, null)])]);
  };
}, {
  name: "DiffSplitWidgetLine",
  props: ["diffFile", "index", "lineNumber", "side"]
});
var DiffSplitViewTable = defineComponent((props) => {
  const className = computed(() => props.side === SplitSide.new ? "new-diff-table" : "old-diff-table");
  const lines = ref(getSplitContentLines(props.diffFile));
  useSubscribeDiffFile(props, (diffFile) => {
    lines.value = getSplitContentLines(diffFile);
  });
  const selectState = props.selectState;
  const onMouseDown = (e) => {
    var _a, _b;
    let ele = e.target;
    if (ele && (ele == null ? void 0 : ele.nodeName) === "BUTTON") {
      removeAllSelection();
      return;
    }
    const id = getDiffIdFromElement(ele);
    if (id && id !== `diff-root${props.diffFile.getId()}`) {
      return;
    }
    while (ele && ele instanceof HTMLElement) {
      const state = ele.getAttribute("data-state");
      if (state) {
        if (state === "extend" || state === "hunk" || state === "widget") {
          if (selectState.current !== void 0) {
            selectState.current = void 0;
            (_a = props.onSelect) == null ? void 0 : _a.call(props, void 0);
            removeAllSelection();
          }
        } else {
          if (selectState.current !== props.side) {
            selectState.current = props.side;
            (_b = props.onSelect) == null ? void 0 : _b.call(props, props.side);
            removeAllSelection();
          }
        }
        return;
      }
      ele = ele.parentElement;
    }
  };
  return () => {
    return createVNode("table", {
      "class": className.value + " w-full border-collapse border-spacing-0",
      "data-mode": SplitSide[props.side]
    }, [createVNode("colgroup", null, [createVNode("col", {
      "class": `diff-table-${SplitSide[props.side]}-num-col`
    }, null), createVNode("col", {
      "class": `diff-table-${SplitSide[props.side]}-content-col`
    }, null)]), createVNode("thead", {
      "class": "hidden"
    }, [createVNode("tr", null, [createVNode("th", {
      "scope": "col"
    }, [SplitSide[props.side], createTextVNode(" line number")]), createVNode("th", {
      "scope": "col"
    }, [SplitSide[props.side], createTextVNode(" line content")])])]), createVNode("tbody", {
      "class": "diff-table-body leading-[1.6]",
      "onMousedown": onMouseDown
    }, [lines.value.map((item) => createVNode(Fragment, {
      "key": item.index
    }, [createVNode(DiffSplitHunkLine$1, {
      "index": item.index,
      "side": props.side,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null), createVNode(DiffSplitContentLine$1, {
      "index": item.index,
      "side": props.side,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null), createVNode(DiffSplitWidgetLine$1, {
      "index": item.index,
      "side": props.side,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null), createVNode(DiffSplitExtendLine$1, {
      "index": item.index,
      "side": props.side,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null)])), createVNode(DiffSplitHunkLine$1, {
      "side": props.side,
      "index": props.diffFile.splitLineLength,
      "lineNumber": props.diffFile.splitLineLength,
      "diffFile": props.diffFile
    }, null)])]);
  };
}, {
  name: "DiffSplitViewTable",
  props: ["diffFile", "side", "onSelect", "selectState"]
});
var DiffSplitViewNormal = defineComponent((props) => {
  const isMounted = useIsMounted();
  const ref1 = ref();
  const ref2 = ref();
  const styleRef = ref();
  const maxText = computed(() => Math.max(props.diffFile.splitLineLength, props.diffFile.fileLineLength).toString());
  const initSyncScroll = (onClean) => {
    if (!isMounted.value) return;
    const left = ref1.value;
    const right = ref2.value;
    if (!left || !right) return;
    const clean = syncScroll(left, right);
    onClean(clean);
  };
  watchPostEffect(initSyncScroll);
  const onSelect = (side) => {
    const ele = styleRef.value;
    if (!ele) return;
    if (!side) {
      ele.textContent = "";
    } else {
      const id = `diff-root${props.diffFile.getId()}`;
      ele.textContent = `#${id} [data-state="extend"] {user-select: none} 
#${id} [data-state="hunk"] {user-select: none} 
#${id} [data-state="widget"] {user-select: none}`;
    }
  };
  const fontSize = useFontSize();
  const selectState = {
    current: void 0
  };
  const font = computed(() => ({
    fontSize: fontSize.value + "px",
    fontFamily: "Menlo, Consolas, monospace"
  }));
  const width = useTextWidth({
    text: maxText,
    font
  });
  const computedWidth = computed(() => Math.max(40, width.value + 25));
  return () => {
    return createVNode("div", {
      "class": "split-diff-view split-diff-view-normal flex w-full basis-[50%]"
    }, [createVNode("style", {
      "data-select-style": true,
      "ref": styleRef
    }, null), createVNode("div", {
      "class": "old-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden",
      "ref": ref1,
      "style": {
        [diffAsideWidthName]: `${Math.round(computedWidth.value)}px`,
        overscrollBehaviorX: "none",
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: `var(${diffFontSizeName})`
      }
    }, [createVNode(DiffSplitViewTable, {
      "side": SplitSide.old,
      "diffFile": props.diffFile,
      "onSelect": onSelect,
      "selectState": selectState
    }, null)]), createVNode("div", {
      "class": "diff-split-line w-[1.5px]",
      "style": {
        backgroundColor: `var(${borderColorName})`
      }
    }, null), createVNode("div", {
      "class": "new-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden",
      "ref": ref2,
      "style": {
        [diffAsideWidthName]: `${Math.round(computedWidth.value)}px`,
        overscrollBehaviorX: "none",
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: `var(${diffFontSizeName})`
      }
    }, [createVNode(DiffSplitViewTable, {
      "side": SplitSide.new,
      "diffFile": props.diffFile,
      "onSelect": onSelect,
      "selectState": selectState
    }, null)])]);
  };
}, {
  name: "DiffSplitViewNormal",
  props: ["diffFile"]
});
var DiffSplitContentLine = defineComponent((props) => {
  var _a, _b;
  const setWidget = useSetWidget();
  const enableAddWidget = useEnableAddWidget();
  const enableHighlight = useEnableHighlight();
  const onAddWidgetClick = useOnAddWidgetClick();
  const oldLine = computed(() => props.diffFile.getSplitLeftLine(props.index));
  const newLine = computed(() => props.diffFile.getSplitRightLine(props.index));
  const oldSyntaxLine = ref(props.diffFile.getOldSyntaxLine((_a = oldLine.value) == null ? void 0 : _a.lineNumber));
  const newSyntaxLine = ref(props.diffFile.getNewSyntaxLine((_b = newLine.value) == null ? void 0 : _b.lineNumber));
  const oldPlainLine = ref(props.diffFile.getOldPlainLine(oldLine.value.lineNumber));
  const newPlainLine = ref(props.diffFile.getNewPlainLine(newLine.value.lineNumber));
  const hasDiff = computed(() => {
    var _a2, _b2;
    return !!((_a2 = oldLine.value) == null ? void 0 : _a2.diff) || !!((_b2 = newLine.value) == null ? void 0 : _b2.diff);
  });
  const hasChange = computed(() => {
    var _a2, _b2;
    return checkDiffLineIncludeChange((_a2 = oldLine.value) == null ? void 0 : _a2.diff) || checkDiffLineIncludeChange((_b2 = newLine.value) == null ? void 0 : _b2.diff);
  });
  const hasHidden = computed(() => {
    var _a2, _b2;
    return ((_a2 = oldLine.value) == null ? void 0 : _a2.isHidden) && ((_b2 = newLine.value) == null ? void 0 : _b2.isHidden);
  });
  useSubscribeDiffFile(props, (diffFile) => {
    var _a2, _b2;
    oldSyntaxLine.value = diffFile.getOldSyntaxLine((_a2 = oldLine.value) == null ? void 0 : _a2.lineNumber);
    newSyntaxLine.value = diffFile.getNewSyntaxLine((_b2 = newLine.value) == null ? void 0 : _b2.lineNumber);
    oldPlainLine.value = diffFile.getOldPlainLine(oldLine.value.lineNumber);
    newPlainLine.value = diffFile.getNewPlainLine(newLine.value.lineNumber);
  });
  const onOpenAddWidget = (lineNumber, side) => setWidget({
    side,
    lineNumber
  });
  return () => {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j;
    if (hasHidden.value) return null;
    const hasOldLine = !!((_a2 = oldLine.value) == null ? void 0 : _a2.lineNumber);
    const hasNewLine = !!((_b2 = newLine.value) == null ? void 0 : _b2.lineNumber);
    const oldLineIsDelete = ((_d = (_c = oldLine.value) == null ? void 0 : _c.diff) == null ? void 0 : _d.type) === DiffLineType.Delete;
    const newLineIsAdded = ((_f = (_e = newLine.value) == null ? void 0 : _e.diff) == null ? void 0 : _f.type) === DiffLineType.Add;
    const oldLineContentBG = getContentBG(false, oldLineIsDelete, hasDiff.value);
    const oldLineNumberBG = getLineNumberBG(false, oldLineIsDelete, hasDiff.value);
    const newLineContentBG = getContentBG(newLineIsAdded, false, hasDiff.value);
    const newLineNumberBG = getLineNumberBG(newLineIsAdded, false, hasDiff.value);
    return createVNode("tr", {
      "data-line": props.lineNumber,
      "data-state": hasDiff.value ? "diff" : "plain",
      "class": "diff-line"
    }, [hasOldLine ? createVNode(Fragment, null, [createVNode("td", {
      "class": "diff-line-old-num group relative w-[1%] min-w-[40px] select-none pl-[10px] pr-[10px] text-right align-top",
      "style": {
        backgroundColor: oldLineNumberBG,
        color: `var(${hasDiff.value ? plainLineNumberColorName : expandLineNumberColorName})`
      }
    }, [hasDiff.value && enableAddWidget.value && createVNode(DiffSplitAddWidget, {
      "index": props.index,
      "lineNumber": oldLine.value.lineNumber,
      "side": SplitSide.old,
      "diffFile": props.diffFile,
      "onWidgetClick": onAddWidgetClick,
      "className": "absolute left-[100%] z-[1] translate-x-[-50%]",
      "onOpenAddWidget": onOpenAddWidget
    }, null), createVNode("span", {
      "data-line-num": oldLine.value.lineNumber,
      "style": {
        opacity: hasChange.value ? void 0 : 0.5
      }
    }, [oldLine.value.lineNumber])]), createVNode("td", {
      "class": "diff-line-old-content group relative pr-[10px] align-top",
      "style": {
        backgroundColor: oldLineContentBG
      },
      "data-side": SplitSide[SplitSide.old]
    }, [hasDiff.value && enableAddWidget.value && createVNode(DiffSplitAddWidget, {
      "index": props.index,
      "lineNumber": oldLine.value.lineNumber,
      "side": SplitSide.old,
      "diffFile": props.diffFile,
      "onWidgetClick": onAddWidgetClick,
      "className": "absolute right-[100%] z-[1] translate-x-[50%]",
      "onOpenAddWidget": onOpenAddWidget
    }, null), createVNode(DiffContent, {
      "enableWrap": true,
      "diffFile": props.diffFile,
      "rawLine": (_g = oldLine.value) == null ? void 0 : _g.value,
      "diffLine": (_h = oldLine.value) == null ? void 0 : _h.diff,
      "plainLine": oldPlainLine.value,
      "syntaxLine": oldSyntaxLine.value,
      "enableHighlight": enableHighlight.value
    }, null)])]) : createVNode("td", {
      "class": "diff-line-old-placeholder select-none",
      "style": {
        backgroundColor: `var(${emptyBGName})`
      },
      "colspan": 2
    }, [createVNode("span", null, [createTextVNode(" ")])]), hasNewLine ? createVNode(Fragment, null, [createVNode("td", {
      "class": "diff-line-new-num group relative w-[1%] min-w-[40px] select-none border-l-[1px] pl-[10px] pr-[10px] text-right align-top",
      "style": {
        backgroundColor: newLineNumberBG,
        color: `var(${hasDiff.value ? plainLineNumberColorName : expandLineNumberColorName})`,
        borderLeftColor: `var(${borderColorName})`,
        borderLeftStyle: "solid"
      }
    }, [hasDiff.value && enableAddWidget.value && createVNode(DiffSplitAddWidget, {
      "index": props.index,
      "lineNumber": newLine.value.lineNumber,
      "side": SplitSide.new,
      "diffFile": props.diffFile,
      "onWidgetClick": onAddWidgetClick,
      "className": "absolute left-[100%] z-[1] translate-x-[-50%]",
      "onOpenAddWidget": onOpenAddWidget
    }, null), createVNode("span", {
      "data-line-num": newLine.value.lineNumber,
      "style": {
        opacity: hasChange.value ? void 0 : 0.5
      }
    }, [newLine.value.lineNumber])]), createVNode("td", {
      "class": "diff-line-new-content group relative pr-[10px] align-top",
      "style": {
        backgroundColor: newLineContentBG
      },
      "data-side": SplitSide[SplitSide.new]
    }, [hasDiff.value && enableAddWidget.value && createVNode(DiffSplitAddWidget, {
      "index": props.index,
      "lineNumber": newLine.value.lineNumber,
      "side": SplitSide.new,
      "diffFile": props.diffFile,
      "onWidgetClick": onAddWidgetClick,
      "className": "absolute right-[100%] z-[1] translate-x-[50%]",
      "onOpenAddWidget": onOpenAddWidget
    }, null), createVNode(DiffContent, {
      "enableWrap": true,
      "diffFile": props.diffFile,
      "rawLine": ((_i = newLine.value) == null ? void 0 : _i.value) || "",
      "diffLine": (_j = newLine.value) == null ? void 0 : _j.diff,
      "plainLine": newPlainLine.value,
      "syntaxLine": newSyntaxLine.value,
      "enableHighlight": enableHighlight.value
    }, null)])]) : createVNode("td", {
      "class": "diff-line-new-placeholder select-none border-l-[1px]",
      "style": {
        backgroundColor: `var(${emptyBGName})`,
        borderLeftColor: `var(${borderColorName})`,
        borderLeftStyle: "solid"
      },
      "colspan": 2
    }, [createVNode("span", null, [createTextVNode(" ")])])]);
  };
}, {
  name: "DiffSplitContentLine",
  props: ["diffFile", "index", "lineNumber"]
});
var DiffSplitExtendLine = defineComponent((props) => {
  const extendData = useExtendData();
  const slots = useSlots();
  const oldLine = computed(() => props.diffFile.getSplitLeftLine(props.index));
  const newLine = computed(() => props.diffFile.getSplitRightLine(props.index));
  const enableExpand = computed(() => props.diffFile.getExpandEnabled());
  const oldLineExtend = computed(() => {
    var _a, _b, _c;
    return (_c = (_a = extendData.value) == null ? void 0 : _a.oldFile) == null ? void 0 : _c[(_b = oldLine.value) == null ? void 0 : _b.lineNumber];
  });
  const newLineExtend = computed(() => {
    var _a, _b;
    return (_b = (_a = extendData.value) == null ? void 0 : _a.newFile) == null ? void 0 : _b[newLine.value.lineNumber];
  });
  const hasHidden = computed(() => oldLine.value.isHidden && newLine.value.isHidden);
  const currentIsShow = computed(() => Boolean((oldLineExtend.value || newLineExtend.value) && (!hasHidden.value || enableExpand.value) && slots.extend));
  return () => {
    var _a, _b;
    if (!currentIsShow.value) return null;
    const oldExtendRendered = oldLineExtend.value ? (_a = slots.extend) == null ? void 0 : _a.call(slots, {
      diffFile: props.diffFile,
      side: SplitSide.old,
      lineNumber: oldLine.value.lineNumber,
      data: oldLineExtend.value.data,
      onUpdate: props.diffFile.notifyAll
    }) : null;
    const newExtendRendered = newLineExtend.value ? (_b = slots.extend) == null ? void 0 : _b.call(slots, {
      diffFile: props.diffFile,
      side: SplitSide.new,
      lineNumber: newLine.value.lineNumber,
      data: newLineExtend.value.data,
      onUpdate: props.diffFile.notifyAll
    }) : null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-extend`,
      "data-state": "extend",
      "class": "diff-line diff-line-extend"
    }, [oldExtendRendered ? createVNode("td", {
      "class": "diff-line-extend-old-content p-0",
      "colspan": 2
    }, [createVNode("div", {
      "class": "diff-line-extend-wrapper"
    }, [oldExtendRendered])]) : createVNode("td", {
      "class": "diff-line-extend-old-placeholder select-none p-0",
      "style": {
        backgroundColor: `var(${emptyBGName})`
      },
      "colspan": 2
    }, null), newExtendRendered ? createVNode("td", {
      "class": "diff-line-extend-new-content border-l-[1px] p-0",
      "colspan": 2,
      "style": {
        borderLeftColor: `var(${borderColorName})`,
        borderLeftStyle: "solid"
      }
    }, [createVNode("div", {
      "class": "diff-line-extend-wrapper"
    }, [newExtendRendered])]) : createVNode("td", {
      "class": "diff-line-extend-new-placeholder select-none border-l-[1px] p-0",
      "style": {
        backgroundColor: `var(${emptyBGName})`,
        borderLeftColor: `var(${borderColorName})`,
        borderLeftStyle: "solid"
      },
      "colspan": 2
    }, null)]);
  };
}, {
  name: "DiffSplitExtendLine",
  props: ["index", "diffFile", "lineNumber"]
});
var DiffSplitHunkLineGitHub = defineComponent((props) => {
  const currentHunk = computed(() => props.diffFile.getSplitHunkLine(props.index));
  const enableExpand = computed(() => props.diffFile.getExpandEnabled());
  const couldExpand = computed(() => enableExpand.value && currentHunk.value && currentHunk.value.splitInfo);
  const currentShowExpandAll = ref(currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen);
  const currentIsShow = ref(currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex);
  const currentIsFirstLine = computed(() => currentHunk.value && currentHunk.value.isFirst);
  const currentIsLastLine = computed(() => currentHunk.value && currentHunk.value.isLast);
  const currentIsPureHunk = computed(() => currentHunk.value && props.diffFile._getIsPureDiffRender() && !currentHunk.value.splitInfo);
  useSubscribeDiffFile(props, () => {
    currentShowExpandAll.value = currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen;
    currentIsShow.value = currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex;
  });
  return () => {
    var _a;
    if (!currentIsShow.value && !currentIsPureHunk.value) return null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-hunk`,
      "data-state": "hunk",
      "class": "diff-line diff-line-hunk"
    }, [createVNode("td", {
      "class": "diff-line-hunk-action relative w-[1%] min-w-[40px] select-none p-[1px]",
      "style": {
        backgroundColor: `var(${hunkLineNumberBGName})`,
        color: `var(${plainLineNumberColorName})`
      }
    }, [couldExpand.value ? currentIsFirstLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onSplitHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)]) : currentIsLastLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onSplitHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]) : currentShowExpandAll.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand All",
      "data-title": "Expand All",
      "onClick": () => props.diffFile.onSplitHunkExpand("all", props.index)
    }, [createVNode(ExpandAll, {
      "className": "fill-current"
    }, null)]) : createVNode(Fragment, null, [createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onSplitHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]), createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onSplitHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)])]) : createVNode("div", {
      "class": "min-h-[28px]"
    }, [createTextVNode(" ")])]), createVNode("td", {
      "class": "diff-line-hunk-content pr-[10px] align-middle",
      "style": {
        backgroundColor: `var(${hunkContentBGName})`
      },
      "colspan": 3
    }, [createVNode("div", {
      "class": "pl-[1.5em]",
      "style": {
        color: `var(${hunkContentColorName})`
      }
    }, [((_a = currentHunk.value.splitInfo) == null ? void 0 : _a.plainText) || currentHunk.value.text])])]);
  };
}, {
  name: "DiffSplitHunkLine",
  props: ["diffFile", "index", "lineNumber"]
});
var DiffSplitHunkLineGitLab = defineComponent((props) => {
  const currentHunk = computed(() => props.diffFile.getSplitHunkLine(props.index));
  const enableExpand = computed(() => props.diffFile.getExpandEnabled());
  const couldExpand = computed(() => enableExpand.value && currentHunk.value && currentHunk.value.splitInfo);
  const currentShowExpandAll = ref(currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen);
  const currentIsShow = ref(currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex);
  const currentIsFirstLine = computed(() => currentHunk.value && currentHunk.value.isFirst);
  const currentIsPureHunk = computed(() => currentHunk.value && props.diffFile._getIsPureDiffRender() && !currentHunk.value.splitInfo);
  const currentIsLastLine = computed(() => currentHunk.value && currentHunk.value.isLast);
  useSubscribeDiffFile(props, () => {
    currentShowExpandAll.value = currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen;
    currentIsShow.value = currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex;
  });
  return () => {
    var _a, _b;
    if (!currentIsShow.value && !currentIsPureHunk.value) return null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-hunk`,
      "data-state": "hunk",
      "class": "diff-line diff-line-hunk"
    }, [createVNode("td", {
      "class": "diff-line-hunk-action relative w-[1%] min-w-[40px] select-none p-[1px]",
      "style": {
        backgroundColor: `var(${hunkLineNumberBGName})`,
        color: `var(${plainLineNumberColorName})`
      }
    }, [couldExpand.value ? currentIsFirstLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onSplitHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)]) : currentIsLastLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onSplitHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]) : currentShowExpandAll.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand All",
      "data-title": "Expand All",
      "onClick": () => props.diffFile.onSplitHunkExpand("all", props.index)
    }, [createVNode(ExpandAll, {
      "className": "fill-current"
    }, null)]) : createVNode(Fragment, null, [createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onSplitHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]), createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onSplitHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)])]) : createVNode("div", {
      "class": "min-h-[28px]"
    }, [createTextVNode(" ")])]), createVNode("td", {
      "class": "diff-line-hunk-content pr-[10px] align-middle",
      "style": {
        backgroundColor: `var(${hunkContentBGName})`
      }
    }, [createVNode("div", {
      "class": "pl-[1.5em]",
      "style": {
        color: `var(${hunkContentColorName})`
      }
    }, [((_a = currentHunk.value.splitInfo) == null ? void 0 : _a.plainText) || currentHunk.value.text])]), createVNode("td", {
      "class": "diff-line-hunk-action relative z-[1] w-[1%] min-w-[40px] select-none border-l-[1px] p-[1px]",
      "style": {
        backgroundColor: `var(${hunkLineNumberBGName})`,
        color: `var(${plainLineNumberColorName})`,
        borderLeftColor: `var(${borderColorName})`,
        borderLeftStyle: "solid"
      }
    }, [couldExpand.value ? currentIsFirstLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onSplitHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)]) : currentIsLastLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onSplitHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]) : currentShowExpandAll.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand All",
      "data-title": "Expand All",
      "onClick": () => props.diffFile.onSplitHunkExpand("all", props.index)
    }, [createVNode(ExpandAll, {
      "className": "fill-current"
    }, null)]) : createVNode(Fragment, null, [createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onSplitHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]), createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onSplitHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)])]) : createVNode("div", {
      "class": "min-h-[28px]"
    }, [createTextVNode(" ")])]), createVNode("td", {
      "class": "diff-line-hunk-content relative pr-[10px] align-middle",
      "style": {
        backgroundColor: `var(${hunkContentBGName})`
      }
    }, [createVNode("div", {
      "class": "pl-[1.5em]",
      "style": {
        color: `var(${hunkContentColorName})`
      }
    }, [((_b = currentHunk.value.splitInfo) == null ? void 0 : _b.plainText) || currentHunk.value.text])])]);
  };
}, {
  name: "DiffSplitHunkLine",
  props: ["diffFile", "index", "lineNumber"]
});
var DiffSplitHunkLine = defineComponent((props) => {
  const diffViewMode = useMode();
  return () => {
    if (diffViewMode.value === DiffModeEnum.SplitGitHub || diffViewMode.value === DiffModeEnum.Split) {
      return createVNode(DiffSplitHunkLineGitHub, {
        "index": props.index,
        "diffFile": props.diffFile,
        "lineNumber": props.lineNumber
      }, null);
    } else {
      return createVNode(DiffSplitHunkLineGitLab, {
        "index": props.index,
        "diffFile": props.diffFile,
        "lineNumber": props.lineNumber
      }, null);
    }
  };
}, {
  name: "DiffSplitHunkLine",
  props: ["diffFile", "index", "lineNumber"]
});
var DiffSplitWidgetLine = defineComponent((props) => {
  const slots = useSlots();
  const widget = useWidget();
  const setWidget = useSetWidget();
  const oldLine = computed(() => props.diffFile.getSplitLeftLine(props.index));
  const newLine = computed(() => props.diffFile.getSplitRightLine(props.index));
  const oldLineWidget = computed(() => oldLine.value.lineNumber && widget.value.side === SplitSide.old && widget.value.lineNumber === oldLine.value.lineNumber);
  const newLineWidget = computed(() => newLine.value.lineNumber && widget.value.side === SplitSide.new && widget.value.lineNumber === newLine.value.lineNumber);
  const hasHidden = computed(() => oldLine.value.isHidden && newLine.value.isHidden);
  const currentIsShow = computed(() => (!!oldLineWidget.value || !!newLineWidget.value) && !hasHidden.value && !!slots.widget);
  const onCloseWidget = () => setWidget({});
  return () => {
    var _a, _b;
    if (!currentIsShow.value) return null;
    const oldWidgetRendered = oldLineWidget.value ? (_a = slots.widget) == null ? void 0 : _a.call(slots, {
      diffFile: props.diffFile,
      side: SplitSide.old,
      lineNumber: oldLine.value.lineNumber,
      onClose: onCloseWidget
    }) : null;
    const newWidgetRendered = newLineWidget.value ? (_b = slots.widget) == null ? void 0 : _b.call(slots, {
      diffFile: props.diffFile,
      side: SplitSide.new,
      lineNumber: newLine.value.lineNumber,
      onClose: onCloseWidget
    }) : null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-widget`,
      "data-state": "widget",
      "class": "diff-line diff-line-widget"
    }, [oldWidgetRendered ? createVNode("td", {
      "class": "diff-line-widget-old-content p-0",
      "colspan": 2
    }, [createVNode("div", {
      "class": "diff-line-widget-wrapper"
    }, [oldWidgetRendered])]) : createVNode("td", {
      "class": "diff-line-widget-old-placeholder select-none p-0",
      "style": {
        backgroundColor: `var(${emptyBGName})`
      },
      "colspan": 2
    }, null), newWidgetRendered ? createVNode("td", {
      "class": "diff-line-widget-new-content border-l-[1px] p-0",
      "colspan": 2,
      "style": {
        borderLeftColor: `var(${borderColorName})`,
        borderLeftStyle: "solid"
      }
    }, [createVNode("div", {
      "class": "diff-line-widget-wrapper"
    }, [newWidgetRendered])]) : createVNode("td", {
      "class": "diff-line-widget-new-placeholder select-none border-l-[1px] p-0",
      "style": {
        backgroundColor: `var(${emptyBGName})`,
        borderLeftColor: `var(${borderColorName})`,
        borderLeftStyle: "solid"
      },
      "colspan": 2
    }, null)]);
  };
}, {
  name: "DiffSplitWidgetLine",
  props: ["diffFile", "index", "lineNumber"]
});
var DiffSplitViewWrap = defineComponent((props) => {
  const lines = ref(getSplitContentLines(props.diffFile));
  const maxText = computed(() => Math.max(props.diffFile.splitLineLength, props.diffFile.fileLineLength).toString());
  const styleRef = ref(null);
  const selectState = {
    current: void 0
  };
  const onSelect = (side) => {
    const ele = styleRef.value;
    if (!ele) return;
    if (!side) {
      ele.textContent = "";
    } else {
      const id = `diff-root${props.diffFile.getId()}`;
      ele.textContent = `#${id} [data-side="${SplitSide[side === SplitSide.old ? SplitSide.new : SplitSide.old]}"] {user-select: none} 
#${id} [data-state="extend"] {user-select: none} 
#${id} [data-state="hunk"] {user-select: none} 
#${id} [data-state="widget"] {user-select: none}`;
    }
  };
  const onMouseDown = (e) => {
    let ele = e.target;
    if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
      removeAllSelection();
      return;
    }
    const id = getDiffIdFromElement(ele);
    if (id && id !== `diff-root${props.diffFile.getId()}`) {
      return;
    }
    while (ele && ele instanceof HTMLElement) {
      const state = ele.getAttribute("data-state");
      const side = ele.getAttribute("data-side");
      if (side) {
        if (selectState.current !== SplitSide[side]) {
          selectState.current = SplitSide[side];
          onSelect(SplitSide[side]);
          removeAllSelection();
        }
      }
      if (state) {
        if (state === "extend" || state === "hunk" || state === "widget") {
          if (selectState.current !== void 0) {
            selectState.current = void 0;
            onSelect(void 0);
            removeAllSelection();
          }
          return;
        } else {
          return;
        }
      }
      ele = ele.parentElement;
    }
  };
  const fontSize = useFontSize();
  const font = computed(() => ({
    fontSize: fontSize.value + "px",
    fontFamily: "Menlo, Consolas, monospace"
  }));
  useSubscribeDiffFile(props, (diffFile) => {
    lines.value = getSplitContentLines(diffFile);
  });
  const width = useTextWidth({
    text: maxText,
    font
  });
  const computedWidth = computed(() => Math.max(40, width.value + 25));
  return () => {
    return createVNode("div", {
      "class": "split-diff-view split-diff-view-warp w-full"
    }, [createVNode("div", {
      "class": "diff-table-wrapper w-full",
      "style": {
        [diffAsideWidthName]: `${Math.round(computedWidth.value)}px`,
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: `var(${diffFontSizeName})`
      }
    }, [createVNode("style", {
      "data-select-style": true,
      "ref": styleRef
    }, null), createVNode("table", {
      "class": "diff-table w-full table-fixed border-collapse border-spacing-0"
    }, [createVNode("colgroup", null, [createVNode("col", {
      "class": "diff-table-old-num-col",
      "width": Math.round(computedWidth.value)
    }, null), createVNode("col", {
      "class": "diff-table-old-content-col"
    }, null), createVNode("col", {
      "class": "diff-table-new-num-col",
      "width": Math.round(computedWidth.value)
    }, null), createVNode("col", {
      "class": "diff-table-new-content-col"
    }, null)]), createVNode("thead", {
      "class": "hidden"
    }, [createVNode("tr", null, [createVNode("th", {
      "scope": "col"
    }, [createTextVNode("old line number")]), createVNode("th", {
      "scope": "col"
    }, [createTextVNode("old line content")]), createVNode("th", {
      "scope": "col"
    }, [createTextVNode("new line number")]), createVNode("th", {
      "scope": "col"
    }, [createTextVNode("new line content")])])]), createVNode("tbody", {
      "class": "diff-table-body leading-[1.6]",
      "onMousedown": onMouseDown
    }, [lines.value.map((item) => createVNode(Fragment, {
      "key": item.index
    }, [createVNode(DiffSplitHunkLine, {
      "index": item.index,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null), createVNode(DiffSplitContentLine, {
      "index": item.index,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null), createVNode(DiffSplitWidgetLine, {
      "index": item.index,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null), createVNode(DiffSplitExtendLine, {
      "index": item.index,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null)])), createVNode(DiffSplitHunkLine, {
      "index": props.diffFile.splitLineLength,
      "lineNumber": props.diffFile.splitLineLength,
      "diffFile": props.diffFile
    }, null)])])])]);
  };
}, {
  name: "DiffSplitViewWrap",
  props: ["diffFile"]
});
var DiffSplitView = defineComponent((props) => {
  const enableWrap = useEnableWrap();
  return () => {
    return enableWrap.value ? createVNode(DiffSplitViewWrap, {
      "diffFile": props.diffFile
    }, null) : createVNode(DiffSplitViewNormal, {
      "diffFile": props.diffFile
    }, null);
  };
}, {
  name: "DiffSplitView",
  props: ["diffFile"]
});
var DiffUnifiedOldLine = ({
  index,
  diffLine,
  rawLine,
  plainLine,
  syntaxLine,
  lineNumber,
  diffFile,
  enableWrap,
  enableAddWidget,
  enableHighlight,
  onOpenAddWidget,
  onAddWidgetClick
}) => {
  return createVNode("tr", {
    "data-line": index,
    "data-state": "diff",
    "class": "diff-line group"
  }, [createVNode("td", {
    "class": "diff-line-num sticky left-0 z-[1] w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top",
    "style": {
      color: `var(${plainLineNumberColorName})`,
      backgroundColor: `var(${delLineNumberBGName})`,
      width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
      maxWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
      minWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`
    }
  }, [enableAddWidget && createVNode(DiffUnifiedAddWidget, {
    "index": index - 1,
    "lineNumber": lineNumber,
    "diffFile": diffFile,
    "side": SplitSide.old,
    "onWidgetClick": onAddWidgetClick,
    "onOpenAddWidget": onOpenAddWidget
  }, null), createVNode("div", {
    "class": "flex"
  }, [createVNode("span", {
    "data-line-old-num": lineNumber,
    "class": "inline-block w-[50%]"
  }, [lineNumber]), createVNode("span", {
    "class": "w-[10px] shrink-0"
  }, null), createVNode("span", {
    "class": "inline-block w-[50%]"
  }, null)])]), createVNode("td", {
    "class": "diff-line-content pr-[10px] align-top",
    "style": {
      backgroundColor: `var(${delContentBGName})`
    }
  }, [createVNode(DiffContent, {
    "enableWrap": enableWrap,
    "diffFile": diffFile,
    "enableHighlight": enableHighlight,
    "rawLine": rawLine,
    "diffLine": diffLine,
    "plainLine": plainLine,
    "syntaxLine": syntaxLine
  }, null)])]);
};
var DiffUnifiedNewLine = ({
  index,
  diffLine,
  rawLine,
  plainLine,
  syntaxLine,
  lineNumber,
  diffFile,
  enableWrap,
  enableAddWidget,
  enableHighlight,
  onOpenAddWidget,
  onAddWidgetClick
}) => {
  return createVNode("tr", {
    "data-line": index,
    "data-state": "diff",
    "class": "diff-line group"
  }, [createVNode("td", {
    "class": "diff-line-num sticky left-0 z-[1] w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top",
    "style": {
      color: `var(${plainLineNumberColorName})`,
      backgroundColor: `var(${addLineNumberBGName})`,
      width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
      maxWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
      minWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`
    }
  }, [enableAddWidget && createVNode(DiffUnifiedAddWidget, {
    "index": index - 1,
    "lineNumber": lineNumber,
    "diffFile": diffFile,
    "side": SplitSide.new,
    "onWidgetClick": onAddWidgetClick,
    "onOpenAddWidget": onOpenAddWidget
  }, null), createVNode("div", {
    "class": "flex"
  }, [createVNode("span", {
    "class": "inline-block w-[50%]"
  }, null), createVNode("span", {
    "class": "w-[10px] shrink-0"
  }, null), createVNode("span", {
    "data-line-new-num": lineNumber,
    "class": "inline-block w-[50%]"
  }, [lineNumber])])]), createVNode("td", {
    "class": "diff-line-content pr-[10px] align-top",
    "style": {
      backgroundColor: `var(${addContentBGName})`
    }
  }, [createVNode(DiffContent, {
    "enableWrap": enableWrap,
    "diffFile": diffFile,
    "enableHighlight": enableHighlight,
    "rawLine": rawLine,
    "diffLine": diffLine,
    "plainLine": plainLine,
    "syntaxLine": syntaxLine
  }, null)])]);
};
var DiffUnifiedContentLine = defineComponent((props) => {
  var _a, _b, _c, _d;
  const unifiedItem = computed(() => props.diffFile.getUnifiedLine(props.index));
  const enableWrap = useEnableWrap();
  const setWidget = useSetWidget();
  const onAddWidgetClick = useOnAddWidgetClick();
  const enableHighlight = useEnableHighlight();
  const enableAddWidget = useEnableAddWidget();
  const currentItemHasHidden = computed(() => {
    var _a2;
    return (_a2 = unifiedItem.value) == null ? void 0 : _a2.isHidden;
  });
  const currentItemHasChange = computed(() => {
    var _a2;
    return checkDiffLineIncludeChange((_a2 = unifiedItem.value) == null ? void 0 : _a2.diff);
  });
  const currentSyntaxLine = ref(((_a = unifiedItem.value) == null ? void 0 : _a.newLineNumber) ? props.diffFile.getNewSyntaxLine(unifiedItem.value.newLineNumber) : ((_b = unifiedItem.value) == null ? void 0 : _b.oldLineNumber) ? props.diffFile.getOldSyntaxLine(unifiedItem.value.oldLineNumber) : void 0);
  const currentPlainLine = ref(((_c = unifiedItem.value) == null ? void 0 : _c.newLineNumber) ? props.diffFile.getNewPlainLine(unifiedItem.value.newLineNumber) : ((_d = unifiedItem.value) == null ? void 0 : _d.oldLineNumber) ? props.diffFile.getOldPlainLine(unifiedItem.value.oldLineNumber) : void 0);
  useSubscribeDiffFile(props, (diffFile) => {
    var _a2, _b2, _c2, _d2;
    currentSyntaxLine.value = ((_a2 = unifiedItem.value) == null ? void 0 : _a2.newLineNumber) ? diffFile.getNewSyntaxLine(unifiedItem.value.newLineNumber) : ((_b2 = unifiedItem.value) == null ? void 0 : _b2.oldLineNumber) ? diffFile.getOldSyntaxLine(unifiedItem.value.oldLineNumber) : void 0;
    currentPlainLine.value = ((_c2 = unifiedItem.value) == null ? void 0 : _c2.newLineNumber) ? diffFile.getNewPlainLine(unifiedItem.value.newLineNumber) : ((_d2 = unifiedItem.value) == null ? void 0 : _d2.oldLineNumber) ? diffFile.getOldPlainLine(unifiedItem.value.oldLineNumber) : void 0;
  });
  const onOpenAddWidget = (lineNumber, side) => setWidget({
    side,
    lineNumber
  });
  return () => {
    if (currentItemHasHidden.value) return null;
    if (currentItemHasChange.value) {
      if (unifiedItem.value.oldLineNumber) {
        return createVNode(DiffUnifiedOldLine, {
          "index": props.lineNumber,
          "enableWrap": enableWrap.value,
          "diffFile": props.diffFile,
          "rawLine": unifiedItem.value.value || "",
          "diffLine": unifiedItem.value.diff,
          "plainLine": currentPlainLine.value,
          "syntaxLine": currentSyntaxLine.value,
          "enableHighlight": enableHighlight.value,
          "enableAddWidget": enableAddWidget.value,
          "lineNumber": unifiedItem.value.oldLineNumber,
          "onAddWidgetClick": onAddWidgetClick,
          "onOpenAddWidget": onOpenAddWidget
        }, null);
      } else {
        return createVNode(DiffUnifiedNewLine, {
          "index": props.lineNumber,
          "enableWrap": enableWrap.value,
          "diffFile": props.diffFile,
          "rawLine": unifiedItem.value.value || "",
          "diffLine": unifiedItem.value.diff,
          "plainLine": currentPlainLine.value,
          "syntaxLine": currentSyntaxLine.value,
          "enableHighlight": enableHighlight.value,
          "enableAddWidget": enableAddWidget.value,
          "lineNumber": unifiedItem.value.newLineNumber,
          "onAddWidgetClick": onAddWidgetClick,
          "onOpenAddWidget": onOpenAddWidget
        }, null);
      }
    } else {
      return createVNode("tr", {
        "data-line": props.lineNumber,
        "data-state": unifiedItem.value.diff ? "diff" : "plain",
        "class": "diff-line group"
      }, [createVNode("td", {
        "class": "diff-line-num sticky left-0 z-[1] w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top",
        "style": {
          color: `var(${unifiedItem.value.diff ? plainLineNumberColorName : expandLineNumberColorName})`,
          backgroundColor: unifiedItem.value.diff ? `var(${plainLineNumberBGName})` : `var(${expandContentBGName})`,
          width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          maxWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          minWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`
        }
      }, [enableAddWidget.value && unifiedItem.value.diff && createVNode(DiffUnifiedAddWidget, {
        "index": props.index,
        "diffFile": props.diffFile,
        "lineNumber": unifiedItem.value.newLineNumber,
        "side": SplitSide.new,
        "onOpenAddWidget": onOpenAddWidget,
        "onWidgetClick": onAddWidgetClick
      }, null), createVNode("div", {
        "class": "flex opacity-[0.5]"
      }, [createVNode("span", {
        "data-line-old-num": unifiedItem.value.oldLineNumber,
        "class": "inline-block w-[50%]"
      }, [unifiedItem.value.oldLineNumber]), createVNode("span", {
        "class": "w-[10px] shrink-0"
      }, null), createVNode("span", {
        "data-line-new-num": unifiedItem.value.newLineNumber,
        "class": "inline-block w-[50%]"
      }, [unifiedItem.value.newLineNumber])])]), createVNode("td", {
        "class": "diff-line-content pr-[10px] align-top",
        "style": {
          backgroundColor: unifiedItem.value.diff ? `var(${plainContentBGName})` : `var(${expandContentBGName})`
        }
      }, [createVNode(DiffContent, {
        "enableWrap": enableWrap.value,
        "diffFile": props.diffFile,
        "enableHighlight": enableHighlight.value,
        "rawLine": unifiedItem.value.value || "",
        "diffLine": unifiedItem.value.diff,
        "plainLine": currentPlainLine.value,
        "syntaxLine": currentSyntaxLine.value
      }, null)])]);
    }
  };
}, {
  name: "DiffUnifiedContentLine",
  props: ["diffFile", "index", "lineNumber"]
});
var DiffUnifiedExtendLine = defineComponent((props) => {
  const extendData = useExtendData();
  const slots = useSlots();
  const enableWrap = useEnableWrap();
  const unifiedItem = computed(() => props.diffFile.getUnifiedLine(props.index));
  const oldExtend = computed(() => {
    var _a, _b;
    return (_b = (_a = extendData.value) == null ? void 0 : _a.oldFile) == null ? void 0 : _b[unifiedItem.value.oldLineNumber];
  });
  const newExtend = computed(() => {
    var _a, _b;
    return (_b = (_a = extendData.value) == null ? void 0 : _a.newFile) == null ? void 0 : _b[unifiedItem.value.newLineNumber];
  });
  const currentIsHidden = computed(() => unifiedItem.value.isHidden);
  const currentIsShow = computed(() => Boolean((oldExtend.value || newExtend.value) && !currentIsHidden.value && slots.extend));
  const width = useDomWidth({
    selector: ref(".unified-diff-table-wrapper"),
    enable: currentIsShow
  });
  return () => {
    if (!currentIsShow.value) return null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-extend`,
      "data-state": "extend",
      "class": "diff-line diff-line-extend"
    }, [createVNode("td", {
      "class": "diff-line-extend-content p-0 align-top",
      "colspan": 2
    }, [createVNode("div", {
      "class": "diff-line-extend-wrapper sticky left-0 z-[1]",
      "style": {
        width: width.value + "px"
      }
    }, [(enableWrap.value ? true : width.value > 0) && oldExtend.value && slots.extend({
      diffFile: props.diffFile,
      side: SplitSide.old,
      lineNumber: unifiedItem.value.oldLineNumber,
      data: oldExtend.value.data,
      onUpdate: props.diffFile.notifyAll
    }), (enableWrap.value ? true : width.value > 0) && newExtend.value && slots.extend({
      diffFile: props.diffFile,
      side: SplitSide.new,
      lineNumber: unifiedItem.value.newLineNumber,
      data: newExtend.value.data,
      onUpdate: props.diffFile.notifyAll
    })])])]);
  };
}, {
  name: "DiffUnifiedExtendLine",
  props: ["diffFile", "index", "lineNumber"]
});
var DiffUnifiedHunkLine = defineComponent((props) => {
  const currentHunk = computed(() => props.diffFile.getUnifiedHunkLine(props.index));
  const enableExpand = computed(() => props.diffFile.getExpandEnabled());
  const couldExpand = computed(() => enableExpand.value && currentHunk.value && currentHunk.value.unifiedInfo);
  const enableWrap = useEnableWrap();
  const currentIsShow = ref(currentHunk.value && currentHunk.value.unifiedInfo && currentHunk.value.unifiedInfo.startHiddenIndex < currentHunk.value.unifiedInfo.endHiddenIndex);
  const currentIsEnableAll = ref(currentHunk.value && currentHunk.value.unifiedInfo && currentHunk.value.unifiedInfo.endHiddenIndex - currentHunk.value.unifiedInfo.startHiddenIndex < composeLen);
  const currentIsFirstLine = computed(() => currentHunk.value && currentHunk.value.isFirst);
  const currentIsLastLine = computed(() => currentHunk.value && currentHunk.value.isLast);
  const currentIsPureHunk = computed(() => currentHunk.value && props.diffFile._getIsPureDiffRender() && !currentHunk.value.unifiedInfo);
  useSubscribeDiffFile(props, () => {
    currentIsShow.value = currentHunk.value && currentHunk.value.unifiedInfo && currentHunk.value.unifiedInfo.startHiddenIndex < currentHunk.value.unifiedInfo.endHiddenIndex;
    currentIsEnableAll.value = currentHunk.value && currentHunk.value.unifiedInfo && currentHunk.value.unifiedInfo.endHiddenIndex - currentHunk.value.unifiedInfo.startHiddenIndex < composeLen;
  });
  return () => {
    var _a;
    if (!currentIsShow.value && !currentIsPureHunk.value) return null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-hunk`,
      "data-state": "hunk",
      "class": "diff-line diff-line-hunk"
    }, [createVNode("td", {
      "class": "diff-line-hunk-action sticky left-0 w-[1%] min-w-[100px] select-none",
      "style": {
        backgroundColor: `var(${hunkLineNumberBGName})`,
        color: `var(${plainLineNumberColorName})`,
        width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
        maxWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
        minWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`
      }
    }, [couldExpand.value ? currentIsFirstLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onUnifiedHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)]) : currentIsLastLine.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onUnifiedHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]) : currentIsEnableAll.value ? createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]",
      "title": "Expand All",
      "data-title": "Expand All",
      "onClick": () => props.diffFile.onUnifiedHunkExpand("all", props.index)
    }, [createVNode(ExpandAll, {
      "className": "fill-current"
    }, null)]) : createVNode(Fragment, null, [createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Down",
      "data-title": "Expand Down",
      "onClick": () => props.diffFile.onUnifiedHunkExpand("down", props.index)
    }, [createVNode(ExpandDown, {
      "className": "fill-current"
    }, null)]), createVNode("button", {
      "class": "diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]",
      "title": "Expand Up",
      "data-title": "Expand Up",
      "onClick": () => props.diffFile.onUnifiedHunkExpand("up", props.index)
    }, [createVNode(ExpandUp, {
      "className": "fill-current"
    }, null)])]) : createVNode("div", {
      "class": "min-h-[28px]"
    }, [createTextVNode(" ")])]), createVNode("td", {
      "class": "diff-line-hunk-content pr-[10px] align-middle",
      "style": {
        backgroundColor: `var(${hunkContentBGName})`
      }
    }, [createVNode("div", {
      "class": "pl-[1.5em]",
      "style": {
        whiteSpace: enableWrap.value ? "pre-wrap" : "pre",
        wordBreak: enableWrap.value ? "break-all" : "initial",
        color: `var(${hunkContentColorName})`
      }
    }, [((_a = currentHunk.value.unifiedInfo) == null ? void 0 : _a.plainText) || currentHunk.value.text])])]);
  };
}, {
  name: "DiffUnifiedHunkLine",
  props: ["index", "diffFile", "lineNumber"]
});
var DiffUnifiedWidgetLine = defineComponent((props) => {
  const slots = useSlots();
  const widget = useWidget();
  const setWidget = useSetWidget();
  const enableWrap = useEnableWrap();
  const unifiedItem = computed(() => props.diffFile.getUnifiedLine(props.index));
  const oldWidget = computed(() => {
    var _a;
    return ((_a = unifiedItem.value) == null ? void 0 : _a.oldLineNumber) && widget.value.side === SplitSide.old && widget.value.lineNumber === unifiedItem.value.oldLineNumber;
  });
  const newWidget = computed(() => {
    var _a;
    return ((_a = unifiedItem.value) == null ? void 0 : _a.newLineNumber) && widget.value.side === SplitSide.new && widget.value.lineNumber === unifiedItem.value.newLineNumber;
  });
  const currentIsHidden = computed(() => unifiedItem.value.isHidden);
  const currentIsShow = computed(() => (oldWidget.value || newWidget.value) && !currentIsHidden.value && !!slots.widget);
  const onCloseWidget = () => setWidget({});
  const width = useDomWidth({
    selector: ref(".unified-diff-table-wrapper"),
    enable: currentIsShow
  });
  return () => {
    var _a, _b;
    if (!currentIsShow.value) return null;
    return createVNode("tr", {
      "data-line": `${props.lineNumber}-widget`,
      "data-state": "widget",
      "class": "diff-line diff-line-widget"
    }, [createVNode("td", {
      "class": "diff-line-widget-content p-0",
      "colspan": 2
    }, [createVNode("div", {
      "class": "diff-line-widget-wrapper sticky left-0 z-[1]",
      "style": {
        width: width.value + "px"
      }
    }, [(enableWrap.value ? true : width.value > 0) && oldWidget.value && ((_a = slots.widget) == null ? void 0 : _a.call(slots, {
      diffFile: props.diffFile,
      side: SplitSide.old,
      lineNumber: unifiedItem.value.oldLineNumber,
      onClose: onCloseWidget
    })), (enableWrap.value ? true : width.value > 0) && newWidget.value && ((_b = slots.widget) == null ? void 0 : _b.call(slots, {
      diffFile: props.diffFile,
      side: SplitSide.new,
      lineNumber: unifiedItem.value.newLineNumber,
      onClose: onCloseWidget
    }))])])]);
  };
}, {
  name: "DiffUnifiedWidgetLine",
  props: ["diffFile", "index", "lineNumber"]
});
var DiffUnifiedView = defineComponent((props) => {
  const lines = ref(getUnifiedContentLine(props.diffFile));
  const maxText = computed(() => Math.max(props.diffFile.unifiedLineLength, props.diffFile.fileLineLength).toString());
  useSubscribeDiffFile(props, (diffFile) => {
    lines.value = getUnifiedContentLine(diffFile);
  });
  const fontSize = useFontSize();
  const enableWrap = useEnableWrap();
  const selectState = {
    current: void 0
  };
  const styleRef = ref(null);
  const onSelect = (state) => {
    const ele = styleRef.value;
    if (!ele) return;
    if (state === void 0) {
      ele.textContent = "";
    } else {
      const id = `diff-root${props.diffFile.getId()}`;
      ele.textContent = `#${id} [data-state="extend"] {user-select: none} 
#${id} [data-state="hunk"] {user-select: none} 
#${id} [data-state="widget"] {user-select: none}`;
    }
  };
  const onMouseDown = (e) => {
    let ele = e.target;
    if (ele && (ele == null ? void 0 : ele.nodeName) === "BUTTON") {
      removeAllSelection();
      return;
    }
    const id = getDiffIdFromElement(ele);
    if (id && id !== `diff-root${props.diffFile.getId()}`) {
      return;
    }
    while (ele && ele instanceof HTMLElement) {
      const state = ele.getAttribute("data-state");
      if (state) {
        if (state === "extend" || state === "hunk" || state === "widget") {
          if (selectState.current !== false) {
            selectState.current = false;
            onSelect(false);
            removeAllSelection();
          }
        } else {
          if (selectState.current !== true) {
            selectState.current = true;
            onSelect(true);
            removeAllSelection();
          }
        }
        return;
      }
      ele = ele.parentElement;
    }
  };
  const font = computed(() => ({
    fontSize: fontSize.value + "px",
    fontFamily: "Menlo, Consolas, monospace"
  }));
  const width = useTextWidth({
    text: maxText,
    font
  });
  const computedWidth = computed(() => Math.max(40, width.value + 10));
  return () => {
    return createVNode("div", {
      "class": `unified-diff-view ${enableWrap.value ? "unified-diff-view-wrap" : "unified-diff-view-normal"} w-full`
    }, [createVNode("style", {
      "data-select-style": true,
      "ref": styleRef
    }, null), createVNode("div", {
      "class": "unified-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden",
      "style": {
        [diffAsideWidthName]: `${Math.round(computedWidth.value)}px`,
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: `var(${diffFontSizeName})`
      }
    }, [createVNode("table", {
      "class": `unified-diff-table w-full border-collapse border-spacing-0 ${enableWrap.value ? "table-fixed" : ""}`
    }, [createVNode("colgroup", null, [createVNode("col", {
      "class": "unified-diff-table-num-col"
    }, null), createVNode("col", {
      "class": "unified-diff-table-content-col"
    }, null)]), createVNode("thead", {
      "class": "hidden"
    }, [createVNode("tr", null, [createVNode("th", {
      "scope": "col"
    }, [createTextVNode("line number")]), createVNode("th", {
      "scope": "col"
    }, [createTextVNode("line content")])])]), createVNode("tbody", {
      "class": "diff-table-body leading-[1.6]",
      "onMousedown": onMouseDown
    }, [lines.value.map((item) => createVNode(Fragment, {
      "key": item.index
    }, [createVNode(DiffUnifiedHunkLine, {
      "index": item.index,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null), createVNode(DiffUnifiedContentLine, {
      "index": item.index,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null), createVNode(DiffUnifiedWidgetLine, {
      "index": item.index,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null), createVNode(DiffUnifiedExtendLine, {
      "index": item.index,
      "lineNumber": item.lineNumber,
      "diffFile": props.diffFile
    }, null)])), createVNode(DiffUnifiedHunkLine, {
      "index": props.diffFile.unifiedLineLength,
      "lineNumber": props.diffFile.unifiedLineLength,
      "diffFile": props.diffFile
    }, null)])])])]);
  };
}, {
  props: ["diffFile"],
  name: "DiffUnifiedView"
});
_cacheMap.name = "@git-diff-view/vue";
var DiffView = defineComponent((props, options) => {
  var _a, _b;
  const getInstance = () => {
    var _a2, _b2, _c, _d, _e, _f;
    if (props.diffFile) {
      const diffFile2 = DiffFile.createInstance({});
      diffFile2._mergeFullBundle(props.diffFile._getFullBundle());
      return diffFile2;
    }
    if (props.data) return new DiffFile(((_a2 = props.data.oldFile) == null ? void 0 : _a2.fileName) || "", ((_b2 = props.data.oldFile) == null ? void 0 : _b2.content) || "", ((_c = props.data.newFile) == null ? void 0 : _c.fileName) || "", ((_d = props.data.newFile) == null ? void 0 : _d.content) || "", props.data.hunks || [], ((_e = props.data.oldFile) == null ? void 0 : _e.fileLang) || "", ((_f = props.data.newFile) == null ? void 0 : _f.fileLang) || "");
    return null;
  };
  const diffFile = ref(getInstance());
  const id = ref((_b = (_a = diffFile.value) == null ? void 0 : _a.getId) == null ? void 0 : _b.call(_a));
  const widgetState = ref({});
  const wrapperRef = ref();
  const setWidget = (v) => {
    if (typeof options.slots.widget === "function") {
      widgetState.value = v;
    }
  };
  const enableHighlight = computed(() => props.diffViewHighlight ?? true);
  const theme = computed(() => props.diffViewTheme);
  watch(() => props.diffFile, () => {
    var _a2, _b2;
    (_b2 = (_a2 = diffFile.value) == null ? void 0 : _a2.clear) == null ? void 0 : _b2.call(_a2);
    diffFile.value = getInstance();
  }, {
    immediate: true
  });
  watch(() => props.initialWidgetState, () => {
    if (props.initialWidgetState) {
      widgetState.value = {
        side: props.initialWidgetState.side,
        lineNumber: props.initialWidgetState.lineNumber
      };
    }
  }, {
    immediate: true,
    deep: true
  });
  watch(() => props.data, () => {
    var _a2, _b2;
    (_b2 = (_a2 = diffFile.value) == null ? void 0 : _a2.clear) == null ? void 0 : _b2.call(_a2);
    diffFile.value = getInstance();
  }, {
    immediate: true,
    deep: true
  });
  watch(() => diffFile.value, () => widgetState.value = {});
  const isMounted = useIsMounted();
  const initSubscribe = (onClean) => {
    if (!isMounted.value || !diffFile.value || !props.diffFile) return;
    const instance2 = diffFile.value;
    props.diffFile._addClonedInstance(instance2);
    onClean(() => props.diffFile._delClonedInstance(instance2));
  };
  const initDiff = () => {
    if (!isMounted.value || !diffFile.value) return;
    const instance2 = diffFile.value;
    instance2.initTheme(theme.value);
    instance2.initRaw();
    instance2.buildSplitDiffLines();
    instance2.buildUnifiedDiffLines();
  };
  const initSyntax = () => {
    if (!isMounted.value || !diffFile.value) return;
    const instance2 = diffFile.value;
    theme.value;
    if (enableHighlight.value) {
      instance2.initSyntax({
        registerHighlighter: props.registerHighlighter
      });
    }
    instance2.notifyAll();
  };
  const initAttribute = (onClean) => {
    if (!isMounted.value || !diffFile.value || !wrapperRef.value) return;
    const instance2 = diffFile.value;
    const init = () => {
      var _a2, _b2;
      (_a2 = wrapperRef.value) == null ? void 0 : _a2.setAttribute("data-theme", instance2._getTheme() || "light");
      (_b2 = wrapperRef.value) == null ? void 0 : _b2.setAttribute("data-highlighter", instance2._getHighlighterName());
    };
    init();
    const cb = instance2.subscribe(init);
    onClean(() => cb());
  };
  const initId = (onClean) => {
    if (!diffFile.value) return;
    const instance2 = diffFile.value;
    id.value = instance2.getId();
    onClean(() => instance2.clearId());
  };
  watchEffect((onClean) => initSubscribe(onClean));
  watchEffect(() => initDiff());
  watchEffect(() => initSyntax());
  watchEffect((onClean) => initId(onClean));
  watchEffect((onClean) => initAttribute(onClean));
  provide(idSymbol, id);
  provide(domSymbol, wrapperRef);
  provide(mountedSymbol, isMounted);
  provide(slotsSymbol, options.slots);
  provide(onAddWidgetClickSymbol, options.emit);
  provide(widgetStateSymbol, widgetState);
  provide(setWidgetStateSymbol, setWidget);
  useProvide(props, "diffViewMode", modeSymbol, {
    defaultValue: DiffModeEnum.SplitGitHub
  });
  useProvide(props, "diffViewFontSize", fontSizeSymbol, {
    defaultValue: 14
  });
  useProvide(props, "diffViewWrap", enableWrapSymbol);
  useProvide(props, "diffViewHighlight", enableHighlightSymbol);
  useProvide(props, "diffViewAddWidget", enableAddWidgetSymbol);
  useProvide(props, "extendData", extendDataSymbol, {
    deepWatch: true
  });
  onUnmounted(() => {
    var _a2, _b2;
    return (_b2 = (_a2 = diffFile.value) == null ? void 0 : _a2.clear) == null ? void 0 : _b2.call(_a2);
  });
  options.expose({
    getDiffFileInstance: () => diffFile.value
  });
  return () => {
    if (!diffFile.value) return null;
    return createVNode("div", {
      "class": "diff-tailwindcss-wrapper",
      "data-component": "git-diff-view",
      "data-theme": diffFile.value._getTheme() || "light",
      "data-version": "0.0.35",
      "data-highlighter": diffFile.value._getHighlighterName(),
      "ref": wrapperRef
    }, [createVNode("div", {
      "class": "diff-style-root",
      "style": {
        [diffFontSizeName]: (props.diffViewFontSize || 14) + "px"
      }
    }, [createVNode("div", {
      "id": isMounted.value ? `diff-root${id.value}` : void 0,
      "class": "diff-view-wrapper" + (props.class ? ` ${props.class}` : ""),
      "style": props.style
    }, [!props.diffViewMode || props.diffViewMode & DiffModeEnum.Split ? createVNode(DiffSplitView, {
      "key": DiffModeEnum.Split,
      "diffFile": diffFile.value
    }, null) : createVNode(DiffUnifiedView, {
      "key": DiffModeEnum.Unified,
      "diffFile": diffFile.value
    }, null)])])]);
  };
}, {
  name: "DiffView",
  props: ["data", "class", "diffFile", "diffViewAddWidget", "diffViewFontSize", "diffViewHighlight", "diffViewMode", "diffViewWrap", "diffViewTheme", "extendData", "registerHighlighter", "initialWidgetState", "style"],
  // expose: ["getDiffView"],
  slots: Object
});
var version = "0.0.35";
export {
  DefaultDiffExpansionStep,
  DiffFile,
  DiffFileLineType,
  DiffHunk,
  DiffHunkExpansionType,
  DiffHunkHeader,
  DiffLine,
  DiffLineType,
  DiffModeEnum,
  DiffParser,
  DiffView,
  File,
  HiddenBidiCharsRegex,
  SplitSide,
  _cacheMap,
  _getAST,
  assertNever,
  changeDefaultComposeLength,
  changeMaxLengthToIgnoreLineDiff,
  checkCurrentLineIsHidden,
  checkDiffLineIncludeChange,
  composeLen,
  defaultTransform,
  diffChanges,
  disableCache,
  escapeHtml,
  getCurrentComposeLength,
  getDiffRange,
  getEnableFastDiffTemplate,
  getFile,
  getHunkHeaderExpansionType,
  getLang,
  getLargestLineNumber,
  getMaxLengthToIgnoreLineDiff,
  getPlainDiffTemplate,
  getPlainDiffTemplateByFastDiff,
  getPlainLineTemplate,
  getSplitContentLines,
  getSplitLines,
  getSyntaxDiffTemplate,
  getSyntaxDiffTemplateByFastDiff,
  getSyntaxLineTemplate,
  getUnifiedContentLine,
  getUnifiedLines,
  highlighter,
  isTransformEnabled,
  numIterator,
  parseInstance,
  processAST,
  processTransformForFile,
  processTransformTemplateContent,
  relativeChanges,
  resetDefaultComposeLength,
  resetEnableFastDiffTemplate,
  resetMaxLengthToIgnoreLineDiff,
  resetTransform,
  setEnableFastDiffTemplate,
  setTransformForFile,
  setTransformForTemplateContent,
  version,
  versions
};
//# sourceMappingURL=@git-diff-view_vue.js.map
