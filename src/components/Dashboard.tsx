import React, { useEffect, useState, useRef } from "react";
import styles from "./dashboard.module.css";
import ShortcutCard from "./ShortcutCard";
import ClockWidget from "./widgets/ClockWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import WeatherWidget from "./widgets/WeatherWidget";

type Item = {
  id: string;
  type: "app" | "file" | "link";
  title: string;
  url?: string;
  fileName?: string;
  width?: number;
  height?: number;
};

type Category = {
  id: string;
  title: string;
  items: Item[];
};

const STORAGE_KEY = "aat:dashboard:v1";

export default function Dashboard {
  const defaultCats: Category[] = [
    { id: "c-1", title: "General", items: [] },
    { id: "c-2", title: "Work", items: [] },
  ];

  const [categories, setCategories] = useState<Category[]>(defaultCats);

  const [editMode, setEditMode] = useState(false);
  const [gridLocked, setGridLocked] = useState(true);

  // undo/redo history
  const historyRef = useRef<Category[][]>([]);
  const historyIndexRef = useRef<number>(-1);

  // persist categories client-side only
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCategories(JSON.parse(raw));
    } catch (e) {
      setCategories(defaultCats);
    }
    // load on mount and then persist on changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {}
  }, [categories]);

  // push snapshot to history (for edit-mode actions)
  function pushHistory(next: Category[]) {
    const h = historyRef.current;
    const idx = historyIndexRef.current;
    const trimmed = h.slice(0, idx + 1);
    trimmed.push(JSON.parse(JSON.stringify(next)));
    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
  }

  useEffect(() => {
    // initialize history
    pushHistory(categories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyAndPush(next: Category[]) {
    setCategories(next);
    pushHistory(next);
  }

  function undo() {
    const idx = historyIndexRef.current;
    if (idx > 0) {
      historyIndexRef.current = idx - 1;
      const snap = historyRef.current[historyIndexRef.current];
      setCategories(JSON.parse(JSON.stringify(snap)));
    }
  }

  function redo() {
    const idx = historyIndexRef.current;
    const h = historyRef.current;
    if (idx < h.length - 1) {
      historyIndexRef.current = idx + 1;
      const snap = h[historyIndexRef.current];
      setCategories(JSON.parse(JSON.stringify(snap)));
    }
  }

  // drag & drop (HTML5) - reordering between categories
  function handleDrop(e: React.DragEvent, toCategoryId: string, toIndex?: number) {
    e.preventDefault();
    const payload = e.dataTransfer.getData("application/json");
    if (!payload) return;
    try {
      const { fromCategoryId, itemId } = JSON.parse(payload);
      if (fromCategoryId === toCategoryId) {
        // reorder within same category if index provided
        const cat = categories.find((c) => c.id === fromCategoryId);
        if (!cat) return;
        const fromIdx = cat.items.findIndex((it) => it.id === itemId);
        if (fromIdx === -1) return;
        const newItems = [...cat.items];
        const [moved] = newItems.splice(fromIdx, 1);
        const insertAt = typeof toIndex === "number" ? toIndex : newItems.length;
        newItems.splice(insertAt, 0, moved);
        const next = categories.map((c) => (c.id === cat.id ? { ...c, items: newItems } : c));
        applyAndPush(next);
        return;
      }

      // move across categories
      const fromCat = categories.find((c) => c.id === fromCategoryId);
      const toCat = categories.find((c) => c.id === toCategoryId);
      if (!fromCat || !toCat) return;
      const itemIdx = fromCat.items.findIndex((it) => it.id === itemId);
      if (itemIdx === -1) return;
      const newFromItems = [...fromCat.items];
      const [moved] = newFromItems.splice(itemIdx, 1);
      const newToItems = [...toCat.items];
      const insertAt = typeof toIndex === "number" ? toIndex : newToItems.length;
      newToItems.splice(insertAt, 0, moved);
      const next = categories.map((c) => {
        if (c.id === fromCat.id) return { ...c, items: newFromItems };
        if (c.id === toCat.id) return { ...c, items: newToItems };
        return c;
      });
      applyAndPush(next);
    } catch (err) {
      console.error(err);
    }
  }

  function handleDeleteCategory(id: string) {
    const next = categories.filter((c) => c.id !== id);
    applyAndPush(next);
  }

  function handleAddCategory() {
    const id = `c-${Date.now()}`;
    const next = [...categories, { id, title: "New Category", items: [] }];
    applyAndPush(next);
  }

  function handleEditCategoryTitle(id: string, title: string) {
    const next = categories.map((c) => (c.id === id ? { ...c, title } : c));
    applyAndPush(next);
  }

  function handleAddLink(categoryId: string, title: string, url: string) {
    const id = `i-${Date.now()}`;
    const next = categories.map((c) =>
      c.id === categoryId ? { ...c, items: [...c.items, { id, type: "link", title, url }] } : c
    );
    applyAndPush(next);
  }

  function handleAddFile(categoryId: string, file: File) {
    const id = `i-${Date.now()}`;
    const title = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const next = categories.map((c) =>
        c.id === categoryId
          ? { ...c, items: [...c.items, { id, type: "file", title, fileName: title, url: dataUrl }] }
          : c
      );
      applyAndPush(next);
    };
    reader.readAsDataURL(file);
  }

  function handleResizeItem(categoryId: string, itemId: string, w?: number, h?: number) {
    const next = categories.map((c) =>
      c.id === categoryId
        ? {
            ...c,
            items: c.items.map((it) => (it.id === itemId ? { ...it, width: w ?? it.width, height: h ?? it.height } : it)),
          }
        : c
    );
    applyAndPush(next);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Anything All Trades — Dashboard</h1>
        <div className={styles.controls}>
          <button onClick={() => setEditMode((s) => !s)} className={editMode ? styles.btnActive : ""}>
            {editMode ? "Exit Edit" : "Enter Edit"}
          </button>
          <button onClick={() => setGridLocked((s) => !s)}>{gridLocked ? "Unlock Grid" : "Lock Grid"}</button>
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>
          <button onClick={handleAddCategory}>Add Category</button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.widgets}>
          <ClockWidget />
          <CalendarWidget />
          <WeatherWidget />
        </section>

        <section className={styles.categories}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.category} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, cat.id)}>
              <div className={styles.categoryHeader}>
                {editMode ? (
                  <input
                    className={styles.titleInput}
                    value={cat.title}
                    onChange={(e) => handleEditCategoryTitle(cat.id, e.target.value)}
                  />
                ) : (
                  <h2>{cat.title}</h2>
                )}
                {editMode && (
                  <div>
                    <button onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                    <label className={styles.fileLabel}>
                      + Add File
                      <input
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleAddFile(cat.id, f);
                        }}
                      />
                    </label>
                    <button
                      onClick={() => {
                        const title = window.prompt("Shortcut title:") || "New Link";
                        const url = window.prompt("URL:") || "";
                        if (url) handleAddLink(cat.id, title, url);
                      }}
                    >
                      + Add Link
                    </button>
                  </div>
                )}
              </div>

              <div className={gridLocked ? styles.gridLocked : styles.grid}>
                {cat.items.map((it, idx) => (
                  <div key={it.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, cat.id, idx)}>
                    <ShortcutCard
                      categoryId={cat.id}
                      item={it}
                      editMode={editMode}
                      onResize={(w, h) => handleResizeItem(cat.id, it.id, w, h)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
