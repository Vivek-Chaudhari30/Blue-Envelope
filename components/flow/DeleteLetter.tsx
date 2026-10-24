"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { t, type Lang } from "@/lib/i18n";
import { clearLetter } from "@/lib/chat/store";

/**
 * "Delete my letter" — clears the photo, OCR text, chat and extracted values
 * from memory and localStorage, then confirms. Nothing was on our servers.
 */
export function DeleteLetter({
  lang,
  onDeleted,
}: {
  lang: Lang;
  onDeleted?: () => void;
}) {
  const [done, setDone] = useState(false);

  function remove() {
    clearLetter();
    setDone(true);
    onDeleted?.();
  }

  if (done) {
    return <p className="note">{t("delete_confirm", lang)}</p>;
  }
  return (
    <Button variant="secondary" onClick={remove}>
      🗑 {t("delete_letter", lang)}
    </Button>
  );
}
