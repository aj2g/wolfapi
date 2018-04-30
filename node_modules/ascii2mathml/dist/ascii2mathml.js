/*! ascii2mathml v0.6.0 | (c) 2015 (MIT) | https://github.com/runarberg/ascii2mathml#readme */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ascii2mathml = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ascii2mathml;

var _parser = require("./lib/parser");

var _parser2 = _interopRequireDefault(_parser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ascii2mathml(asciimath, options) {

  // Curry
  if (typeof asciimath === "object") {
    return function (str, options2) {
      let opts = Object.assign({}, asciimath, options2);
      return ascii2mathml(str, opts);
    };
  }

  options = typeof options === "object" ? options : {};
  options.annotate = options.annotate || false;
  options.bare = options.bare || false;
  options.display = options.display || "inline";
  options.standalone = options.standalone || false;
  options.dir = options.dir || "ltr";

  options.decimalMark = options.decimalMark || ".";
  options.colSep = options.colSep || ",";
  options.rowSep = options.rowSep || ";";

  if (options.decimalMark === "," && options.colSep === ",") {
    options.colSep = ";";
  }
  if (options.colSep === ";" && options.rowSep === ";") {
    options.rowSep = ";;";
  }

  if (options.bare) {
    if (options.standalone) {
      throw new Error("Can't output a valid HTML without a root <math> element");
    }
    if (options.display && options.display.toLowerCase() !== "inline") {
      throw new Error("Can't display block without root element.");
    }
    if (options.dir && options.dir.toLowerCase() !== "ltr") {
      throw new Error("Can't have right-to-left direction without root element.");
    }
  }

  const parse = (0, _parser2.default)(options);
  let out;

  const math = options.bare ? expr => expr : expr => `<math${options.display !== "inline" ? ` display="${options.display}"` : ""}${options.dir !== "ltr" ? ` dir="${options.dir}"` : ""}>${expr}</math>`;

  if (options.annotate) {
    // Make sure the all presentational part is the first element
    let parsed = parse(asciimath.trim(), ""),
        mathml = parsed === _parser2.default.getlastel(parsed) ? parsed : `<mrow>${parsed}</mrow>`;

    out = math("<semantics>" + mathml + '<annotation encoding="application/AsciiMath">' + asciimath + "</annotation>" + "</semantics>");
  } else {
    out = math(parse(asciimath.trim(), ""));
  }

  if (options.standalone) {
    out = "<!DOCTYPE html><html><head><title>" + asciimath + "</title></head>" + "<body>" + out + "</body></html>";
  }

  return out;
}

},{"./lib/parser":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Numbers
// =======

const numbers = {};
const digitRange = "[\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE" + "\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9" + "\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9" + "\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2" + "\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59" + "\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C" + "\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819" + "\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99" + "\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59" + "\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u218B" + "\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD" + "\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195" + "\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF" + "零一二三四五六七八九十百千万億兆京垓𥝱秭穣溝澗正載割分厘毛糸忽微繊沙塵埃" + "\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835" + "\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9" + "\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]";
const digitRE = new RegExp(digitRange);

Object.defineProperties(numbers, {
  digitRange: { value: digitRange },
  digitRE: { value: digitRE },
  isdigit: { value: char => char.match(digitRE) }
});

// Identifiers
// ===========

const funs = ["sin", "cos", "tan", "csc", "sec", "cot", "sinh", "cosh", "tanh", "log", "ln", "det", "dim", "lim", "mod", "gcd", "lcm", "min", "max"];

const identifiers = {
  // Greek uppercase
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",

  // Greek lowercase
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ɛ",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",

  // Special symbols
  "oo": "∞",
  "O/": "∅",

  // Blackboard
  CC: "ℂ",
  NN: "ℕ",
  QQ: "ℚ",
  RR: "ℝ",
  ZZ: "ℤ"
};

funs.forEach(function (fun) {
  identifiers[fun] = fun;
});

Object.defineProperty(identifiers, "contains", {
  value: function (char) {
    return typeof identifiers[char] !== "undefined";
  }
});

Object.defineProperty(identifiers, "funs", {
  value: funs
});

Object.defineProperty(identifiers, "isfun", {
  value: function (str) {
    return funs.indexOf(str) >= 0;
  }
});

// Operators
// =========

const operators = {
  // Operational
  "*": "·",
  "**": "∗",
  "***": "⋆",
  "//": "/",
  "|": "|",
  ":": ":",
  "'": "′",
  "''": "″",
  "'''": "‴",
  "''''": "⁗",
  "xx": "×",
  "-:": "÷",
  "|><": "⋉",
  "><|": "⋊",
  "|><|": "⋈",
  "@": "∘",
  "o+": "⊕",
  "ox": "⊗",
  "o.": "⊙",
  "!": "!",
  "sum": "∑",
  "prod": "∏",
  "^^": "∧",
  "^^^": "⋀",
  "vv": "∨",
  "vvv": "⋁",
  "nn": "∩",
  "nnn": "⋂",
  "uu": "∪",
  "uuu": "⋃",

  // Miscellaneous
  "int": "∫",
  "oint": "∮",
  "dint": "∬",
  "+-": "±",
  "del": "∂",
  "grad": "∇",
  "aleph": "ℵ",
  "/_": "∠",
  "diamond": "⋄",
  "square": "□",
  "|__": "⌊",
  "__|": "⌋",
  "|~": "⌈",
  "~|": "⌉",

  // Relational
  "=": "=",
  "!=": "≠",
  "<": "&lt;",
  ">": "&gt;",
  "<=": "≤",
  ">=": "≥",
  "-<": "≺",
  "-<=": "⪯",
  ">-": "≻",
  ">-=": "⪰",
  "in": "∈",
  "!in": "∉",
  "sub": "⊂",
  "sup": "⊃",
  "sube": "⊆",
  "supe": "⊇",
  "-=": "≡",
  "==": "≡",
  "~=": "≅",
  "~~": "≈",
  "prop": "∝",

  // Arrows
  "<-": "←",
  "->": "→",
  "=>": "⇒",
  "<=>": "⇔",
  "|->": "↦",
  ">->": "↣",
  "->>": "↠",
  ">->>": "⤖",
  "uarr": "↑",
  "darr": "↓",
  "larr": "←",
  "rarr": "→",
  "harr": "↔",
  "lArr": "⇐",
  "rArr": "⇒",
  "hArr": "⇔",
  "iff": "⇔",

  // Punctuations
  ",": ",",
  ":.": "∴",
  "...": "…",
  "cdots": "⋯",
  "ddots": "⋱",
  "vdots": "⋮",

  // Logical
  "if": "if",
  "otherwise": "otherwise",
  "and": "and",
  "or": "or",
  "not": "¬",
  "AA": "∀",
  "EE": "∃",
  "_|_": "⊥",
  "TT": "⊤",
  "|--": "⊢",
  "|==": "⊨"
};

Object.defineProperty(operators, "contains", {
  value: function (char) {
    return typeof operators[char] !== "undefined";
  }
});

Object.defineProperty(operators, "get", {
  value: function (char) {
    return operators[char] || char;
  }
});

Object.defineProperty(operators, "regexp", {
  value: new RegExp("(" + Object.keys(operators).sort(function (a, b) {
    return b.length - a.length;
  }).map(regexpEscape).join("|") + "|[+\-<=>|~¬±×÷ϐϑϒϕϰϱϴϵ϶؆؇؈‖′″‴⁀⁄⁒\u2061-\u2064" + "\u207A-\u207E\u208A-\u208E★☆♠♡♢♣♭♮♯﬩\uFF61-\uFF68" + "＋＜＝＞＼＾｜～￢￩￪￫￬" + "\u2200-\u22FF\u2A00-\u2AFF\u27C0-\u27E5\u2980-\u2982" + "\u2999-\u29FF\u2301-\u23FF\u25A0-\u25FF\u2B00-\u2BFF" + "\u2190-\u21FF\u27F0-\u27FF\u2900-\u297F\u20D0-\u20EF]" + ")")
});

function regexpEscape(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

// Groupings
// =========

const groupings = {
  open: { "(:": "⟨", "{:": "" },
  close: { ":)": "⟩", ":}": "" },
  complex: {
    abs: { open: "|", close: "|" },
    floor: { open: "⌊", close: "⌋" },
    ceil: { open: "⌈", close: "⌉" },
    norm: { open: "∥", close: "∥" }
  }
};

Object.defineProperty(groupings.open, "regexp", {
  value: /([[⟦⟨⟪⟬⟮⦃⦅⦇⦉⦋⦍⦏⦑⦓⦕⦗]|[({]:?)/
});

Object.defineProperty(groupings.close, "regexp", {
  value: /([\]⟧⟩⟫⟭⟯⦄⦆⦈⦊⦌⦎⦐⦒⦔⦖⦘]|:?[)}])/
});

Object.defineProperty(groupings.open, "get", {
  value: function (str) {
    const match = groupings.open[str];
    return typeof match === "string" ? match : str;
  }
});

Object.defineProperty(groupings.close, "get", {
  value: function (str) {
    const match = groupings.close[str];
    return typeof match === "string" ? match : str;
  }
});

Object.defineProperty(groupings.complex, "contains", {
  value: function (str) {
    return Object.keys(groupings.complex).indexOf(str) >= 0;
  }
});

Object.defineProperty(groupings.complex, "get", {
  value: function (str) {
    return groupings.complex[str];
  }
});

Object.freeze(groupings.open);
Object.freeze(groupings.close);
Object.freeze(groupings.complex);

// Font
// ====

const fonts = {
  rm: "normal",
  bf: "bold",
  it: "italic",
  bb: "double-struck",
  cc: "script",
  tt: "monospace",
  fr: "fraktur",
  sf: "sans-serif"
};

Object.defineProperty(fonts, "get", {
  value: function (str) {
    return fonts[str];
  }
});

Object.defineProperty(fonts, "regexp", {
  value: new RegExp("(" + Object.keys(fonts).join("|") + ")")
});

// Accents
// =======

const accents = {
  hat: { type: "over", accent: "^" },
  bar: { type: "over", accent: "‾" },
  ul: { type: "under", accent: "_" },
  vec: { type: "over", accent: "→" },
  dot: { type: "over", accent: "⋅" },
  ddot: { type: "over", accent: "⋅⋅" },
  tilde: { type: "over", accent: "˜" },
  cancel: { type: "enclose", attrs: { notation: "updiagonalstrike" } }
};

Object.defineProperty(accents, "contains", {
  value: function (str) {
    return Object.keys(accents).indexOf(str) >= 0;
  }
});

Object.defineProperty(accents, "get", {
  value: function (str) {
    return accents[str];
  }
});

Object.defineProperty(accents, "regexp", {
  value: new RegExp("(" + Object.keys(accents).join("|") + ")")
});

exports.numbers = numbers;
exports.identifiers = identifiers;
exports.operators = operators;
exports.groupings = groupings;
exports.fonts = fonts;
exports.accents = accents;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _syntax = require("./syntax");

var _syntax2 = _interopRequireDefault(_syntax);

var _lexicon = require("./lexicon");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function tag(tagname) {
  return function fn(content, attr) {
    if (typeof content === "object") {
      // Curry
      return function (str) {
        return fn(str, content);
      };
    }

    if (typeof attr !== "object") {
      return `<${tagname}>${content}</${tagname}>`;
    } else {

      let attrstr = Object.keys(attr).map(function (key) {
        return `${key}="${attr[key]}"`;
      }).join(" ");

      return `<${tagname} ${attrstr}>${content}</${tagname}>`;
    }
  };
}

const mi = tag("mi"),
      mn = tag("mn"),
      mo = tag("mo"),
      mfrac = tag("mfrac"),
      msup = tag("msup"),
      msub = tag("msub"),
      msubsup = tag("msubsup"),
      munder = tag("munder"),
      mover = tag("mover"),
      munderover = tag("munderover"),
      menclose = tag("menclose"),
      mrow = tag("mrow"),
      msqrt = tag("msqrt"),
      mroot = tag("mroot"),
      mfenced = tag("mfenced"),
      mtable = tag("mtable"),
      mtr = tag("mtr"),
      mtd = tag("mtd");

function parser(options) {

  const decimalMarkRE = options.decimalMark === "." ? "\\." : options.decimalMark,
        numberRegexp = new RegExp(`^${_lexicon.numbers.digitRange}+(${decimalMarkRE}${_lexicon.numbers.digitRange}+)?`),
        colsplit = splitby(options.colSep),
        rowsplit = splitby(options.rowSep),
        newlinesplit = splitby("\n");

  function splitby(sep) {
    return function (str) {
      let split = [],
          inners = 0,
          index = 0;

      for (let i = 0; i < str.length; i += 1) {
        let rest = str.slice(i),
            char = str[i];
        if (rest.startsWith(sep) && !str.slice(0, i).match(/\\(\\{2})*$/)) {
          if (inners === 0) {
            split.push(str.slice(index, i));
            index = i + sep.length;
          }
        } else if (char.match(_lexicon.groupings.open.regexp)) {
          inners += 1;
        } else if (char.match(_lexicon.groupings.close.regexp)) {
          inners -= 1;
        }
      }

      split.push(str.slice(index));

      return split;
    };
  }

  const parse = function parse(ascii, mathml, space, grouped) {

    if (!ascii) {
      return mathml;
    }

    if (ascii.match(/^\s/)) {
      // Dont include the space it if there is a binary infix becoming
      // a prefix
      if (ascii.match(/^\s+(\/[^\/]|^[^\^]|_[^_|])/)) {
        return parse(ascii.trim(), mathml, true);
      }

      // Count the number of leading spaces
      let spaces = ascii.match(/^ +/),
          spacecount = spaces ? spaces[0].length : 0;

      if (spacecount > 1) {
        // spacewidth is a linear function of spacecount
        let spaceel = `<mspace width="${spacecount - 1}ex" />`;

        return parse(ascii.trim(), mathml + spaceel, true);
      }

      return parse(ascii.trim(), mathml, true);
    }

    let [el, rest] = parseone(ascii, grouped);

    // ## Binary infixes ##

    // ### Fraction ###
    if ((rest && rest.trimLeft().startsWith("/") || rest.trimLeft().startsWith("./")) && !rest.trimLeft().match(/^\.?\/\//)) {

      [el, rest] = splitNextFraction(el, rest);
    }

    return parse(rest, mathml + el, false);
  };

  function parsegroup(ascii) {
    // Takes one asciiMath string and returns mathml in one group
    if (ascii.trim().length === 0) {
      return "";
    }
    let mathml = parse(ascii, "", false, true);

    return mathml === getlastel(mathml) ? mathml : mrow(mathml);
  }

  function parseone(ascii, grouped, lastel) {
    /**
     Return a split of the first element parsed to MathML and the rest
     of the string unparsed.
     */

    // TODO: split this up into smaller more readable code

    if (!ascii) {
      return ["", ""];
    }

    let el, rest;

    let head = ascii[0],
        tail = ascii.slice(1),
        nextsymbol = head + (tail.match(/^[A-Za-z]+/) || "");

    if (ascii.startsWith("sqrt")) {
      // ## Roots ##

      let split = parseone(ascii.slice(4).trim(), grouped);

      el = msqrt(split[0] ? removeSurroundingBrackets(split[0]) : mrow(""));
      rest = split[1];
    } else if (ascii.startsWith("root")) {

      let one = parseone(ascii.slice(4).trimLeft(), grouped),
          index = one[0] ? removeSurroundingBrackets(one[0]) : mrow(""),
          two = parseone(one[1].trimLeft(), grouped),
          base = two[0] ? removeSurroundingBrackets(two[0]) : mrow("");

      el = mroot(base + index);
      rest = two[1];
    } else if (head === "\\" && ascii.length > 1) {
      // ## Forced opperator ##

      if (ascii[1].match(/[(\[]/)) {
        let stop = findmatching(tail);
        el = mo(ascii.slice(2, stop));
        rest = ascii.slice(stop + 1);
      } else {
        el = mo(ascii[1]);
        rest = ascii.slice(2);
      }
    } else if (_lexicon.accents.contains(nextsymbol)) {

      // ## Accents ##

      let accent = _lexicon.accents.get(nextsymbol),
          next = ascii.slice(nextsymbol.length).trimLeft(),
          ijmatch = next.match(/^\s*\(?([ij])\)?/),
          split = parseone(next);

      switch (accent.type) {
        // ## Accents on top ##
        case "over":
          if (ijmatch) {
            // use non-dotted i and j glyphs as to not clutter
            el = mover(mi(ijmatch[1] === "i" ? "ı" : "ȷ") + mo(accent.accent, { accent: true }));
            rest = next.slice(ijmatch[0].length);
          } else {
            el = mover(removeSurroundingBrackets(split[0]) + mo(accent.accent, { accent: true }));
            rest = split[1];
          }
          break;
        // ## Accents below ##
        case "under":
          el = munder(removeSurroundingBrackets(split[0]) + mo(accent.accent));
          rest = split[1];
          break;
        // ## Enclosings
        case "enclose":
          el = menclose(removeSurroundingBrackets(split[0]), accent.attrs);
          rest = split[1];
          break;
        default:
          throw new Error("Invalid config for accent " + nextsymbol);
      }
    } else if (_syntax2.default.isfontCommand(ascii)) {

      // ## Font Commands ##

      let split = _syntax2.default.splitfont(ascii);

      el = tag(split.tagname)(split.text, split.font && { mathvariant: split.font });
      rest = split.rest;
    } else if (_lexicon.groupings.complex.contains(nextsymbol)) {

      // ## Complex groupings ##

      let grouping = _lexicon.groupings.complex.get(nextsymbol),
          next = ascii.slice(nextsymbol.length).trimLeft(),
          split = parseone(next);

      el = mfenced(removeSurroundingBrackets(split[0]), grouping);
      rest = split[1];
    } else if (_syntax2.default.isgroupStart(ascii) || _syntax2.default.isvertGroupStart(ascii)) {

      // ## Groupings ##

      let [, open, group, close, after] = _syntax2.default.isgroupStart(ascii) ? _syntax2.default.splitNextGroup(ascii) : _syntax2.default.splitNextVert(ascii);

      rest = _lexicon.groupings.open.get(after);
      let rows = function () {
        let lines = newlinesplit(group);
        return lines.length > 1 ? lines : rowsplit(group);
      }();

      if (_syntax2.default.ismatrixInterior(group.trim(), options.colSep)) {

        // ### Matrix ##

        if (group.trim().endsWith(options.colSep)) {
          // trailing row break
          group = group.trimRight().slice(0, -1);
        }

        let cases = open === "{" && close === "",
            table = parsetable(group, cases && { columnalign: "center left" });

        el = mfenced(table, { open: open, close: close });
      } else if (rows.length > 1) {

        // ### Column vector ###

        if (rows.length === 2 && open === "(" && close === ")") {

          // #### Binomial Coefficient ####

          // Experimenting with the binomial coefficient
          // Perhaps I'll remove this later
          let binom = mfrac(rows.map(parsegroup).join(""), {
            linethickness: 0
          });

          el = mfenced(binom, { open: open, close: close });
        } else {

          // #### Single column vector ####

          let vector = rows.map(colsplit);

          if (last(vector).length === 1 && last(vector)[0].match(/^\s*$/)) {
            // A trailing rowbreak
            vector = vector.slice(0, -1);
          }

          let matrix = vector.map(function (row) {
            return mtr(row.map(compose(mtd, parsegroup)).join(""));
          }).join("");

          el = mfenced(mtable(matrix), { open: open, close: close });
        }
      } else {

        // ### A fenced group ###

        let cols = colsplit(group),
            els = cols.map(parsegroup).join(""),
            attrs = { open: open, close: close };

        if (options.colSep !== ",") {
          attrs.separators = options.colSep;
        }
        el = mfenced(els, attrs);
      }
    } else if (!grouped && _syntax2.default.isgroupable(ascii, options)) {

      // ## Whitespace ##

      // treat whitespace separated subexpressions as a group
      let split = splitNextWhitespace(ascii);

      el = parsegroup(split[0]);
      rest = split[1];
    } else if (_lexicon.numbers.isdigit(head)) {

      // ## Number ##

      let number = ascii.match(numberRegexp)[0];

      el = mn(number);
      rest = tail.slice(number.length - 1);
    } else if (ascii.match(/^#`[^`]+`/)) {

      // ## Forced number ##

      let number = ascii.match(/^#`([^`]+)`/)[1];
      el = mn(number);
      rest = ascii.slice(number.length + 3);
    } else if (ascii.match(new RegExp("^" + _lexicon.operators.regexp.source)) && !_lexicon.identifiers.contains(nextsymbol)) {

      // ## Operators ##

      let [op, next] = _syntax2.default.splitNextOperator(ascii),
          derivative = ascii.startsWith("'"),
          prefix = contains(["∂", "∇"], op),
          stretchy = contains(["|"], op),
          mid = ascii.startsWith("| "),
          attr = {};
      if (derivative) {
        attr.lspace = 0;attr.rspace = 0;
      }
      if (prefix) {
        attr.rspace = 0;
      }
      if (stretchy) {
        attr.stretchy = true;
      }
      if (mid) {
        attr.lspace = "veryverythickmathspace";
        attr.rspace = "veryverythickmathspace";
      }

      el = mo(op, !isempty(attr) && attr);
      rest = next;
    } else if (_lexicon.identifiers.contains(nextsymbol)) {

      // Perhaps a special identifier character
      let ident = _lexicon.identifiers[nextsymbol];

      // Uppercase greeks are roman font variant
      let uppercase = ident.match(/[\u0391-\u03A9\u2100-\u214F\u2200-\u22FF]/);
      el = uppercase ? mi(ident, { mathvariant: "normal" }) : mi(ident);
      rest = tail.slice(nextsymbol.length - 1);
    } else if (head === "O" && tail[0] === "/") {
      // The special case of the empty set. I suppose there is no
      // dividing by the latin capital letter O
      el = mi(_lexicon.identifiers["O/"], { mathvariant: "normal" });
      rest = tail.slice(1);
    } else {
      el = mi(head);
      rest = tail;
    }

    if (rest && rest.trimLeft().match(/\.?[\^_]/)) {

      if ((lastel ? !lastel.match(/m(sup|over)/) : true) && rest.trim().startsWith("_") && (rest.trim().length <= 1 || !rest.trim()[1].match(/[|_]/))) {

        // ### Subscript ###
        [el, rest] = splitNextSubscript(el, rest);
      } else if (lastel !== "mover" && rest.trim().startsWith("._") && (rest.trim().length <= 2 || !rest.trim()[2].match(/[|_]/))) {

        // ### Underscript ###
        [el, rest] = splitNextUnderscript(el, rest);
      } else if ((lastel ? !lastel.match(/m(sub|under)/) : true) && rest.trim().startsWith("^") && (rest.trim().length <= 1 || rest.trim()[1] !== "^")) {

        // ### Superscript ###
        [el, rest] = splitNextSuperscript(el, rest);
      } else if (lastel !== "munder" && rest.trim().startsWith(".^") && (rest.trim().length <= 2 || rest.trim()[2] !== "^")) {

        // ### Overscript ###
        [el, rest] = splitNextOverscript(el, rest);
      }
    }

    return [el, rest];
  }

  function splitNextSubscript(el, rest) {
    let next = parseone(rest.trim().slice(1).trim(), true, "msub"),
        sub = next[0] ? removeSurroundingBrackets(next[0]) : mrow("");
    let ml,
        ascii = next[1];

    // ### Supersubscript ###
    if (ascii && ascii.trim().startsWith("^") && (ascii.trim().length <= 1 || !ascii.trim()[1] !== "^")) {
      let next2 = parseone(ascii.trim().slice(1).trim(), true),
          sup = next2[0] ? removeSurroundingBrackets(next2[0]) : mrow(""),
          tagfun = _syntax2.default.shouldGoUnder(el) ? munderover : msubsup;
      ml = tagfun(el + sub + sup);
      ascii = next2[1];
    } else {
      let tagfun = _syntax2.default.shouldGoUnder(el) ? munder : msub;
      ml = tagfun(el + sub);
    }

    return [ml, ascii];
  }

  function splitNextSuperscript(el, rest) {
    let next = parseone(rest.trim().slice(1).trim(), true, "msup"),
        sup = next[0] ? removeSurroundingBrackets(next[0]) : mrow("");
    let ml,
        ascii = next[1];

    // ### Super- subscript ###
    if (ascii.trim().startsWith("_") && (ascii.trim().length <= 1 || !ascii.trim()[1].match(/[|_]/))) {
      let next2 = parseone(ascii.trim().slice(1).trim(), true),
          sub = next2[0] ? removeSurroundingBrackets(next2[0]) : mrow(""),
          tagfun = _syntax2.default.shouldGoUnder(el) ? munderover : msubsup;
      ml = tagfun(el + sub + sup);
      ascii = next2[1];
    } else {
      let tagfun = _syntax2.default.shouldGoUnder(el) ? mover : msup;
      ml = tagfun(el + sup);
    }

    return [ml, ascii];
  }

  function splitNextUnderscript(el, rest) {
    let next = parseone(rest.trim().slice(2).trim(), true, "munder"),
        under = next[0] ? removeSurroundingBrackets(next[0]) : mrow("");
    let ml,
        ascii = next[1];

    // ### Under- overscript ###
    let overmatch = ascii.match(/^(\.?\^)[^\^]/);
    if (overmatch) {
      let next2 = parseone(ascii.trim().slice(overmatch[1].length).trim(), true),
          over = next2[0] ? removeSurroundingBrackets(next2[0]) : mrow("");
      ml = munderover(el + under + over);
      ascii = next2[1];
    } else {
      ml = munder(el + under);
    }

    return [ml, ascii];
  }

  function splitNextOverscript(el, rest) {
    let next = parseone(rest.trim().slice(2).trim(), true, "mover"),
        over = next[0] ? removeSurroundingBrackets(next[0]) : mrow("");
    let ml,
        ascii = next[1];

    // ### Under- overscript ###
    let undermatch = ascii.match(/^(\.?_)[^_|]/);
    if (undermatch) {
      let next2 = parseone(ascii.trim().slice(undermatch[1].length).trim(), true),
          under = next2[0] ? removeSurroundingBrackets(next2[0]) : mrow("");
      ml = munderover(el + under + over);
      ascii = next2[1];
    } else {
      ml = mover(el + over);
    }

    return [ml, ascii];
  }

  function splitNextFraction(el, rest) {
    let bevelled = rest.trim().startsWith("./"),
        rem = rest.trim().slice(bevelled ? 2 : 1);
    let next, ml, ascii;
    if (rem.startsWith(" ")) {
      let split = rem.trim().split(" ");
      next = parsegroup(split[0]);
      ascii = rem.trimLeft().slice(split[0].length + 1);
    } else {
      [next, ascii] = parseone(rem);
    }
    next = next || mrow("");
    ml = mfrac(removeSurroundingBrackets(el) + removeSurroundingBrackets(next), bevelled && { bevelled: true });

    if (ascii && ascii.trim().startsWith("/") || ascii.trim().startsWith("./")) {
      return splitNextFraction(ml, ascii);
    }
    return [ml, ascii];
  }

  function splitNextWhitespace(str) {
    const re = new RegExp(`(\\s|${options.colSep}|${options.rowSep}|$)`);
    let match = str.match(re),
        head = str.slice(0, match.index),
        sep = match[0],
        tail = str.slice(match.index + 1);

    let next = head,
        rest = sep + tail;

    if (!_syntax2.default.isgroupStart(tail.trim()) && _syntax2.default.endsInFunc(head)) {
      let newsplit = splitNextWhitespace(tail);
      next += sep + newsplit[0];
      rest = newsplit[1];
    } else if (head.match(/root$/)) {
      let split1 = splitNextWhitespace(tail),
          split2 = splitNextWhitespace(split1[1].trimLeft());
      next += sep + split1[0] + " " + split2[0];
      rest = sep + split2[1];
    }
    return [next, rest];
  }

  function parsetable(matrix, attrs) {
    let rows = function () {
      let lines = colsplit(matrix);
      return lines.length > 1 ? lines : newlinesplit(matrix);
    }().map(function (el) {
      return el.trim().slice(1, -1);
    });

    return mtable(rows.map(parserow).join(""), attrs);
  }

  function parserow(row, acc) {
    acc = typeof acc === "string" ? acc : "";
    if (!row || row.length === 0) {
      return mtr(acc);
    }

    let [mathml, rest] = parsecell(row.trim(), "");
    return parserow(rest.trim(), acc + mathml);
  }

  function parsecell(cell, acc) {
    if (!cell || cell.length === 0) {
      return [mtd(acc), ""];
    }
    if (cell[0] === options.colSep) {
      return [mtd(acc), cell.slice(1).trim()];
    }

    let [mathml, rest] = parseone(cell);
    return parsecell(rest.trim(), acc + mathml);
  }

  return parse;
}

function splitlast(mathml) {
  /**
   Return a pair of all but last eliment and the last eliment
   */
  let lastel = getlastel(mathml),
      prewels = mathml.slice(0, mathml.lastIndexOf(lastel));

  return [prewels, lastel];
}

function removeSurroundingBrackets(mathml) {
  let inside = mathml.replace(/^<mfenced[^>]*>/, "").replace(/<\/mfenced>$/, "");
  if (splitlast(inside)[1] === inside) {
    return inside;
  } else {
    return mrow(inside);
  }
}

function getlastel(xmlstr) {
  // This breaks the linearity of the implimentation
  // optimation possible, perhaps an XML parser
  let tagmatch = xmlstr.match(/<\/(m[a-z]+)>$/);
  if (!tagmatch) {
    let spacematch = xmlstr.match(/<mspace\s*([a-z]+="[a-z]")*\s*\?>/);
    if (spacematch) {
      let i = spacematch.match[0].length;
      return xmlstr.slice(i);
    } else {
      return "";
    }
  }

  let tagname = tagmatch[1];

  let i = xmlstr.length - (tagname.length + 3),
      inners = 0;
  for (i; i >= 0; i -= 1) {
    if (xmlstr.slice(i).startsWith(`<${tagname}`)) {
      if (inners === 0) {
        break;
      }
      inners -= 1;
    }
    if (xmlstr.slice(i - 2).startsWith(`</${tagname}`)) {
      inners += 1;
    }
  }

  return xmlstr.slice(i);
}

function findmatching(str) {
  let open = str[0],
      close = open === "(" ? ")" : open === "[" ? "]" : str[0];

  let inners = 0,
      index = 0;
  for (let i = 0; i < str.length; i += 1) {
    let char = str[i];
    index += 1;
    if (char === close) {
      inners -= 1;
      if (inners === 0) {
        break;
      }
    } else if (char === open) {
      inners += 1;
    }
  }
  return index;
}

function isempty(obj) {
  return Object.keys(obj).length === 0;
}

function contains(arr, el) {
  return arr.indexOf(el) >= 0;
}

function last(arr) {
  return arr.slice(-1)[0];
}

function compose(f, g) {
  return function (x) {
    return f(g(x));
  };
}

parser.getlastel = getlastel;

exports.default = parser;

},{"./lexicon":2,"./syntax":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lexicon = require("./lexicon");

function splitNextOperator(str) {
  const re = new RegExp("^" + _lexicon.operators.regexp.source),
        match = re.exec(str),
        op = match[0];

  return [_lexicon.operators.get(op), str.slice(op.length)];
}

function isgroupStart(str) {
  let re = new RegExp("^" + _lexicon.groupings.open.regexp.source);
  return str.match(re);
}

function isgroupable(str, options) {
  let re = new RegExp(`^[0-9A-Za-z+\\-!]{2,}(\\s|${options.colSep}|${options.rowSep})`);
  return str.match(re);
}

function ismatrixInterior(str, colSep) {
  return isgroupStart(str) && function () {
    let rest = splitNextGroup(str)[4];
    return rest.trim().startsWith(colSep) || rest.match(/^\s*\n/) && isgroupStart(rest.trim());
  }();
}

const funcEndingRe = new RegExp("(" + _lexicon.identifiers.funs.concat(Object.keys(_lexicon.accents)).concat(["sqrt"]).sort(function (a, b) {
  return a.length - b.length;
}).join("|") + ")$");

function endsInFunc(str) {
  return str.match(funcEndingRe);
}

function splitNextGroup(str) {
  /** Split the string into `[before, open, group, close, after]` */

  const openRE = new RegExp("^" + _lexicon.groupings.open.regexp.source),
        closeRE = new RegExp("^" + _lexicon.groupings.close.regexp.source);

  let start,
      stop,
      open,
      close,
      inners = 0,
      i = 0;

  while (i < str.length) {
    let rest = str.slice(i),
        openMatch = rest.match(openRE),
        closeMatch = rest.match(closeRE);

    if (openMatch) {
      if (typeof start !== "number") {
        start = i;
        open = openMatch[0];
      }
      inners += 1;
      i += openMatch[0].length;
    } else if (closeMatch) {
      inners -= 1;
      if (inners === 0) {
        close = closeMatch[0];
        stop = i + (close.length - 1);
        break;
      }
      i += closeMatch[0].length;
    } else {
      i += 1;
    }
  }

  if (!open) {
    return null;
  }

  return [start === 0 ? "" : str.slice(0, start), _lexicon.groupings.open.get(open), str.slice(start + open.length, close ? stop - (close.length - 1) : str.length), close ? _lexicon.groupings.close.get(close) : "", stop ? str.slice(stop + 1) : ""];
}

function isvertGroupStart(str) {
  if (!str.startsWith("|")) {
    return false;
  }
  let split = splitNextVert(str);

  return split && split[0] === "";
}

function splitNextVert(str) {
  function retval(start, stop, double) {
    return [start === 0 ? "" : str.slice(0, start), double ? "‖" : "|", str.slice(start + (double ? 2 : 1), stop), double ? "‖" : "|", str.slice(stop + (double ? 2 : 1))];
  }

  let start = str.indexOf("|"),
      stop = start + 1,
      rest = str.slice(start + 1),
      double = rest.startsWith("|"),
      re = double ? /\|\|/ : /\|/;

  if (double) {
    rest = rest.slice(1);
    stop += 1;
  }

  if (rest.indexOf("|") === -1) {
    return null;
  }
  if (rest.match(/^\.?[_\^]/)) {
    return null;
  }

  while (rest.length > 0) {
    let split = splitNextGroup(rest),
        head = split ? split[0] : rest,
        tail = split ? split[4] : "",
        match = re.exec(head);

    if (match) {
      return retval(start, stop + match.index, double);
    }

    stop += split.slice(0, -1).map(dot("length")).reduce(plus);
    // adjust for slim brackets
    if (split[1] === "") {
      stop += 2;
    } else if (split[1] === "〈") {
      stop += 1;
    }
    if (split[3] === "") {
      stop += 2;
    } else if (split[3] === "〉") {
      stop += 1;
    }

    rest = tail;
  }

  return null;
}

function dot(attr) {
  return obj => obj[attr];
}

function plus(a, b) {
  return a + b;
}

// Fonts
// =====

function isforcedEl(reEnd) {
  let re = new RegExp("^(" + _lexicon.fonts.regexp.source + " ?)?" + reEnd);
  return str => re.exec(str);
}

const isforcedIdentifier = isforcedEl("(`)\\w+`");
const isforcedText = isforcedEl('(")');

function isfontCommand(str) {
  return isforcedIdentifier(str) || isforcedText(str);
}

function splitfont(ascii) {
  let typematch = isforcedIdentifier(ascii) || isforcedText(ascii),
      font = typematch && typematch[2],
      type = typematch && typematch[3],
      tagname = type === '"' ? "mtext" : type === "`" ? "mi" : "";

  let start = ascii.indexOf(type),
      stop = start + 1 + ascii.slice(start + 1).indexOf(type),
      fontvariant = start > 0 ? _lexicon.fonts.get(font) : "";

  return {
    tagname: tagname,
    text: ascii.slice(start + 1, stop),
    font: fontvariant,
    rest: ascii.slice(stop + 1)
  };
}

const underEls = ["<mi>lim</mi>", "<mo>∑</mo>", "<mo>∏</mo>"];
function shouldGoUnder(el) {
  return underEls.indexOf(el) >= 0;
}

const syntax = {
  endsInFunc: endsInFunc,
  isgroupStart: isgroupStart,
  isgroupable: isgroupable,
  isvertGroupStart: isvertGroupStart,
  splitNextGroup: splitNextGroup,
  splitNextVert: splitNextVert,
  splitNextOperator: splitNextOperator,
  ismatrixInterior: ismatrixInterior,
  isfontCommand: isfontCommand,
  splitfont: splitfont,
  shouldGoUnder: shouldGoUnder
};

exports.default = syntax;

},{"./lexicon":2}]},{},[1])(1)
});