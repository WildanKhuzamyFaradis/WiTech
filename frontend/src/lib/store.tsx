import { createContext, useContext, useState, type ReactNode } from "react";
import {
  divisions as initialDivisions,
  projects as initialProjects,
  members as initialMembers,
  albums as initialAlbums,
  events as initialEvents,
  faqs as initialFaqs,
  type Division,
  type Project,
  type Member,
  type Album,
  type Event,
  type FAQ,
} from "./data";

interface StoreContextValue {
  divisions: Division[];
  projects: Project[];
  members: Member[];
  albums: Album[];
  events: Event[];
  faqs: FAQ[];

  addDivision: (d: Omit<Division, "id">) => void;
  updateDivision: (id: string, d: Partial<Division>) => void;
  removeDivision: (id: string) => void;

  addProject: (p: Omit<Project, "id">) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  removeProject: (id: string) => void;

  addMember: (m: Omit<Member, "id">) => void;
  updateMember: (id: string, m: Partial<Member>) => void;
  removeMember: (id: string) => void;

  addAlbum: (a: Omit<Album, "id">) => void;
  updateAlbum: (id: string, a: Partial<Album>) => void;
  removeAlbum: (id: string) => void;

  addEvent: (e: Omit<Event, "id">) => void;
  updateEvent: (id: string, e: Partial<Event>) => void;
  removeEvent: (id: string) => void;

  addFAQ: (f: Omit<FAQ, "id">) => void;
  updateFAQ: (id: string, f: Partial<FAQ>) => void;
  removeFAQ: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [divisions, setDivisions] = useState<Division[]>(initialDivisions);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);

  const value: StoreContextValue = {
    divisions,
    projects,
    members,
    albums,
    events,
    faqs,

    addDivision: (d) =>
      setDivisions((prev) => [{ ...d, id: crypto.randomUUID() }, ...prev]),
    updateDivision: (id, d) =>
      setDivisions((prev) => prev.map((x) => (x.id === id ? { ...x, ...d } : x))),
    removeDivision: (id) =>
      setDivisions((prev) => prev.filter((x) => x.id !== id)),

    addProject: (p) =>
      setProjects((prev) => [{ ...p, id: crypto.randomUUID() }, ...prev]),
    updateProject: (id, p) =>
      setProjects((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x))),
    removeProject: (id) =>
      setProjects((prev) => prev.filter((x) => x.id !== id)),

    addMember: (m) =>
      setMembers((prev) => [{ ...m, id: crypto.randomUUID() }, ...prev]),
    updateMember: (id, m) =>
      setMembers((prev) => prev.map((x) => (x.id === id ? { ...x, ...m } : x))),
    removeMember: (id) =>
      setMembers((prev) => prev.filter((x) => x.id !== id)),

    addAlbum: (a) =>
      setAlbums((prev) => [{ ...a, id: crypto.randomUUID() }, ...prev]),
    updateAlbum: (id, a) =>
      setAlbums((prev) => prev.map((x) => (x.id === id ? { ...x, ...a } : x))),
    removeAlbum: (id) =>
      setAlbums((prev) => prev.filter((x) => x.id !== id)),

    addEvent: (e) =>
      setEvents((prev) => [{ ...e, id: crypto.randomUUID() }, ...prev]),
    updateEvent: (id, e) =>
      setEvents((prev) => prev.map((x) => (x.id === id ? { ...x, ...e } : x))),
    removeEvent: (id) =>
      setEvents((prev) => prev.filter((x) => x.id !== id)),

    addFAQ: (f) =>
      setFaqs((prev) => [{ ...f, id: crypto.randomUUID() }, ...prev]),
    updateFAQ: (id, f) =>
      setFaqs((prev) => prev.map((x) => (x.id === id ? { ...x, ...f } : x))),
    removeFAQ: (id) =>
      setFaqs((prev) => prev.filter((x) => x.id !== id)),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// ponytail: client-side only state; swap for API calls when backend is ready
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
