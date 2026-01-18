import React, { useRef } from "react";
import styles from "./dashboard.module.css";

export default function ShortcutCard({
  categoryId,
  item,
  editMode,
  onResize,
}: {
  categoryId: string;
  item: any;
  editMode: boolean;
  onResize?: (w?: number, h?: number) => void;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("application/json", JSON.stringify({ fromCategoryId: categoryId, itemId: item.id }));
    e.dataTransfer.effectAllowed = "move";
  }

  function handleResizeStop() {
    if (!elRef.current) return;
    const rect = elRef.current.getBoundingClientRect();
    onResize?.(Math.round(rect.width), Math.round(rect.height));
  }

  return (
    <div
      ref={elRef}
      className={styles.shortcut}
      draggable={!editMode}
      onDragStart={onDragStart}
      style={{ width: item.width ? item.width : undefined, height: item.height ? item.height : undefined }}
    >
      <div className={styles.shortcutInner}>
        <div className={styles.icon}>{item.type === "link" ? "🔗" : item.type === "file" ? "📄" : "🗂️"}</div>
        <div className={styles.label}>{item.title}</div>
      </div>

      {editMode && (
        <div className={styles.resizerWrap}>
          <div className={styles.resizer} onMouseUp={handleResizeStop} />
          <div className={styles.resizerCorner} onMouseUp={handleResizeStop} />
        </div>
      )}
    </div>
  );
}
