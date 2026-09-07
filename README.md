# SevaDesk

**Hindi Typing & Forms Library** - A desktop utility for Indian online service/CSC-type shops.

## Features

- **Unicode → Kruti Dev Converter** - Type/paste Hindi Unicode, convert to actual Kruti Dev 010 byte encoding (offline, no API)
- **Forms Library** - Search, filter, upload, export forms (PDF, DOC, DOCX, JPG, PNG, TXT)
- **100% Offline** - Core features work without internet
- **Print Ready** - Direct print with Kruti Dev font styling

## Download

| Version | Portable EXE | Installer |
|---------|-------------|-----------|
| v1.0.0 | [sevadesk.exe](https://github.com/saktitechlab-os/SevaDesk/releases/download/v1.0.0/sevadesk.exe) | [SevaDesk_1.0.0_x64_en-US.msi](https://github.com/saktitechlab-os/SevaDesk/releases/download/v1.0.0/SevaDesk_1.0.0_x64_en-US.msi) |

## Requirements
- Windows 7/10/11
- No additional dependencies

## Usage

### Converter
1. Open **Converter** tab
2. Type or paste Hindi Unicode text (e.g., `न्यायालय में आवेदन प्रस्तुत है।`)
3. Click **Convert**
4. Click **Copy** or **Print**
5. Paste in MS Word → Apply **Kruti Dev 010** font

### Forms Library
1. Open **Forms Library** tab
2. Search by name, category, state, district
3. Click **Open** to view in browser
4. Click **Export** to save locally
5. Click **Upload Form** to add new forms

## Supported Conversions
- All Devanagari vowels & consonants
- Matras (वowel signs): ा ि ी ु ू ृ े ै ो ौ
- Conjuncts: क्ष, त्र, ज्ञ, श्र
- Special: Anusvara (ं), Visarga (ः), Virama (्), Candrabindu (ँ)
- Numbers: ०-९ → 0-9
- Punctuation: । ॥

## Build from Source

```bash
# Prerequisites
- Node.js 18+
- Rust (stable-msvc)
- Visual Studio Build Tools (C++ workload)

# Build
cd SevaDesk
npm install
npm run build
npx tauri build
```

## Tech Stack
- Tauri + React + TypeScript + Vite
- Rust backend for converter & forms storage
- Local JSON + filesystem (no database needed)

## License
Proprietary - Source code private. Releases public for distribution.

---

**SevaDesk** - Made for Indian CSC/online service centers