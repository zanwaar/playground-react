# Playground React

Playground React adalah aplikasi React + Vite untuk menguji dan mengembangkan UI editor dokumen berbasis Tiptap.

Project ini berperan sebagai playground, bukan package utama. Logic extension reusable berada di package `tiptap-docs-kit`.

## Tech Stack

- React
- TypeScript
- Vite
- Tiptap

## Instalasi

Jalankan dari folder project ini:

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Preview Build

```bash
npm run preview
```

## Struktur

```txt
playground-react/
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Dependency Extension Lokal

Playground ini memakai extension lokal:

```json
{
  "tiptap-docs-kit": "file:../../packages/tiptap-docs-kit"
}
```

Pastikan folder `packages/tiptap-docs-kit` tersedia di lokasi relatif tersebut saat menjalankan `npm install`.

Jika extension sudah dipublish ke npm, dependency lokal ini bisa diganti menjadi versi package npm.

## Catatan

Folder ini boleh dijadikan git repository sendiri untuk development UI playground. Jangan commit `node_modules` atau `dist`.
