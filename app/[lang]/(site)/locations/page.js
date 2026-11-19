import BranchMap from '@/components/BranchMap';
import LocationsList from '@/components/LocationsList';
import { PageHead } from '@/components/ui/bits';
import { getContent } from '@/lib/content';
import { getDict } from '@/lib/i18n';
import { zonedNow } from '@/lib/time';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).locations.title };
}

export default async function LocationsPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const c = await getContent();
  const now = zonedNow(c.settings.timezone);
  return (
    <>
      <PageHead title={t.locations.title} intro={t.locations.intro} art={<BranchMap branches={c.branches} lang={lang} label={t.locations.mapLabel} />} />
      <section className="section">
        <div className="container">
          <LocationsList lang={lang} t={t} branches={c.branches} facilities={c.facilities} todayWeekday={now.weekday} />
        </div>
      </section>
    </>
  );
}
