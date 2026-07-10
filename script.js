const darkNeutrals = [
  ["dark-01", "#0B0C0F"],
  ["dark-02", "#121212"],
  ["dark-03", "#161616"],
  ["dark-04", "#242424"],
  ["dark-05", "#323232"],
  ["dark-06", "#404040"]
];

const lightNeutrals = [
  ["light-01", "#C9C5BE"],
  ["light-02", "#CDCDCD"],
  ["light-03", "#E4E0D8"],
  ["light-04", "#E4E4E4"],
  ["light-05", "#EEEEEE"],
  ["light-06", "#FFFBF2"]
];

const families = [
  {
    name: "Red",
    colors: [
      ["script-red-core", "#AB5960"],
      ["script-red-bright", "#E95678"],
      ["script-red-character", "#F08A88"]
    ]
  },
  {
    name: "Yellow",
    colors: [
      ["script-yellow-core", "#C19C00"],
      ["script-yellow-bright", "#F8BE98"],
      ["script-yellow-character", "#A79677"]
    ]
  },
  {
    name: "Green",
    colors: [
      ["script-green-core", "#566F56"],
      ["script-green-bright", "#ABDDAA"],
      ["script-green-character", "#B6BC55"]
    ]
  },
  {
    name: "Cyan",
    colors: [
      ["script-cyan-core", "#2C7385"],
      ["script-cyan-bright", "#6CB8CB"],
      ["script-cyan-character", "#6BA897"]
    ]
  },
  {
    name: "Blue",
    colors: [
      ["script-blue-core", "#5A7BAB"],
      ["script-blue-bright", "#87C0FF"],
      ["script-blue-character", "#619390"]
    ]
  },
  {
    name: "Purple",
    colors: [
      ["script-purple-core", "#765598"],
      ["script-purple-bright", "#9988C8"],
      ["script-purple-character", "#C16FA0"]
    ]
  }
];

const rowNames = ["Core", "Bright", "Character"];

const allColors = [
  ...darkNeutrals.map(([name, hex]) => ({ group: "dark", name, hex })),
  ...families.flatMap(family => family.colors.map(([name, hex]) => ({
    group: "script",
    family: family.name.toLowerCase(),
    name,
    hex
  }))),
  ...lightNeutrals.map(([name, hex]) => ({ group: "light", name, hex }))
];

const board = document.getElementById("paletteBoard");
const toast = document.getElementById("toast");
const copyFormat = document.getElementById("copyFormat");

function rgb(hex) {
  return hex.slice(1).match(/.{2}/g).map(v => parseInt(v, 16));
}

function rgbString(hex) {
  return rgb(hex).join(", ");
}

function labelColor(hex) {
  const [r, g, b] = rgb(hex).map(v => v / 255);
  const linear = [r, g, b].map(v =>
    v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  );
  const l = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return l > 0.47 ? "#242424" : "#F7F3EC";
}

function swatch(name, hex, extraClass = "") {
  const label = labelColor(hex);
  return `
    <button
      class="swatch ${extraClass}"
      type="button"
      style="--swatch:${hex}; --label:${label}"
      data-name="${name}"
      data-hex="${hex}"
      aria-label="Copy ${name}, ${hex}"
      title="${name} · ${hex}"
    >
      <span class="swatch-inner">
        <span class="swatch-name">${name}</span>
        <span class="swatch-hex">${hex}</span>
        <span class="swatch-meta">
          <span>RGB</span>
          <span>${rgbString(hex)}</span>
        </span>
      </span>
    </button>
  `;
}

