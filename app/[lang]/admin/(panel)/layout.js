import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { isAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { getDict, href } from '@/lib/i18n';

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children, params }) {
  const { lang } = await params;
  if (!(await isAdmin())) redirect(href(lang, '/admin/login'));
  const db = await getDb();
  const unread = db.messages.filter((m) => !m.read).length;
  return (
    <AdminShell lang={lang} t={getDict(lang)} unread={unread}>
      {children}
    </AdminShell>
  );
}
