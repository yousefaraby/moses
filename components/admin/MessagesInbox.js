'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Icon from '../Icon';
import { saveKey } from './Editors';
import { formatDateTime } from '@/lib/i18n';

export default function MessagesInbox({ lang, t, messages }) {
  const router = useRouter();
  const [list, setList] = useState(messages);
  const a = t.admin;
  async function commit(next) {
    setList(next);
    await saveKey('messages', next);
    router.refresh();
  }
  if (list.length === 0) return <p className="muted">{a.inboxEmpty}</p>;
  return (
    <ul className="inbox">
      {list.map((m) => (
        <li key={m.id} className={m.read ? '' : 'is-unread'}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="row">
              <span className="chip outline">{t.contact.topics[m.kind] || m.kind}</span>
              <strong>{m.name || m.email}</strong>
              {m.company && <span className="muted">· {m.company}</span>}
            </span>
            <span className="small muted">{formatDateTime(m.createdAt, lang)}</span>
          </div>
          {m.text && <p className="inbox-text">{m.text}</p>}
          <div className="row">
            {m.phone && (
              <a className="btn btn-ghost btn-sm latin" href={`tel:${m.phone}`}>
                <Icon name="phone" size={16} />
                {m.phone}
              </a>
            )}
            {m.email && (
              <a className="btn btn-ghost btn-sm latin" href={`mailto:${m.email}`}>
                <Icon name="mail" size={16} />
                {m.email}
              </a>
            )}
            {!m.read && (
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => commit(list.map((x) => (x.id === m.id ? { ...x, read: true } : x)))}>
                <Icon name="check" size={16} />
                {a.read}
              </button>
            )}
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => window.confirm(`${t.common.delete}?`) && commit(list.filter((x) => x.id !== m.id))}>
              <Icon name="trash" size={16} />
              {t.common.delete}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
