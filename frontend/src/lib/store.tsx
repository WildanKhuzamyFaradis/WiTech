import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { divisions, projects, members, albums, events, faqs } from "./data";
import type { Division, Project, Member, Album, Event, FAQ } from "./types";
import { validateStoreData, withDerivedCounts, type MutationResult, type StoreData } from "./dataContract";

export const initialStoreData: StoreData = { divisions, projects, members, albums, events, faqs };

// Synchronous local mutations. Rejections never commit a partial change.
export function createStoreActions(read: () => StoreData, write: (next: StoreData) => void) {
  function change(transform: (current: StoreData) => StoreData): MutationResult {
    const next = transform(read());
    const error = validateStoreData(next);
    if (error) return { ok: false, error };
    write(withDerivedCounts(next));
    return { ok: true };
  }

  function resource<T extends { id: string }>(
    get: (data: StoreData) => T[],
    set: (data: StoreData, rows: T[]) => StoreData,
  ) {
    return {
      add: (value: Omit<T, "id">) => change(data => set(data, [{ ...value, id: crypto.randomUUID() } as T, ...get(data)])),
      update: (id: string, patch: Partial<Omit<T, "id">>): MutationResult => {
        if (!get(read()).some(row => row.id === id)) return { ok: false, error: "Data tidak ditemukan." };
        return change(data => set(data, get(data).map(row => row.id === id ? { ...row, ...patch, id: row.id } : row)));
      },
      remove: (id: string) => change(data => set(data, get(data).filter(row => row.id !== id))),
    };
  }
  const divisions = resource<Division>(s => s.divisions, (s, rows) => ({ ...s, divisions: rows }));
  const projects = resource<Project>(s => s.projects, (s, rows) => ({ ...s, projects: rows }));
  const members = resource<Member>(s => s.members, (s, rows) => ({ ...s, members: rows }));
  const albums = resource<Album>(s => s.albums, (s, rows) => ({ ...s, albums: rows }));
  const events = resource<Event>(s => s.events, (s, rows) => ({ ...s, events: rows }));
  const faqs = resource<FAQ>(s => s.faqs, (s, rows) => ({ ...s, faqs: rows }));

  return {
    addDivision: divisions.add, updateDivision: divisions.update, removeDivision: divisions.remove,
    addProject: projects.add, updateProject: projects.update, removeProject: projects.remove,
    addMember: members.add, updateMember: members.update, removeMember: members.remove,
    addAlbum: albums.add, updateAlbum: albums.update, removeAlbum: albums.remove,
    addEvent: events.add, updateEvent: events.update, removeEvent: events.remove,
    addFAQ: faqs.add, updateFAQ: faqs.update, removeFAQ: faqs.remove,
  };
}

type StoreContextValue = StoreData & ReturnType<typeof createStoreActions>;
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children, initialData = initialStoreData }: { children: ReactNode; initialData?: StoreData }) {
  const [data, setData] = useState(() => withDerivedCounts(structuredClone(initialData)));
  const current = useRef(data);
  const actions = createStoreActions(() => current.current, next => {
    // Keep consecutive mutations in the same event consistent before React re-renders.
    current.current = next;
    setData(next);
  });
  return <StoreContext.Provider value={{ ...data, ...actions }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
