// Swiss francs instead of euros for the two maths exercises
// "Rechnen mit dem Taschenrechner" (receipt) and "Einkaufen an der Kasse" (shop).
//
// The app code is minified and exists twice in the file (main app + the runtime that
// goes into HTML exports, built with different variable names), so every patch says how
// often it must match. Identifiers are matched with @ (any minified name), never by name.
// Display: "3.50 Fr." / "45 Rp."; speech: "3 Franken 50" / "45 Rappen".
// All prices are rounded to 5 Rappen, since there are no 1- and 2-Rappen coins.

const ID = String.raw`[\w$]+`;
// Build a global RegExp from a template where "@" stands for a minified identifier.
const re = (src) => new RegExp(src.replaceAll("@", ID), "g");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const patches = [
  // ---------- Shop "Einkaufen an der Kasse" (2 copies) ----------
  {
    what: "shop: coin and note values",
    find: re(String.raw`=\[1,2,5,10,20,50,100,200\],(@)=\[500,1e3,2e3,5e3,1e4,2e4\],`),
    to: "=[5,10,20,50,100,200,500],$1=[1e3,2e3,5e3,1e4,2e4],",
    count: 2,
  },
  {
    what: "shop: price level labels and hints",
    find: "[{value:`cent`,label:`Nur Cent`,hint:`Alles unter 1 € (35 ct) – ein Einkauf kostet höchstens 1 €.`},{value:`euro`,label:`Ganze Euro`,hint:`Preise von 1 € bis 9 €, ohne Cent.`},{value:`round`,label:`Glatte Preise`,hint:`Euro und 10-Cent-Schritte (1,50 €, 2,20 €).`},{value:`mixed`,label:`Euro und Cent`,hint:`Ladenpreise wie 1,49 € oder 2,85 €.`},{value:`bills`,label:`Nur Scheine`,hint:`Preise in 5-Euro-Schritten (5 €, 15 €, 40 €) – bezahlt wird mit Scheinen.`},{value:`high`,label:`Hohe Summen`,hint:`Teure Dinge von 20 € bis 500 € (129,99 €).`}]",
    to: "[{value:`cent`,label:`Nur Rappen`,hint:`Alles unter 1 Fr. (35 Rp.) – ein Einkauf kostet höchstens 1 Fr.`},{value:`euro`,label:`Ganze Franken`,hint:`Preise von 1 Fr. bis 9 Fr., ohne Rappen.`},{value:`round`,label:`Glatte Preise`,hint:`Franken und 10-Rappen-Schritte (1.50 Fr., 2.20 Fr.).`},{value:`mixed`,label:`Franken und Rappen`,hint:`Ladenpreise wie 1.45 Fr. oder 2.85 Fr.`},{value:`bills`,label:`Nur Noten`,hint:`Preise in 10-Franken-Schritten (10 Fr., 30 Fr., 60 Fr.) – bezahlt wird mit Noten.`},{value:`high`,label:`Hohe Summen`,hint:`Teure Dinge von 20 Fr. bis 500 Fr. (129.95 Fr.).`}]",
    count: 2,
  },
  {
    what: "shop: shop prices end in 5 instead of 9",
    find: re(String.raw`Math\.max\(5,Math\.random\(\)<\.6\?(@)-1:\1\)`),
    to: "Math.max(5,Math.random()<.6?$1-5:$1)",
    count: 1, // the price generator exists only in the main app
  },
  {
    what: "shop: high prices end in .95 instead of .99",
    find: "*100-(Math.random()<.5?1:Math.random()<.5?50:0)",
    to: "*100-(Math.random()<.5?5:Math.random()<.5?50:0)",
    count: 1, // the price generator exists only in the main app
  },
  {
    what: "shop: 'only notes' prices in 10-franc steps (5 Fr. is a coin)",
    find: re(String.raw`===\`bills\`\?(@)\(500,1e4,500\)`),
    to: "===`bills`?$1(1e3,2e4,1e3)",
    count: 1, // the price generator exists only in the main app
  },
  {
    what: "shop: every stored price rounded to 5 Rappen",
    find: re(String.raw`price:(@)\((@)\.price,1,1e7,100\)`),
    to: "price:Math.max(5,Math.round($1($2.price,1,1e7,100)/5)*5)",
    count: 2,
  },
  {
    what: "shop: price display",
    find: "<100?`${e} ct`:(t===`euro`||t===`bills`)&&e%100==0?`${e/100} €`:`${Math.floor(e/100)},${String(e%100).padStart(2,`0`)} €`}",
    to: "<100?`${e} Rp.`:(t===`euro`||t===`bills`)&&e%100==0?`${e/100} Fr.`:`${Math.floor(e/100)}.${String(e%100).padStart(2,`0`)} Fr.`}",
    count: 2,
  },
  {
    what: "shop: spoken amounts",
    find: "return t?n?`${t} Euro ${n}`:`${t} Euro`:`${n} Cent`}",
    to: "return t?n?`${t} Franken ${n}`:`${t} Franken`:`${n} Rappen`}",
    count: 2,
  },
  {
    what: "shop: names of coins and notes",
    find: re(String.raw`=(@)=>\1<100\?\`\$\{\1\} Cent\`:\1<500\?\`\$\{\1\/100\} Euro\`:\`\$\{\1\/100\}-Euro-Schein\`,(@)=\[\`null\``),
    to: "=$1=>$1<100?`${$1} Rappen`:$1<1e3?`${$1/100} Franken`:`${$1/100}-Franken-Note`,$2=[`null`",
    count: 2,
  },
  {
    what: "shop: coin/note boundary (5 Fr. is a coin)",
    find: re(String.raw`(@)=(@)<500,(@)=\1\?(@)\[\2\]\*3\.6\*`),
    to: "$1=$2<1e3,$3=$1?$4[$2]*3.6*",
    count: 4,
  },
  {
    what: "shop: coin/note spacing in the drawer",
    find: re(String.raw`<500\?12:9\)`),
    to: "<1e3?12:9)",
    count: 2,
  },
  {
    what: "shop: coin sizes (Swiss diameters, 5 Fr. slightly smaller to fit the drawer)",
    find: "={1:16.25,2:18.75,5:21.25,10:19.75,20:22.25,50:24.25,100:23.25,200:25.75}",
    to: "={5:17.15,10:19.15,20:21.05,50:18.2,100:23.2,200:25.5,500:27}",
    count: 2,
  },
  {
    what: "shop: coin colours (5 Rp. brass, all others silver)",
    find: re(String.raw`is-coin is-drawn\$\{(@)>=100\?\` is-euro\`:\1>=10\?\` is-gold\`:\`\`\}`),
    to: "is-coin is-drawn${$1===5?` is-gold`:` is-chf`}",
    count: 2,
  },
  {
    what: "shop: no double full stop after an amount ending in 'Fr.'/'Rp.'",
    find: re(String.raw`(\$\{@\(@\.paid,@\.level\)\})\.\`,said:`),
    to: "$1`,said:",
    count: 4,
  },
  {
    what: "shop: note label (small 'Fr.' so '1000 Fr.' fits on one line)",
    find: "} €</span>`",
    to: "}<small style=\"font-size:.62em;margin-left:.2em\">Fr.</small></span>`",
    count: 2,
  },
  {
    what: "shop: the 50-Rappen coin shows ½ like the real one",
    find: re(String.raw`let (@)=(@)<100\?\`\$\{\2\}\`:\`\$\{\2\/100\}\`;return`),
    to: "let $1=$2===50?`½`:$2<100?`${$2}`:`${$2/100}`;return",
    count: 2,
  },
  {
    what: "shop: customer says goodbye in Swiss style",
    find: "`Vielen Dank, das stimmt. Servus!`",
    to: "`Vielen Dank, das stimmt. Auf Wiedersehen!`",
    count: 4,
  },
  {
    what: "shop: Weggli instead of Semmel (bakery template)",
    find: re(String.raw`\{name:\`Semmel\`,price:45,g:\`f\`,pl:\`Semmeln\`,`),
    to: "{name:`Weggli`,price:45,g:`n`,pl:`Weggli`,",
    count: 2,
  },
  {
    what: "shop editor: Weggli instead of Semmel (bakery basket)",
    find: "{name:`Semmel`,price:45,arasaac:36501,g:`f`,pl:`Semmeln`}",
    to: "{name:`Weggli`,price:45,arasaac:36501,g:`n`,pl:`Weggli`}",
    count: 1,
  },
  {
    what: "shop: always draw coins and notes (stored pictures are euro pictograms)",
    find: re(String.raw`let (@)=(@)\.src\(\2\.s\.money\[String\((@)\)\]\)`),
    to: "let $1=null",
    count: 2,
  },
  {
    what: "shop: Swiss note colours, silver coins",
    find: re(String.raw`\.lh-sh-money\.n500\{background:#8f99a5\}`),
    to: ".lh-sh-money.is-drawn.is-chf{background:radial-gradient(circle,#f1f3f5 58%,#ced4da 60%);color:#343a40;border-color:#868e96}" +
      ".lh-sh-money.n1000{background:#e8b923!important;color:#3d2e00}" +
      ".lh-sh-money.n5000{background:#4caf6a!important}" +
      ".lh-sh-money.n10000{background:#4f86c6!important}" +
      ".lh-sh-money.n20000{background:#a0623a!important}",
    count: 2,
  },
  {
    what: "shop: 20 Fr. note red",
    find: re(String.raw`\.lh-sh-money\.n2000\{background:#4f86c6\}`),
    to: ".lh-sh-money.n2000{background:#e0645c}",
    count: 2,
  },

  // ---------- Shop editor (only in the main app) ----------
  {
    what: "shop editor: do not load euro pictograms for the money",
    find: re(String.raw`Object\.keys\((@)\)\.length<14`),
    to: "!1",
    count: 1,
  },
  {
    what: "shop editor: pictogram words (unused, kept consistent)",
    find: "word:e<100?`${e} Cent`:e<500?`${e/100} Euro`:`${e/100}-Euro-Schein`",
    to: "word:e<100?`${e} Rappen`:e<1e3?`${e/100} Franken`:`${e/100}-Franken-Note`",
    count: 1,
  },
  {
    what: "shop editor: price input accepts Fr./CHF/Rp.",
    find: "e.replace(/\\s|€/g,``).replace(`.`,`,`);if(/^\\d+ct$/i",
    to: "e.replace(/\\s|€|CHF|Fr\\.?/gi,``).replace(/Rp\\.?$/i,`ct`).replace(`.`,`,`);if(/^\\d+ct$/i",
    count: 1,
  },
  {
    what: "shop editor: price input unit",
    find: ".replace(/ €$/,``)",
    to: ".replace(/ Fr\\.$/,``)",
    count: 1,
  },
  {
    what: "shop editor: price input unit label",
    find: "!r.endsWith(`ct`)&&z(`span`,{children:`€`})",
    to: "!r.endsWith(`Rp.`)&&z(`span`,{children:`Fr.`})",
    count: 1,
  },

  // ---------- Receipt "Rechnen mit dem Taschenrechner" (2 copies) ----------
  {
    what: "receipt: price display",
    find: "return t===`cent`?`${e} ct`:t===`euro`?`${Math.round(e/100)} €`:`${Math.floor(e/100)},${String(e%100).padStart(2,`0`)} €`}",
    to: "return t===`cent`?`${e} Rp.`:t===`euro`?`${Math.round(e/100)} Fr.`:`${Math.floor(e/100)}.${String(e%100).padStart(2,`0`)} Fr.`}",
    count: 2,
  },
  {
    what: "receipt: unit next to the answer fields",
    find: "=e=>e===`cent`?`ct`:`€`",
    to: "=e=>e===`cent`?`Rp.`:`Fr.`",
    count: 2,
  },
  {
    what: "receipt: answer input accepts 12.45, 12,45, Fr., CHF, Rp.",
    find: ".replace(/\\s/g,``).replace(`€`,``).replace(/ct$/i,``).replace(`.`,`,`)",
    to: ".replace(/\\s/g,``).replace(/€|CHF|Fr\\.?/gi,``).replace(/(ct|Rp\\.?)$/i,``).replace(`.`,`,`)",
    count: 2,
  },
  {
    what: "receipt: shop prices rounded to 5 Rappen",
    find: re(String.raw`(@)=(@)===\`simple\`\?Math\.max\(10,Math\.round\(\1\/10\)\*10\):\1,`),
    to: "$1=$2===`simple`?Math.max(10,Math.round($1/10)*10):Math.max(5,Math.round($1/5)*5),",
    count: 2,
  },
  {
    what: "receipt: small (Rappen) prices rounded to 5",
    find: re(String.raw`price:Math\.min\(99,(@)\)`),
    to: "price:Math.min(95,Math.max(5,Math.round($1/5)*5))",
    count: 2,
  },
  {
    what: "receipt: stored prices rounded to 5 Rappen",
    find: re(String.raw`price:Math\.max\(0,Math\.min\(1e6,Math\.round\(Number\(([^()]+)\)\|\|0\)\)\)`),
    to: "price:Math.max(0,Math.min(1e6,Math.round((Number($1)||0)/5)*5))",
    count: 2,
  },

  {
    what: "receipt: Weggli instead of Semmeln",
    find: "[`Semmeln 6 Stück`,",
    to: "[`Weggli 6 Stück`,",
    count: 2,
  },
  {
    what: "receipt: Weggli instead of Semmel (small purchases)",
    find: "=[[`Semmel`,25,45],",
    to: "=[[`Weggli`,25,45],",
    count: 2,
  },
  {
    what: "receipt keypad: '.' key (the value is stored with ',' internally)",
    find: "[`,`,`,`],[`0`,`0`]",
    to: "[`.`,`,`],[`0`,`0`]",
    count: 2,
  },
  {
    what: "receipt: show the typed amount with '.'",
    find: re(String.raw`font-size="30" fill="\$\{(@)\}">\$\{(@)\((@)\)\}\$\{`),
    to: 'font-size="30" fill="${$1}">${$2($3.replace(`,`,`.`))}${',
    count: 2,
  },

  // ---------- Calculator (all pages; display only, it still computes and speaks with ',') ----------
  {
    what: "calculator: '.' key label",
    find: "[`,`,`,`,2,4,1,1]",
    to: "[`.`,`,`,2,4,1,1]",
    count: 2,
  },
  {
    what: "calculator: display with '.' (first draw)",
    find: re(String.raw`fill="#14532d">\$\{(@)\((@)\.shown\)\}</text>`),
    to: 'fill="#14532d">${$1($2.shown.replace(`,`,`.`))}</text>',
    count: 2,
  },
  {
    what: "calculator: display with '.' (live update)",
    find: re(String.raw`\.textContent=(@)\.shown,`),
    to: ".textContent=$1.shown.replace(`,`,`.`),",
    count: 2,
  },
  {
    what: "calculator: task line with '.'",
    find: re(String.raw`\$\{(@)\((@)\.acc\)\} \$\{\2\.op\}`),
    to: "${$1($2.acc).replace(`,`,`.`)} ${$2.op}",
    count: 4,
  },

  // ---------- Answer checking (all pages, 2 copies): understand Fr./CHF/Rp. ----------
  {
    what: "answer check: '3.50 Fr.', 'CHF 3.50', '3 Fr. 50 Rp.', '45 Rp.' count as money",
    find: ".replace(/½/g,`1/2`).replace(/\\.$/,``)",
    to: ".replace(/½/g,`1/2`).replace(/\\.$/,``)" +
      ".replace(/(\\d)['’](?=\\d{3})/g,`$1`)" + // Swiss thousands separator: 2'400 -> 2400
      ".replace(/^(?:chf|fr\\.?)(\\d+(?:[.,]\\d{1,2})?)$/,`$1€`)" +
      ".replace(/^(\\d+(?:[.,]\\d{1,2})?)(?:fr\\.?|chf|franken)$/,`$1€`)" +
      ".replace(/^(\\d+)(?:fr\\.?|franken)(\\d{1,2})(?:rp\\.?|rappen)?$/,`$1€$2ct`)" +
      ".replace(/^(\\d+)(?:rp\\.?|rappen)$/,`$1ct`)",
    count: 2,
  },

  // ---------- Worksheet "Rechnen mit Geld" (only in the main app) ----------
  {
    what: "money sheet: coins and notes",
    find: "qq=[1,2,5,10,20,50],Jq=[100,200],tFe=[500,1e3,2e3,5e3,1e4,2e4]",
    to: "qq=[5,10,20,50],Jq=[100,200,500],tFe=[1e3,2e3,5e3,1e4,2e4]",
    count: 1,
  },
  {
    what: "money sheet: smallest steps (5 Rp., notes from 10 Fr.) and Rappen up to 95",
    find: "Yq=e=>e.amounts===`cent`?99:e.max*100;",
    to: "Yq=e=>e.amounts===`cent`?95:e.max*100;",
    count: 1,
  },
  {
    what: "money sheet: smallest unit",
    find: "Zq=e=>e.amounts===`cent`?1:e.money===`notes`?500:e.amounts===`euro`?100:1",
    to: "Zq=e=>e.amounts===`cent`?5:e.money===`notes`?1e3:e.amounts===`euro`?100:5",
    count: 1,
  },
  {
    what: "money sheet: 'Geld legen' upper limit",
    find: "r.amounts===`cent`?99:Yq(r)*.6",
    to: "r.amounts===`cent`?95:Yq(r)*.6",
    count: 1,
  },
  {
    what: "money sheet: amount display",
    find: "return t.amounts===`cent`?`${e} ct`:t.amounts===`euro`||t.money===`notes`?`${n} €`:t.notation===`comma`?`${n},${nFe(r)} €`:n?r?`${n} € ${r} ct`:`${n} €`:`${r} ct`}",
    to: "return t.amounts===`cent`?`${e} Rp.`:t.amounts===`euro`||t.money===`notes`?`${n} Fr.`:t.notation===`comma`?`${n}.${nFe(r)} Fr.`:n?r?`${n} Fr. ${r} Rp.`:`${n} Fr.`:`${r} Rp.`}",
    count: 1,
  },
  {
    what: "money sheet: words for coins and notes",
    find: "nJ=e=>e<100?`${e} Cent`:e<500?`${e/100} Euro`:`${e/100}-Euro-Schein`",
    to: "nJ=e=>e<100?`${e} Rappen`:e<1e3?`${e/100} Franken`:`${e/100}-Franken-Note`",
    count: 1,
  },
  {
    what: "money sheet: Swiss coin sizes",
    find: "rJ={1:22,2:25.5,5:28.5,10:26.5,20:30,50:32.5,100:31,200:34.5}",
    to: "rJ={5:20,10:22,20:24,50:21,100:26,200:29.5,500:33}",
    count: 1,
  },
  {
    what: "money sheet: Swiss notes (10–200 Fr.)",
    find: "iJ={500:[120,62,`#8f99a5`,`#e5e8ec`],1e3:[125,65,`#e0645c`,`#fbdcd9`],2e3:[130,68,`#4f7fd1`,`#dbe6fa`],5e3:[135,70,`#f0943c`,`#fde6cf`],1e4:[140,73,`#4da56f`,`#d6efdf`],2e4:[146,73,`#d6ad2e`,`#f8eec8`]},aJ=e=>e>=500?",
    to: "iJ={1e3:[96,48,`#c99a06`,`#fbefc0`],2e3:[100,50,`#e0645c`,`#fbdcd9`],5e3:[104,52,`#4da56f`,`#d6efdf`],1e4:[108,54,`#4f7fd1`,`#dbe6fa`],2e4:[112,56,`#a0623a`,`#f1dfd2`]},aJ=e=>e>=1e3?",
    count: 1,
  },
  {
    what: "money sheet: change rows reserve the euro-sized width ('Fr.' is 2 characters longer than '€'), so the paid money doesn't cover 'zurück:'",
    find: "u=xq(Qq(Yq(r),r).length,24)+30;i.poly(",
    to: "u=xq(Qq(Yq(r),r).length-2,24)+30;i.poly(",
    count: 1,
  },
  {
    what: "money sheet: change rows answer box",
    find: "let m=xq(Qq(Yq(r),r).length,24);t.text(c+fJ-m-92",
    to: "let m=xq(Qq(Yq(r),r).length-2,24);t.text(c+fJ-m-92",
    count: 1,
  },
  {
    what: "money sheet: draw Swiss notes and coins (5 Rp. brass, others silver, ½ on 50 Rp.)",
    find: "if(t>=500){let[i,a,o,s]=iJ[t];e.rect(n,r,i,a,s,o,2.5,6),e.rect(n+6,r+6,i-12,a-12,`none`,o,1.2,4),e.circle(n+i-20,r+a/2,10,o),e.label(n+i/2-10,r+a/2+9,`${t/100} €`,22,o);return}let i=rJ[t],a=n+i,o=r+i;if(t===100||t===200){let[n,r]=t===100?[`#e0b42c`,`#cfd4da`]:[`#cfd4da`,`#e0b42c`];e.circle(a,o,i,n,`#8a6d1c`,1.5),e.circle(a,o,i*.68,r,`#8a8f96`,1),e.label(a,o+i*.24,`${t/100} €`,Math.round(i*.62),hq)}else{let n=t<10;e.circle(a,o,i,n?`#c97a3d`:`#e0b42c`,n?`#8a4a1c`:`#8a6d1c`,1.5),e.circle(a,o,i*.82,`none`,n?`#a35e2a`:`#b8901f`,1),e.label(a,o+i*.22,`${t} ct`,Math.round(i*.55),hq)}}",
    to: "if(t>=1e3){let[i,a,o,s]=iJ[t];e.rect(n,r,i,a,s,o,2.5,6),e.rect(n+6,r+6,i-12,a-12,`none`,o,1.2,4),e.circle(n+i-14,r+a/2,7,o),e.label(n+i/2-7,r+a/2+6,`${t/100} Fr.`,17,o);return}let i=rJ[t],a=n+i,o=r+i,g=t===5;e.circle(a,o,i,g?`#e0b42c`:`#dee2e6`,g?`#8a6d1c`:`#868e96`,1.5),e.circle(a,o,i*.82,`none`,g?`#b8901f`:`#adb5bd`,1),e.label(a,o+i*.22,t===50?`½ Fr.`:t>=100?`${t/100} Fr.`:`${t}`,Math.round(i*(t>=50?.46:.55)),hq)}",
    count: 1,
  },
  {
    what: "money sheet: Rappen in 'umrechnen'",
    find: "u=l?Qq(c,r):`${c} ct`,d=l?`${c} ct`:Qq(c,r)",
    to: "u=l?Qq(c,r):`${c} Rp.`,d=l?`${c} Rp.`:Qq(c,r)",
    count: 1,
  },
  {
    what: "money sheet: page title",
    find: "i=e.amounts===`cent`?`bis 1 €`:`bis ${e.max} €`,a=e.pics===`arasaac`?n:void 0",
    to: "i=e.amounts===`cent`?`bis 1 Fr.`:`bis ${e.max} Fr.`,a=void 0",
    count: 1,
  },
  ...[
    ["sample:`Münzen → 3,50 €`", "sample:`Münzen → 3.50 Fr.`"],
    ["sample:`2,70 € → einkreisen`", "sample:`2.70 Fr. → einkreisen`"],
    ["sample:`3,20 € mit 5 € bezahlt`", "sample:`3.20 Fr. mit 5 Fr. bezahlt`"],
    ["label:`Euro und Cent umrechnen`,title:`Euro und Cent`,sample:`3,50 € = ▢ ct`", "label:`Franken und Rappen umrechnen`,title:`Franken und Rappen`,sample:`3.50 Fr. = ▢ Rp.`"],
    ["hint:`nur bei Euro und Cent`,instruction:()=>`Rechne um: 1 € = 100 ct.`", "hint:`nur bei Franken und Rappen`,instruction:()=>`Rechne um: 1 Fr. = 100 Rp.`"],
    ["sample:`3,50 € + 1,20 € = ▢`", "sample:`3.50 Fr. + 1.20 Fr. = ▢`"],
    // settings dialog
    ["options:[{value:`cent`,label:`Nur Cent`},{value:`euro`,label:`Nur Euro`},{value:`mixed`,label:`Euro und Cent`}]", "options:[{value:`cent`,label:`Nur Rappen`},{value:`euro`,label:`Nur Franken`},{value:`mixed`,label:`Franken und Rappen`}]"],
    ["{value:`notes`,label:`Nur Scheine`},{value:`both`,label:`Münzen und Scheine`}]", "{value:`notes`,label:`Nur Noten`},{value:`both`,label:`Münzen und Noten`}]"],
    ["{value:`comma`,label:`Mit Komma (3,50 €)`},{value:`units`,label:`Ohne Komma (3 € 50 ct)`}", "{value:`comma`,label:`Mit Punkt (3.50 Fr.)`},{value:`units`,label:`Ohne Punkt (3 Fr. 50 Rp.)`}"],
    ["onClick:()=>d({max:e}),children:[e,` €`]", "onClick:()=>d({max:e}),children:[e,` Fr.`]"],
    ["children:`Nur Cent: Beträge unter 1 € mit den Cent-Münzen.`", "children:`Nur Rappen: Beträge unter 1 Fr. mit den Rappen-Münzen.`"],
    // drawn coins only: ARASAAC has euro pictograms, so drop that choice
    ["notation:`comma`,max:20,pics:`arasaac`", "notation:`comma`,max:20,pics:`own`"],
    ["pics:e.pics===`own`?`own`:`arasaac`}", "pics:`own`}"],
    ["z(`div`,{class:`math-row`,children:[z(`span`,{children:`Bilder`})", "!1&&z(`div`,{class:`math-row`,children:[z(`span`,{children:`Bilder`})"],
  ].map(([find, to]) => ({ what: "money sheet: " + find.slice(0, 50), find, to, count: 1 })),

  // ---------- Receipt settings dialog (only in the main app) ----------
  ...[
    ["`Euro und Cent (1,49 €)`", "`Franken und Rappen (1.45 Fr.)`"],
    ["`Nur Euro (6 €)`", "`Nur Franken (6 Fr.)`"],
    ["`Nur Cent (45 ct)`", "`Nur Rappen (45 Rp.)`"],
    ["`Kleine, runde Beträge bis 10 €.`", "`Kleine, runde Beträge bis 10 Fr.`"],
    ["(z. B. 27 €).`", "(z. B. 27 Fr.).`"],
    ["`Beträge in Zehnerschritten (30 ct, 60 ct).`", "`Beträge in Zehnerschritten (30 Rp., 60 Rp.).`"],
    ["`Beliebige Beträge (37 ct, 89 ct).`", "`Beliebige Beträge (35 Rp., 85 Rp.).`"],
    ["`Beträge in Zehn-Cent-Schritten (1,50 €, 2,30 €).`", "`Beträge in Zehn-Rappen-Schritten (1.50 Fr., 2.30 Fr.).`"],
    ["`Ladenpreise wie 1,49 € oder 2,87 €.`", "`Ladenpreise wie 1.45 Fr. oder 2.85 Fr.`"],
    ["(aufgerundet, z. B. 20 €)", "(aufgerundet, z. B. 20 Fr.)"],
  ].map(([find, to]) => ({ what: "receipt dialog: " + find, find, to, count: 1 })),

  // ---------- Machines: Geldautomat, Fahrkarten-, Getränkeautomat (2 copies) ----------
  {
    what: "machine: wallet coins (10 Rp. – 5 Fr.), notes 10/20/50 Fr. and note colours",
    find: re(String.raw`=\[10,20,50,100,200\],(@)=\[500,1e3,2e3\],(@)=\{500:\`#c5cbb8\`,1e3:\`#f2b8b0\`,2e3:\`#a8c8ec\`,5e3:\`#f6c58f\`,1e4:\`#a7d7a0\`,2e4:\`#f3e08b\`\}`),
    to: "=[10,20,50,100,200,500],$1=[1e3,2e3,5e3],$2={1e3:`#f2d675`,2e3:`#f2b8b0`,5e3:`#a7d7a0`,1e4:`#a8c8ec`,2e4:`#d9b49a`}",
    count: 2,
  },
  {
    what: "machine: amount display",
    find: "e=>`${Math.floor(e/100)},${String(e%100).padStart(2,`0`)} €`,",
    to: "e=>`${Math.floor(e/100)}.${String(e%100).padStart(2,`0`)} Fr.`,",
    count: 2,
  },
  {
    what: "machine: spoken amounts",
    find: "e=>e<100?`${e} Cent`:`${Math.floor(e/100)} Euro${e%100?` ${e%100}`:``}`",
    to: "e=>e<100?`${e} Rappen`:`${Math.floor(e/100)} Franken${e%100?` ${e%100}`:``}`",
    count: 2,
  },
  {
    what: "machine: coin/note labels (½ on 50 Rp., 5 Fr. is a coin)",
    find: re(String.raw`let (@)=(@)>=100\?\`\$\{\2\/100\} €\`:\`\$\{\2\} ct\`;if\(\2>=500\)return`),
    to: "let $1=$2===50?`½`:$2>=100?`${$2/100} Fr.`:`${$2}`;if($2>=1e3)return",
    count: 2,
  },
  {
    what: "machine: silver coins",
    find: re(String.raw`let (@)=(@)===200\?\`#cfd4da\`:\2===100\|\|\2>=10&&\2<=50\?\`#e0b84a\`:\`#c47a3a\`,(@)=\2===200\?\`#e0b84a\`:\2===100\?\`#cfd4da\`:\1;`),
    to: "let $1=`#dee2e6`,$3=$1;",
    count: 2,
  },
  {
    what: "machine: coin rim",
    find: re(String.raw`fill="\$\{(@)\}" stroke="#7a5c1e"`),
    to: 'fill="${$1}" stroke="#868e96"',
    count: 2,
  },
  {
    what: "machine: wallet coin names",
    find: re(String.raw`<title>\$\{(@)>=100\?\`\$\{\1\/100\} Euro\`:\`\$\{\1\} Cent\`\}</title>`),
    to: "<title>${$1>=100?`${$1/100} Franken`:`${$1} Rappen`}</title>",
    count: 2,
  },
  {
    what: "machine: wallet note names",
    find: re(String.raw`<title>\$\{(@)\/100\} Euro</title>`),
    to: "<title>${$1/100} Franken</title>",
    count: 2,
  },
  {
    what: "machine: 'Scheine' -> 'Noten'",
    find: "`Münzen, Scheine oder Karte`:`Münzen oder Scheine`",
    to: "`Münzen, Noten oder Karte`:`Münzen oder Noten`",
    count: 2,
  },
  {
    what: "machine: 'Scheine' slot label",
    find: '>Scheine</text>',
    to: '>Noten</text>',
    count: 2,
  },

  // ---------- Geld-Planer and Kassenbuch (2 copies) ----------
  {
    what: "budget: amount display 1'250.50 Fr.",
    find: re(String.raw`\.replace\(/\\B\(\?=\(\\d\{3\}\)\+\(\?!\\d\)\)/g,\`\.\`\)\},\$\{String\((@)%100\)\.padStart\(2,\`0\`\)\} €\``),
    to: ".replace(/\\B(?=(\\d{3})+(?!\\d))/g,`'`)}.${String($1%100).padStart(2,`0`)} Fr.`",
    count: 2,
  },
  {
    what: "budget: spoken amounts",
    find: re(String.raw`\$\{(@)\?\`\$\{\1\} Euro\$\{(@)\?\` \$\{\2\}\`:\`\`\}\`:\`\$\{\2\} Cent\`\}`),
    to: "${$1?`${$1} Franken${$2?` ${$2}`:``}`:`${$2} Rappen`}",
    count: 2,
  },
  {
    what: "budget: amount input accepts Fr., CHF and 1'250",
    find: ".replace(/€|euro|eur/gi,``)",
    to: ".replace(/€|euro|eur|chf|franken|fr\\.?|['’]/gi,``)",
    count: 2,
  },
  {
    what: "budget: amount in the edit field with '.'",
    find: re(String.raw`=(@)=>\`\$\{Math\.floor\(\1\/100\)\},\$\{String\(\1%100\)\.padStart\(2,\`0\`\)\}\`,`),
    to: "=$1=>`${Math.floor($1/100)}.${String($1%100).padStart(2,`0`)}`,",
    count: 2,
  },
  {
    what: "budget: 'Wie viel Franken?'",
    find: "`Wie viel Euro?`",
    to: "`Wie viel Franken?`",
    count: 6,
  },
  {
    what: "budget: unit on empty lines",
    find: 'fill="#94a3b8">€</text>',
    to: 'fill="#94a3b8">Fr.</text>',
    count: 2,
  },
  {
    what: "talk practice: paying at the bakery",
    find: "`Das macht 6 Euro 50.`,`Hier sind 7 Euro. Stimmt so.`",
    to: "`Das macht 6 Franken 50.`,`Hier sind 7 Franken. Stimmt so.`",
    count: 2,
  },
  {
    what: "menu template: Fr. instead of €",
    find: "`€`,26,e,`end`,400)",
    to: "`Fr.`,26,e,`end`,400)",
    count: 2,
  },

  // ---------- Swiss words, whole app ----------
  {
    what: "words: Glace instead of Eis am Stiel (kiosk basket)",
    find: "{name:`Eis am Stiel`,price:150,arasaac:3348,g:`n`,pl:`Eis am Stiel`}",
    to: "{name:`Glace`,price:150,arasaac:3348,g:`f`,pl:`Glace`}",
    count: 1,
  },
  {
    what: "words: Peperoni instead of Paprika (market basket, grammar)",
    find: "{name:`Paprika`,price:89,arasaac:2839,g:`f`,pl:`Paprika`}",
    to: "{name:`Peperoni`,price:89,arasaac:2839,g:`f`,pl:`Peperoni`}",
    count: 1,
  },
  {
    what: "words: Peperoni instead of Paprika (receipt, picture, Anlaut word)",
    find: "Paprika",
    to: "Peperoni",
    count: 4,
  },
  {
    what: "words: Trotti instead of Roller (toy shop basket, grammar)",
    find: "{name:`Roller`,price:6999,arasaac:2508,g:`m`,pl:`Roller`}",
    to: "{name:`Trotti`,price:6999,arasaac:2508,g:`n`,pl:`Trottis`}",
    count: 1,
  },
  {
    what: "words: Trotti instead of Roller (syllable train vehicle, help, example list)",
    find: /(?<![\p{L}])Roller(?![\p{L}])/gu,
    to: "Trotti",
    count: 4,
  },
  {
    what: "words: Farbstift instead of Buntstift (drawing tool, word board, shop, help)",
    find: "Buntstift",
    to: "Farbstift",
    count: 16,
  },

  {
    what: "budget/machine: empty amount fields show 0.00",
    find: "placeholder:`0,00`",
    to: "placeholder:`0.00`",
    count: 10,
  },

  // ---------- Dialogs for Geld-Planer, Kassenbuch and machines (main app only) ----------
  {
    what: "budget/machine dialog: amount input accepts Fr., CHF and 1'250",
    find: "e.replace(/[€\\s]/g,``)",
    to: "e.replace(/[€\\s'’]|chf|fr\\.?/gi,``)",
    count: 1,
  },
  {
    what: "budget/machine dialog: amount in the edit field",
    find: "K6=e=>kd(e).replace(` €`,``)",
    to: "K6=e=>kd(e).replace(` Fr.`,``)",
    count: 1,
  },
  ...[
    ["`Betrag in Euro`", "`Betrag in Franken`"],
    ["`Preis in Euro`", "`Preis in Franken`"],
    ["`Anfangsbestand (€)`", "`Anfangsbestand (Fr.)`"],
    ["mit Münzen und Scheinen aus dem Geldbeutel", "mit Münzen und Noten aus dem Geldbeutel"],
  ].map(([find, to]) => ({ what: "budget/machine dialog: " + find, find, to, count: 1 })),

  // ---------- "Rechnen im Alltag: Lohn, Fahrplan, Geld" (main app only) ----------
  {
    what: "life maths: amounts 1'250 / 13.50",
    find: "Q6=e=>{let t=Math.floor(e/100),n=e%100;return`${String(t).replace(/\\B(?=(\\d{3})+(?!\\d))/g,`.`)}${n?`,${String(n).padStart(2,`0`)}`:``}`},$6=e=>`${String(Math.floor(e/100)).replace(/\\B(?=(\\d{3})+(?!\\d))/g,`.`)},${String(e%100).padStart(2,`0`)}`",
    to: "Q6=e=>{let t=Math.floor(e/100),n=e%100;return`${String(t).replace(/\\B(?=(\\d{3})+(?!\\d))/g,`'`)}${n?`.${String(n).padStart(2,`0`)}`:``}`},$6=e=>`${String(Math.floor(e/100)).replace(/\\B(?=(\\d{3})+(?!\\d))/g,`'`)}.${String(e%100).padStart(2,`0`)}`",
    count: 1,
  },
  ...[
    // order matters: "€." at a sentence end first, so it does not become "Fr.."
    [/(\d|\}) €\./g, "$1 Fr.", 2],
    [/(\d|\}) €/g, "$1 Fr.", 14],
    [/`€`/g, "`Fr.`", 4],
    [/ganze Euro/g, "ganze Franken", 2],
    [/`Cent, mehrere Tage/g, "`Rappen, mehrere Tage", 1],
    [/Geld mit oder ohne €\./g, "Geld mit oder ohne Fr.", 1],
    // "ganze Franken" is longer than "ganze Euro": keep the question on one line above its answer box
    [/`Wie viel bleibt pro Stunde übrig \(netto, gerundet auf ganze Franken\)\?`/g, "`Netto pro Stunde (auf ganze Franken gerundet)?`", 1],
  ].map(([find, to, count]) => ({
    what: "life maths: " + find.source, find, to, count,
    region: ["var J6={formats:[`wage`,`depart`]", "function O0e(){"],
  })),
];

