// Deletes data/db.json so the sample data is rebuilt on the next request.
import { rm } from 'node:fs/promises';
import path from 'node:path';

const file = path.join(process.cwd(), 'data', 'db.json');
await rm(file, { force: true });
console.log('Sample data will be recreated on the next request.');
