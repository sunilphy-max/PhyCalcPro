"use client";

import { useCallback, useState } from "react";

/** Products module catalog drawer — default closed so three-column calculators get max width. */
export function useProductsNavDrawer() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const openDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  return { open, setOpen, toggle, close, openDrawer };
}
