import { CollectionEditor } from '@/components/admin/Editors';
import Tabs from '@/components/admin/Tabs';
import { adminContext } from '@/lib/adminData';
import { COLLECTIONS } from '@/lib/adminSchema';
import { getDict } from '@/lib/i18n';

export default async function CatalogAdmin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const { db, ctx } = await adminContext();
  const tab = (key) => ({
    id: key,
    label: COLLECTIONS[key].title[lang],
    content: <CollectionEditor saveAs={key} items={db[key]} schemaKey={key} ctx={ctx} lang={lang} t={t} />,
  });
  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{t.admin.nav.catalog}</h1>
      </div>
      <section className="admin-card">
        <Tabs label={t.admin.nav.catalog} tabs={['packages', 'addons', 'services', 'vehicleSizes', 'promos'].map(tab)} />
      </section>
    </div>
  );
}
