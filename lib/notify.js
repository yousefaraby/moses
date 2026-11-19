import 'server-only';
import { fillTemplate, findById } from './engine';
import { formatDate, formatMoney, formatTime, tr } from './i18n';
import { newId } from './db';

/**
 * Queue the messages a booking event would send (SMS / WhatsApp / email).
 * In this demo they land in `db.outbox`, visible in Admin › Notifications.
 * Plug a real provider (Twilio, WhatsApp Cloud API, SES…) in here later.
 */
export function queueMessages(db, booking, event, origin = '') {
  const template = (db.templates || []).find((t) => t.timing === event || t.id === event);
  if (!template) return;
  const lang = booking.lang === 'en' ? 'en' : 'ar';
  const branch = findById(db.branches, booking.branchId);
  const vars = {
    code: booking.code,
    branch: tr(branch?.name, lang),
    date: formatDate(booking.date, lang),
    time: formatTime(booking.start, lang),
    total: formatMoney(booking.price.total, lang, db.settings.currency),
    name: booking.customer.name,
    link: `${origin}/${lang}/booking/${booking.id}?t=${booking.token}`,
  };
  const body = fillTemplate(tr(template.body, lang), vars);
  const at = new Date().toISOString();
  db.outbox = db.outbox || [];
  for (const channel of template.channels || []) {
    const to = channel === 'email' ? booking.customer.email : booking.customer.phone;
    if (!to) continue;
    db.outbox.unshift({ id: newId('o'), channel, to, body, at, bookingId: booking.id, template: template.id });
  }
  db.outbox = db.outbox.slice(0, 300);
}
