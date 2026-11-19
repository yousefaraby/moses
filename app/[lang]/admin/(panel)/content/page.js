import { CollectionEditor, ObjectEditor } from '@/components/admin/Editors';
import Tabs from '@/components/admin/Tabs';
import { adminContext } from '@/lib/adminData';
import { COLLECTIONS, OBJECTS } from '@/lib/adminSchema';
import { getDict } from '@/lib/i18n';

export default async function ContentAdmin({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const { db, ctx } = await adminContext();
  const obj = (key) => ({ id: key, label: OBJECTS[key].title[lang], content: <ObjectEditor saveAs={key} value={db[key]} schemaKey={key} ctx={ctx} lang={lang} t={t} /> });
  const col = (key) => ({ id: key, label: COLLECTIONS[key].title[lang], content: <CollectionEditor saveAs={key} items={db[key]} schemaKey={key} ctx={ctx} lang={lang} t={t} /> });
  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1 className="h2">{t.admin.nav.content}</h1>
      </div>
      <section className="admin-card">
        <Tabs label={t.admin.nav.content} tabs={[obj('home'), obj('about'), col('faqs'), col('reviews'), col('gallery'), col('jobs'), col('legal'), col('facilities'), obj('brief')]} />
      </section>
    </div>
  );
}
