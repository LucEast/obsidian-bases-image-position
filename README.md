[English](README.md) | [Deutsch](README.de.md)

# Bases Image Position

<p align="center">
  <strong>Control image positioning in <a href="https://help.obsidian.md/bases">Obsidian Bases</a> Card Views via frontmatter properties.</strong>
</p>

<p align="center">
  <a href="https://github.com/LucEast/obsidian-bases-image-position/releases">
    <img src="https://img.shields.io/github/v/release/LucEast/obsidian-bases-image-position?style=for-the-badge&label=latest&labelColor=363a4f&color=B4BEFE&logo=github&logoColor=cad3f5" alt="GitHub Release" />
  </a>
  <a href="https://github.com/LucEast/obsidian-bases-image-position/releases">
    <img src="https://img.shields.io/github/downloads/LucEast/obsidian-bases-image-position/total?style=for-the-badge&label=downloads&labelColor=363a4f&color=F9E2AF&logo=abdownloadmanager&logoColor=cad3f5" alt="Downloads" />
  </a>
  <a href="https://github.com/LucEast/obsidian-bases-image-position/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/LucEast/obsidian-bases-image-position/release.yml?branch=main&style=for-the-badge&label=CI&labelColor=363a4f&color=A6E3A1&logo=githubactions&logoColor=cad3f5" alt="CI Status" />
  </a>
  <a href="https://github.com/LucEast/obsidian-bases-image-position/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/LucEast/obsidian-bases-image-position?style=for-the-badge&labelColor=363a4f&color=FAB387&logo=open-source-initiative&logoColor=cad3f5" alt="License" />
  </a>
</p>

<!-- TODO: Add hero image/demo GIF here -->
<!-- <p align="center">
  <img src="assets/demo-hero.gif" alt="Bases Image Position Demo" width="800" />
</p> -->

---

## ✨ Features

By default, cover images in Bases card views are centered. This plugin lets you adjust the position per note — useful when the subject of an image is off-center and gets cropped out.

### 🖼️ Position Presets

Quickly set the focal point of cover images using simple preset values — no calculations required.

| Preset         | Description              |
|----------------|--------------------------|
| `center`       | Center (default)         |
| `top`          | Top center               |
| `bottom`       | Bottom center            |
| `left`         | Left center              |
| `right`        | Right center             |
| `top left`     | Top left corner          |
| `top right`    | Top right corner         |
| `bottom left`  | Bottom left corner       |
| `bottom right` | Bottom right corner      |

<!-- TODO: Add screenshot of preset in action -->
<!-- <p align="center">
  <img src="assets/presets.png" alt="Position presets in action" width="600" />
</p> -->

### 🎯 Precise Offsets

For fine-grained control, position images using exact offset values:

```yaml
---
image-offset-x: 30%
image-offset-y: 70%
---
```

Supported units: `%`, `px`, `em`, `rem`, `vh`, `vw`. Plain numbers are treated as pixels (`30` → `30px`).

> **Note:** Offset properties take priority over `image-position` presets. If both are set, offsets win.

### ⚙️ Configurable Property Keys

Rename the frontmatter properties to fit your workflow — fully adjustable in plugin settings without touching your notes.

---

## 🧠 How It Works

The plugin uses a `MutationObserver` to watch for Bases card elements in the DOM. When a card appears:

1. **Resolve** – The note file is identified via multiple fallback methods
2. **Read** – Frontmatter is pulled from Obsidian's metadata cache
3. **Apply** – A `background-position` style is set on the card's cover element

### File Path Resolution

Cards are resolved to vault files using these fallbacks in order:

```
1. data-path attribute     →  Direct attribute on card element
2. file.path property      →  Displayed property within the card
3. Internal link href      →  a.internal-link element
4. data-href attribute     →  Fallback link attribute
5. Title matching          →  Match against filenames or frontmatter titles
```

---

## 📑 Usage

### Preset Positions

```yaml
---
image-position: top
---
```

### Precise Offsets

```yaml
---
image-offset-x: 30%
image-offset-y: 70%
---
```

Both properties can be used independently or combined.

---

## ⚙️ Configuration

Open **Settings → Community Plugins → Bases Image Position**:

| Setting                     | Description                                      | Default            |
|-----------------------------|--------------------------------------------------|--------------------|
| **Image position property** | Frontmatter key for preset positions             | `image-position`   |
| **Image offset X property** | Frontmatter key for horizontal offset            | `image-offset-x`   |
| **Image offset Y property** | Frontmatter key for vertical offset              | `image-offset-y`   |
| **Debug mode**              | Enable console logging for troubleshooting       | `false`            |

---

## 📦 Installation

### From Obsidian Community Plugins (Recommended)

1. Open **Settings** → **Community Plugins**
2. Click **Browse** and search for **"Bases Image Position"**
3. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from the [GitHub releases page](https://github.com/LucEast/obsidian-bases-image-position/releases)
2. Create folder: `<vault>/.obsidian/plugins/bases-image-position/`
3. Copy `manifest.json` and `main.js` into this folder
4. Reload Obsidian and enable the plugin under **Settings** → **Community Plugins**

---

## 📋 Requirements

- Obsidian **1.9.10** or later (Bases was introduced in this version)

---

## 🛠 Development

### Setup

```bash
git clone https://github.com/LucEast/obsidian-bases-image-position.git
cd obsidian-bases-image-position
npm install
```

### Build

```bash
npm run dev      # Watch mode – auto-rebuild on changes
npm run build    # Production build with type checking
```

### Architecture

See [CLAUDE.md](CLAUDE.md) for development guidelines and architecture overview.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org) (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 💡 Support

- 🐛 [Report a bug](https://github.com/LucEast/obsidian-bases-image-position/issues/new?template=bug-report.yaml)
- 🎨 [Share design feedback](https://github.com/LucEast/obsidian-bases-image-position/issues/new?template=design-feedback.yaml)
- 💬 [Start a discussion](https://github.com/LucEast/obsidian-bases-image-position/discussions)

---

## 📝 License

[MIT](LICENSE) – Free to use and modify.