function render() {
  const familyHeader = `
    <div class="family-row" aria-hidden="true">
      <div class="family-cell empty"></div>
      ${families.map(family => `<div class="family-cell">${family.name}</div>`).join("")}
    </div>
  `;

  const matrixRows = rowNames.map((rowName, rowIndex) => `
    <div class="matrix-row">
      <div class="row-label">${rowName}</div>
      ${families.map(family => {
        const [name, hex] = family.colors[rowIndex];
        return swatch(name, hex, "script-swatch");
      }).join("")}
    </div>
  `).join("");

  board.innerHTML = `
    <section class="board-section">
      <div class="section-header">
        <h2 class="section-title">Dark neutrals</h2>
        <span class="section-note">Base, canvas, surfaces, hover layers</span>
      </div>
      <div class="neutral-strip">
        ${darkNeutrals.map(([name, hex]) => swatch(name, hex, "neutral-swatch")).join("")}
      </div>
    </section>

    <section class="board-section">
      <div class="section-header">
        <h2 class="section-title">Script palette</h2>
        <span class="section-note">6 families × 3 roles</span>
      </div>

      <div class="matrix-wrap">
        <div class="matrix">
          ${familyHeader}
          ${matrixRows}
        </div>
      </div>
    </section>

    <section class="board-section">
      <div class="section-header">
        <h2 class="section-title">Light neutrals</h2>
        <span class="section-note">Text, paper, warm panels, high contrast</span>
      </div>
      <div class="neutral-strip">
        ${lightNeutrals.map(([name, hex]) => swatch(name, hex, "neutral-swatch")).join("")}
      </div>
    </section>
  `;
}

function formatColor(name, hex, format) {
  switch (format) {
    case "css": return `--${name}: ${hex};`;
    case "scss": return `$${name}: ${hex};`;
    case "json": return `"${name}": "${hex}"`;
    case "name": return name;
    default: return hex;
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1500);
}

board.addEventListener("click", async event => {
  const target = event.target.closest(".swatch");
  if (!target) return;

  const { name, hex } = target.dataset;
  let output;

  if (event.altKey) output = name;
  else if (event.shiftKey) output = `${name}: ${hex}`;
  else output = formatColor(name, hex, copyFormat.value);

  if (await copyText(output)) showToast(`Copied ${output}`);
});

function groupedLines(prefix, suffix) {
  const sections = [
    ["Dark neutrals", darkNeutrals],
    ["Script palette", families.flatMap(family => family.colors)],
    ["Light neutrals", lightNeutrals]
  ];

  return sections.map(([title, colors]) => {
    const comment = prefix === "$" ? `// ${title}` : `  /* ${title} */`;
    const lines = colors.map(([name, hex]) =>
      prefix === "$"
        ? `$${name}: ${hex};`
        : `  --${name}: ${hex};`
    ).join("\n");

    return `${comment}\n${lines}`;
  }).join("\n\n") + suffix;
}

function cssExport() {
  return `:root {\n${groupedLines("--", "\n}")}`.replaceAll("  ----", "  --");
}

function scssExport() {
  return groupedLines("$", "\n");
}

function jsonExport() {
  return JSON.stringify(
    Object.fromEntries(allColors.map(({ name, hex }) => [name, hex])),
    null,
    2
  );
}

function csvExport() {
  return [
    "group,family,name,hex",
    ...allColors.map(({ group, family = "", name, hex }) => `${group},${family},${name},${hex}`)
  ].join("\n");
}

async function copyExport(type) {
  const output = {
    css: cssExport(),
    scss: scssExport(),
    json: jsonExport(),
    csv: csvExport()
  }[type];

  if (await copyText(output)) showToast(`Copied complete ${type.toUpperCase()} palette`);
}

function downloadCss() {
  const blob = new Blob([cssExport()], { type: "text/css;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "script-theme.css";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Downloaded script-theme.css");
}

document.getElementById("copyCss").addEventListener("click", () => copyExport("css"));
document.getElementById("copyScss").addEventListener("click", () => copyExport("scss"));
document.getElementById("copyJson").addEventListener("click", () => copyExport("json"));
document.getElementById("copyCsv").addEventListener("click", () => copyExport("csv"));
document.getElementById("downloadCss").addEventListener("click", downloadCss);

const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeText = document.getElementById("themeText");
const themeIcon = document.getElementById("themeIcon");

function applyTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("script-preview-theme", theme);

  const isDark = theme === "dark";
  themeText.textContent = isDark ? "Light preview" : "Dark preview";
  themeIcon.textContent = isDark ? "☀" : "☾";

  document.querySelector('meta[name="theme-color"]').setAttribute("content", isDark ? "#121212" : "#E4E0D8");
}

themeToggle.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

const storedTheme = localStorage.getItem("script-preview-theme");
if (storedTheme === "light" || storedTheme === "dark") applyTheme(storedTheme);

document.getElementById("count").textContent = `${allColors.length} colours`;
render();
