import { useState } from 'react';
import QuickAddModal from './vocab/QuickAddModal';

export default function QuickAddButton({ apiKey, onSave, isDuplicate }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="quick-add-fab" onClick={() => setOpen(true)} title="Wort schnell hinzufügen">
        + Wort
      </button>
      {open && (
        <QuickAddModal
          apiKey={apiKey}
          onSave={onSave}
          onClose={() => setOpen(false)}
          isDuplicate={isDuplicate}
        />
      )}
    </>
  );
}
