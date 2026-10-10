"use client";

import { useEffect, useRef, type ReactNode } from "react";

let activeDialogs = 0;
let originalOverflow = "";

// Native modal dialogs contain focus, make the background inert, and restore focus.
export function Dialog({ children, labelledBy, describedBy, onClose, drawer = false, wide = false }: {
  children: ReactNode;
  labelledBy: string;
  describedBy?: string;
  onClose: () => void;
  drawer?: boolean;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (activeDialogs === 0) originalOverflow = document.body.style.overflow;
    activeDialogs++;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      activeDialogs--;
      if (activeDialogs === 0) document.body.style.overflow = originalOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={ref} aria-modal="true" aria-labelledby={labelledBy} aria-describedby={describedBy} className={`ui-dialog ${drawer ? "ui-dialog-drawer" : ""} ${wide ? "ui-dialog-wide" : ""}`} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}>{children}</dialog>;
}
