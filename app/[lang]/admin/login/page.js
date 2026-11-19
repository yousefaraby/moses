import LoginForm from '@/components/admin/LoginForm';
import { getDict } from '@/lib/i18n';

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLogin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  // The demo hint shows only while the default password is in use.
  const demoPassword = process.env.ADMIN_PASSWORD ? null : 'moses-admin';
  return (
    <main className="admin-login" id="main">
      <LoginForm lang={lang} t={t} demoPassword={demoPassword} />
    </main>
  );
}
