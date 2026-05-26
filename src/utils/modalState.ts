// @ts-nocheck
// Initial-state factories for the two modals App() owns (alert + smart confirm).
// Pure, no React.

export const createAlertModalState = () => ({
  isOpen: false,
  title: "",
  message: "",
  details: [] as any[],
  confirmLabel: "Confirm",
  dismissLabel: "Close",
  onConfirm: null as null | (() => void),
});

export const createSmartConfirmState = () => ({
  isOpen: false,
  title: "",
  message: "",
  details: [] as any[],
  confirmLabel: "Remove",
  cancelLabel: "Keep",
  onConfirm: null as null | (() => void),
  onCancel:  null as null | (() => void),
});