// Lines (identified by content) that must not mention euros any more after patching.
export const cleanLines = [
  ["receipt widget", "`Weggli 6 Stück`", 2],
  ["shop widget", `class="lh-sh-drow" style=`, 2],
  ["receipt dialog", "Kassenzettel der Reihe", 1],
  ["shop editor", "{class:`shd-price`", 1],
];
export const euroLeft = /€|Euro|Cent|\d ct\b|`ct`/;

export function applyChf(html) {
  for (const p of patches) {
    const rx = typeof p.find === "string" ? new RegExp(esc(p.find), "g") : p.find;
    // A patch with "region" only applies between two markers that each occur once.
    let a = 0, b = html.length;
    if (p.region) {
      a = html.indexOf(p.region[0]);
      b = html.indexOf(p.region[1], a);
      if (a < 0 || b < 0 || html.indexOf(p.region[0], a + 1) >= 0) throw new Error(`CHF patch "${p.what}": region markers not found once`);
    }
    const part = html.slice(a, b);
    const n = (part.match(rx) ?? []).length;
    if (n !== p.count) throw new Error(`CHF patch "${p.what}": expected ${p.count} match(es), found ${n}`);
    const done = typeof p.find === "string" ? part.replace(rx, () => p.to) : part.replace(rx, p.to);
    html = html.slice(0, a) + done + html.slice(b);
  }
  const lines = html.split("\n");
  for (const [name, marker, expected] of cleanLines) {
    const hits = lines.filter((l) => l.includes(marker));
    if (hits.length !== expected) throw new Error(`CHF check "${name}": expected ${expected} line(s), found ${hits.length}`);
    for (const line of hits) {
      // The input parsers still accept a typed "€" on purpose, and the editor parser maps
      // "Rp." to its internal "ct" marker.
      const l = line.replaceAll("€|CHF", "").replaceAll("/Rp\\.?$/i,`ct`)", "");
      const m = euroLeft.exec(l);
      if (m) throw new Error(`CHF check "${name}": euro left: …${l.slice(Math.max(0, m.index - 80), m.index + 40)}…`);
    }
  }
  // Code ranges (main app only) that must not mention euros any more.
  for (const [name, from, to] of cleanRegions) {
    const a = html.indexOf(from), b = html.indexOf(to, a);
    if (a < 0 || b < 0 || html.indexOf(from, a + 1) >= 0) throw new Error(`CHF check "${name}": markers not found once`);
    const part = html.slice(a, b), m = euroLeft.exec(part);
    if (m) throw new Error(`CHF check "${name}": euro left: …${part.slice(Math.max(0, m.index - 80), m.index + 40)}…`);
  }
  return html;
}

