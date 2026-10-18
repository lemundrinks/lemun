import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await cp('site', 'dist', { recursive: true });
console.log('Static site built in dist/. Preview is noindex until the launch checklist is complete.');
