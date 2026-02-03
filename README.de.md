[English](README.md) | [Deutsch](README.de.md)

# Bases Image Position

<p align="center">
  <strong>Steuerung der Bildpositionierung in <a href="https://help.obsidian.md/bases">Obsidian Bases</a> Card Views über Frontmatter-Eigenschaften.</strong>
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

<!-- TODO: Hero-Bild/Demo-GIF hinzufügen -->
<!-- <p align="center">
  <img src="assets/demo-hero.gif" alt="Bases Image Position Demo" width="800" />
</p> -->

---

## ✨ Features

Standardmäßig werden Cover-Bilder in Card Views zentriert angezeigt. Dieses Plugin ermöglicht es, die Position pro Note anzupassen — praktisch, wenn das Hauptmotiv eines Bildes nicht zentriert ist und beim Zuschnitt abschneiden würde.

### 🖼️ Positionspresets

Den Brennpunkt von Cover-Bildern schnell über einfache Preset-Werte setzen — ohne Berechnungen.

| Preset         | Beschreibung             |
|----------------|--------------------------|
| `center`       | Zentriert (Standard)     |
| `top`          | Oben zentriert           |
| `bottom`       | Unten zentriert          |
| `left`         | Links zentriert          |
| `right`        | Rechts zentriert         |
| `top left`     | Oben links               |
| `top right`    | Oben rechts              |
| `bottom left`  | Unten links              |
| `bottom right` | Unten rechts             |

<!-- TODO: Screenshot von Presets in Aktion hinzufügen -->
<!-- <p align="center">
  <img src="assets/presets.png" alt="Positionspresets in Aktion" width="600" />
</p> -->

### 🎯 Präzise Verschiebung

Für feinere Kontrolle können Bilder über exakte Offset-Werte positioniert werden:

```yaml
---
image-offset-x: 30%
image-offset-y: 70%
---
```

Unterstützte Einheiten: `%`, `px`, `em`, `rem`, `vh`, `vw`. Bare Zahlen werden als Pixel interpretiert (`30` → `30px`).

> **Hinweis:** Offset-Eigenschaften haben Vorrang vor `image-position`-Presets. Falls beides gesetzt ist, gewinnen die Offsets.

### ⚙️ Konfigurierbare Eigenschaftsnamen

Die Frontmatter-Eigenschaften an den eigenen Workflow anpassen — vollständig in den Plugin-Einstellungen änderbar, ohne eine Note zu berühren.

---

## 🧠 Funktionsweise

Das Plugin verwendet einen `MutationObserver`, um Bases-Card-Elemente im DOM zu überwachen. Wenn eine Card erscheint:

1. **Auflösen** – Die zugehörige Note wird über mehrere Fallback-Methoden identifiziert
2. **Lesen** – Das Frontmatter wird aus Obsidians Metadaten-Cache geladen
3. **Anwenden** – Ein `background-position`-Style wird auf das Cover-Element der Card gesetzt

### Dateipfad-Auflösung

Cards werden über folgende Fallbacks (in dieser Reihenfolge) zu Vault-Dateien zugeordnet:

```
1. data-path Attribut      →  Direktes Attribut auf dem Card-Element
2. file.path Eigenschaft   →  Angezeigten Eigenschaft innerhalb der Card
3. Interner Link href      →  a.internal-link Element
4. data-href Attribut      →  Fallback-Link-Attribut
5. Titel-Matching          →  Abgleich gegen Dateinamen oder Frontmatter-Titel
```

---

## 📑 Nutzung

### Positionspresets

```yaml
---
image-position: top
---
```

### Präzise Verschiebung

```yaml
---
image-offset-x: 30%
image-offset-y: 70%
---
```

Beide Eigenschaften können unabhängig voneinander oder kombiniert verwendet werden.

---

## ⚙️ Konfiguration

Öffne **Einstellungen → Community Plugins → Bases Image Position**:

| Einstellung                      | Beschreibung                                           | Standard           |
|----------------------------------|--------------------------------------------------------|--------------------|
| **Image position property**      | Frontmatter-Schlüssel für Preset-Positionen            | `image-position`   |
| **Image offset X property**      | Frontmatter-Schlüssel für horizontalen Offset          | `image-offset-x`   |
| **Image offset Y property**      | Frontmatter-Schlüssel für vertikalen Offset            | `image-offset-y`   |
| **Debug mode**                   | Console-Logging zur Fehlersuche aktivieren             | `false`            |

---

## 📦 Installation

### Über den Community Plugin Browser (Empfohlen)

1. Öffne **Einstellungen** → **Community Plugins**
2. Klicke auf **Browse** und suche nach **"Bases Image Position"**
3. Klicke auf **Install**, anschließend auf **Enable**

### Manuelle Installation

1. Das neueste Release von der [GitHub Releases-Seite](https://github.com/LucEast/obsidian-bases-image-position/releases) herunterladen
2. Ordner erstellen: `<dein Vault>/.obsidian/plugins/bases-image-position/`
3. `manifest.json` und `main.js` in diesen Ordner kopieren
4. Obsidian neu starten und das Plugin unter **Einstellungen** → **Community Plugins** aktivieren

---

## 📋 Anforderungen

- Obsidian **1.9.10** oder neuere Version (Bases wurde in dieser Version eingeführt)

---

## 🛠 Entwicklung

### Setup

```bash
git clone https://github.com/LucEast/obsidian-bases-image-position.git
cd obsidian-bases-image-position
npm install
```

### Build

```bash
npm run dev      # Watch-Modus – automatischer Neu-Build bei Änderungen
npm run build    # Produktions-Build mit Typprüfung
```

### Architektur

Siehe [CLAUDE.md](CLAUDE.md) für Entwicklungsrichtlinien und Architekturübersicht.

---

## 🤝 Beitragen

Beiträge sind willkommen! Pull Requests werden gerne entgegengenommen.

1. Das Repository forken
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen mit [Conventional Commits](https://www.conventionalcommits.org) committen (`git commit -m 'feat: add amazing feature'`)
4. zum Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

---

## 💡 Support

- 🐛 [Bug melden](https://github.com/LucEast/obsidian-bases-image-position/issues/new?template=bug-report.yaml)
- 🎨 [Design-Feedback teilen](https://github.com/LucEast/obsidian-bases-image-position/issues/new?template=design-feedback.yaml)
- 💬 [Discussion starten](https://github.com/LucEast/obsidian-bases-image-position/discussions)

---

## 📝 Lizenz

[MIT](LICENSE) – Kostenlos zu nutzen und zu verändern.
