'use client';

import { useState } from 'react';
import Icon from '../Icon';
import { postJson } from '@/lib/client';

// Generic enquiry form → /api/messages → Admin › Inbox.
// fields: [{ name, label, type, required, options, autoComplete, span }]
export default function MessageForm({ kind, fields, submitLabel, successText, errorText, sendingText, extra = {}, idPrefix = 'mf', topicField }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.name, f.defaultValue || ''])));
  const [state, setState] = useState('idle');

  async function onSubmit(e) {
    e.preventDefault();
    setState('sending');
    const chosenKind = topicField ? values[topicField] || kind : kind;
    const res = await postJson('/api/messages', { kind: chosenKind, ...extra, ...values });
    setState(res.ok ? 'done' : 'error');
  }

  if (state === 'done') {
    return (
      <p className="notice ok" role="status">
        <Icon name="check" size={20} />
        {successText}
      </p>
    );
  }

  return (
    <form className="form-grid two" onSubmit={onSubmit} noValidate={false}>
      {fields.map((f) => {
        const id = `${idPrefix}-${f.name}`;
        const common = {
          id,
          name: f.name,
          required: f.required,
          autoComplete: f.autoComplete,
          value: values[f.name],
          onChange: (e) => setValues((v) => ({ ...v, [f.name]: e.target.value })),
        };
        return (
          <div key={f.name} className={`field ${f.span ? 'span-2' : ''}`}>
            <label htmlFor={id}>
              {f.label}
              {!f.required && f.optionalText ? <span className="muted"> ({f.optionalText})</span> : null}
            </label>
            {f.type === 'textarea' ? (
              <textarea className="textarea" {...common} />
            ) : f.type === 'select' ? (
              <select className="select" {...common}>
                {f.options.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            ) : (
              <input className="input" type={f.type || 'text'} inputMode={f.inputMode} {...common} />
            )}
          </div>
        );
      })}
      {state === 'error' && (
        <p className="notice danger span-2" role="alert">
          <Icon name="alert" size={20} />
          {errorText}
        </p>
      )}
      <div className="span-2">
        <button type="submit" className="btn btn-primary btn-lg" disabled={state === 'sending'}>
          {state === 'sending' ? sendingText : submitLabel}
        </button>
      </div>
    </form>
  );
}
