# NoteBoard

A sticky notes single-page application built with React, TypeScript, and Vite.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Features

- **Create notes** — double-click anywhere on the board
- **Move notes** — drag the note header
- **Resize notes** — drag the bottom-right corner handle
- **Delete notes** — drag a note over the trash zone at the bottom
- **Edit text** — click the note body to type
- **Change colors** — click the palette button in the note header
- **Bring to front** — clicking a note raises it above others
- **Persistence** — notes are saved to localStorage and restored on reload
- **Mock REST API** — all CRUD operations go through an async mock API layer

## Tech Stack

- React 19 + TypeScript (strict mode)
- Vite
- Tailwind CSS v4
