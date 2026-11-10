import { useEffect, useRef, type ReactNode } from 'react';
export function ConfirmationDialog({
  title,
  confirmLabel,
  children,
  onCancel,
  onConfirm,
  confirmDisabled = false,
}: {
  title: string;
  confirmLabel: string;
  children: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const node = dialog.current!;
    node.showModal();
    cancel.current?.focus();
    return () => node.close();
  }, []);
  function cancelDialog() {
    dialog.current?.close();
    onCancel();
  }
  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        cancelDialog();
      }}
    >
      <h5>{title}</h5>
      {children}
      <button ref={cancel} onClick={cancelDialog}>
        Cancelar
      </button>
      <button
        disabled={confirmDisabled}
        onClick={() => {
          dialog.current?.close();
          onConfirm();
        }}
      >
        {confirmLabel}
      </button>
    </dialog>
  );
}
