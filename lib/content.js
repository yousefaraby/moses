import 'server-only';
import { getDb, publicContent } from './db';

export async function getContent() {
  return publicContent(await getDb());
}