export const cleanRegions = [
  ["money sheet", "var Kq={formats:", "function pFe(){"],
  ["money sheet dialog", "var k2e=`lernheft-money-v1`", "function N2e(){"],
];

// ß -> ss in all words of the app (Swiss spelling). Left alone on purpose:
// - hyphenation patterns (`patterns:{3:`…1ßa…`}`), which describe German words with ß
// - letter classes in regular expressions like [a-zäöüß], so typed ß still works
// - the single letter `ß` as a key or as a case in the code (it is not next to a letter)
// - the character list used to subset fonts for exports
export function swissSz(html) {
  const keep = [
    /patterns:\{[^}]*\}/g,
    /\[[\^A-Za-zÄÖÜäöüßÀ-ɏ\\s\-‐]*ß[A-Za-zÄÖÜäöüßÀ-ɏ\\s\-‐]*\]/g,
    /AaÄäÖöÜüß0123456789/g,
  ];
  const spans = [];
  for (const rx of keep) for (const m of html.matchAll(rx)) spans.push([m.index, m.index + m[0].length]);
  spans.sort((a, b) => a[0] - b[0]);
  const inKept = (i) => spans.some(([a, b]) => i >= a && i < b);
  let n = 0;
  // The spelling list named after ß now holds words with ss.
  html = html.replaceAll("`Wörter mit ß, tz, ck`", "`Wörter mit ss, tz, ck`");
  const out = html.replace(/(?<=\p{L})ß|ß(?=\p{L})/gu, (m, i) => (inKept(i) ? m : (n++, "ss")));
  if (n < 400) throw new Error(`ß patch: only ${n} replacements, expected about 475`);
  return { html: out, replaced: n, kept: (out.match(/ß/g) ?? []).length };
}
