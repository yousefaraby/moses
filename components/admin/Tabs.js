'use client';

import { useState } from 'react';

export default function Tabs({ tabs, label }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div className="tabs" role="tablist" aria-label={label}>
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" id={`t-${tab.id}`} aria-controls={`p-${tab.id}`} aria-selected={active === tab.id} onClick={() => setActive(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div key={tab.id} role="tabpanel" id={`p-${tab.id}`} aria-labelledby={`t-${tab.id}`} hidden={active !== tab.id}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
