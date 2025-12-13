# Version 2.1.0 - Major Update

## 🎉 Neue Features

### 1. ✨ Automatische Versionsnummer

- **Versions-Badge** in der **oberen linken Ecke** auf allen Seiten
- Version wird automatisch aus `package.json` gelesen
- Aktualisiert sich bei jedem Update automatisch
- Dezentes Design mit Glassmorphism-Effekt

**Position:** Oben links, immer sichtbar
**Format:** `v2.1.0`

### 2. 🎨 Verbessertes Upload-Layout

- **Größere Upload-Box** (300px min-height)
- **Bessere Zentrierung** und Ausrichtung
- **Klarere Text-Hierarchie:**
  - Größere Icons (100px)
  - Größerer Text (1.4rem)
  - Bessere Abstände und Paddings
- **Verbesserte Hover-Effekte:**
  - Stärkere Hervorhebung
  - Sanftere Schatten
  - Bessere visuelle Rückmeldung
- **Optimierte Datei-Anzeige:**
  - Dateiname gut lesbar
  - Dateigröße deutlich sichtbar
  - Maximale Breite für langen Dateinamen

### 3. 🗑️ Löschfunktion für Prüfungen

- **Delete-Button** auf Prüfungskarten (erscheint bei Hover)
- **Bestätigungs-Dialog** vor dem Löschen
- **Vollständig übersetzt** (Deutsch/Englisch)
- **Rotes Mülleimer-Icon** (oben rechts auf Karten)

**Wo verfügbar:**

- Take Exam Seite (Prüfungsauswahl)

### 4. 🔧 Gefixte OCR.space Integration

- **Korrigierter API-Call** mit richtigen Headers
- **x-www-form-urlencoded** Format statt FormData
- **Besseres Error-Handling** mit detaillierten Logs
- **Engine 2 aktiv** (optimiert für Handschrift)

**API-Details:**

```javascript
Headers: {
  'apikey': API_KEY,
  'Content-Type': 'application/x-www-form-urlencoded'
}

Body: URLSearchParams({
  'base64Image': imageData,
  'language': 'ger',
  'OCREngine': '2',  // Handwriting-optimized
  'detectOrientation': 'true',
  'scale': 'true'
})
```

## 📊 Technische Verbesserungen

### Version-Badge Komponente

```
src/components/VersionBadge.js
src/components/VersionBadge.css
```

- Automatisches Auslesen von package.json
- Fixed positioning (top-left)
- Z-index 9999 für immer sichtbar
- Responsive Design

### Upload-Box CSS

**Vorher:**

- padding: 3rem
- min-height: nicht gesetzt
- Kleine Icons und Text

**Nachher:**

- padding: 4rem 3rem
- min-height: 300px
- max-width: 600px
- Größere Icons (100px)
- Größerer Text (1.4rem)
- Zentrierung mit Flexbox

### Delete-Funktion

**Implementierung:**

```javascript
handleDeleteExam(examId, event) {
  event.stopPropagation(); // Verhindert Start der Prüfung
  if (window.confirm(t('takeExam.confirmDelete'))) {
    deleteExam(examId);
    setExams(getExams());
  }
}
```

**CSS:**

```css
.delete-exam-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  opacity: 0; /* Versteckt standardmäßig */
}

.exam-card:hover .delete-exam-btn {
  opacity: 1; /* Sichtbar bei Hover */
}
```

## 🚀 Deployment

**Version:** 2.1.0
**Build-Größe:**

- JS: 161.79 kB (gzip)
- CSS: 4.28 kB (gzip)

**Live:** https://JustThatRandomCoder.github.io/study-app

## 🔄 Nächste Schritte

1. **OCR-Testen:**

   - Handgeschriebene deutsche PDFs mit OCR.space testen
   - Bei Problemen: API-Response im Console Log prüfen
   - Ggf. alternative API-Keys oder andere OCR-Services testen

2. **Layout-Feintuning:**

   - User-Feedback sammeln
   - Mobile Responsive-Tests
   - Weitere UI-Verbesserungen

3. **Zusätzliche Features:**
   - Prüfungen exportieren/importieren
   - Statistiken und Fortschritts-Tracking
   - Dark/Light Mode Toggle

## 🐛 Bekannte Issues

1. **OCR.space Free Tier:**

   - 25.000 Requests/Monat
   - Bei Überschreitung: Rate Limiting
   - Lösung: Eigenen API-Key in Code einfügen

2. **Handschrift-Erkennung:**
   - Qualität abhängig von Scan-Qualität
   - Beste Ergebnisse: 300+ DPI, gute Beleuchtung
   - Fallback auf Tesseract wenn OCR.space fehlschlägt

## 📝 Changelog

### v2.1.0 (13. Dezember 2025)

- ✨ Versions-Badge hinzugefügt (oben links)
- 🎨 Upload-Layout komplett überarbeitet
- 🗑️ Delete-Funktion für Prüfungen
- 🔧 OCR.space API-Call gefixt
- 📦 Dependencies aktualisiert

### v2.0.0 (vorher)

- 🌍 Vollständige DE/EN Übersetzung
- 🔤 Language-Switcher
- 🤖 Tesseract OCR Integration
- 📚 Multi-Language OCR Support
