/**
 * AdminDataContext.tsx
 * Provides Supabase-backed data and asynchronous CRUD operations for the admin dashboard.
 *
 * ARCHITECTURE BOUNDARY:
 * - Admin pages consume useAdminData() from this context.
 * - Public pages remain isolated on usePublicData().
 * - Mutations automatically refetch state from Supabase on success to maintain
 *   the database as the single source of truth.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Division, Project, Member, Album, Event, FAQ } from "../lib/types";
import type { StoreData, MutationResult } from "../lib/dataContract";
import {
  fetchAdminData,
  createDivision,
  updateDivision as apiUpdateDivision,
  deleteDivision as apiDeleteDivision,
  createProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
  createMember,
  updateMember as apiUpdateMember,
  deleteMember as apiDeleteMember,
  createAlbum,
  updateAlbum as apiUpdateAlbum,
  deleteAlbum as apiDeleteAlbum,
  createEvent,
  updateEvent as apiUpdateEvent,
  deleteEvent as apiDeleteEvent,
  createFaq,
  updateFaq as apiUpdateFaq,
  deleteFaq as apiDeleteFaq,
} from "../lib/adminData";

export interface AdminDataContextValue {
  divisions: Division[];
  projects: Project[];
  members: Member[];
  albums: Album[];
  events: Event[];
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addDivision: (data: Omit<Division, "id">) => Promise<MutationResult>;
  updateDivision: (id: string, patch: Partial<Omit<Division, "id">>) => Promise<MutationResult>;
  removeDivision: (id: string) => Promise<MutationResult>;
  addProject: (data: Omit<Project, "id">) => Promise<MutationResult>;
  updateProject: (id: string, patch: Partial<Omit<Project, "id">>) => Promise<MutationResult>;
  removeProject: (id: string) => Promise<MutationResult>;
  addMember: (data: Omit<Member, "id">) => Promise<MutationResult>;
  updateMember: (id: string, patch: Partial<Omit<Member, "id">>) => Promise<MutationResult>;
  removeMember: (id: string) => Promise<MutationResult>;
  addAlbum: (data: Omit<Album, "id">) => Promise<MutationResult>;
  updateAlbum: (id: string, patch: Partial<Omit<Album, "id">>) => Promise<MutationResult>;
  removeAlbum: (id: string) => Promise<MutationResult>;
  addEvent: (data: Omit<Event, "id">) => Promise<MutationResult>;
  updateEvent: (id: string, patch: Partial<Omit<Event, "id">>) => Promise<MutationResult>;
  removeEvent: (id: string) => Promise<MutationResult>;
  addFaq: (data: Omit<FAQ, "id">) => Promise<MutationResult>;
  updateFaq: (id: string, patch: Partial<Omit<FAQ, "id">>) => Promise<MutationResult>;
  removeFaq: (id: string) => Promise<MutationResult>;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAdminData();
      setData(res);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      const msg = err instanceof Error ? err.message : "Gagal memuat data admin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Wrapped mutation actions that automatically reconcile with Supabase
  const addDivision = useCallback(
    async (divisionData: Omit<Division, "id">): Promise<MutationResult> => {
      const result = await createDivision(divisionData, data?.divisions ?? []);
      if (result.ok) await loadData();
      return result;
    },
    [data?.divisions, loadData]
  );

  const updateDivision = useCallback(
    async (id: string, patch: Partial<Omit<Division, "id">>): Promise<MutationResult> => {
      const result = await apiUpdateDivision(id, patch);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const removeDivision = useCallback(
    async (id: string): Promise<MutationResult> => {
      const result = await apiDeleteDivision(id);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const addProject = useCallback(
    async (projectData: Omit<Project, "id">): Promise<MutationResult> => {
      const result = await createProject(projectData, data?.projects ?? []);
      if (result.ok) await loadData();
      return result;
    },
    [data?.projects, loadData]
  );

  const updateProject = useCallback(
    async (id: string, patch: Partial<Omit<Project, "id">>): Promise<MutationResult> => {
      const result = await apiUpdateProject(id, patch);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const removeProject = useCallback(
    async (id: string): Promise<MutationResult> => {
      const result = await apiDeleteProject(id);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const addMember = useCallback(
    async (memberData: Omit<Member, "id">): Promise<MutationResult> => {
      const result = await createMember(memberData, data?.members ?? []);
      if (result.ok) await loadData();
      return result;
    },
    [data?.members, loadData]
  );

  const updateMember = useCallback(
    async (id: string, patch: Partial<Omit<Member, "id">>): Promise<MutationResult> => {
      const result = await apiUpdateMember(id, patch);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const removeMember = useCallback(
    async (id: string): Promise<MutationResult> => {
      const result = await apiDeleteMember(id);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const addAlbum = useCallback(
    async (albumData: Omit<Album, "id">): Promise<MutationResult> => {
      const result = await createAlbum(albumData, data?.albums ?? []);
      if (result.ok) await loadData();
      return result;
    },
    [data?.albums, loadData]
  );

  const updateAlbum = useCallback(
    async (id: string, patch: Partial<Omit<Album, "id">>): Promise<MutationResult> => {
      const result = await apiUpdateAlbum(id, patch);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const removeAlbum = useCallback(
    async (id: string): Promise<MutationResult> => {
      const result = await apiDeleteAlbum(id);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const addEvent = useCallback(
    async (eventData: Omit<Event, "id">): Promise<MutationResult> => {
      const result = await createEvent(eventData);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const updateEvent = useCallback(
    async (id: string, patch: Partial<Omit<Event, "id">>): Promise<MutationResult> => {
      const result = await apiUpdateEvent(id, patch);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const removeEvent = useCallback(
    async (id: string): Promise<MutationResult> => {
      const result = await apiDeleteEvent(id);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const addFaq = useCallback(
    async (faqData: Omit<FAQ, "id">): Promise<MutationResult> => {
      const result = await createFaq(faqData, data?.faqs ?? []);
      if (result.ok) await loadData();
      return result;
    },
    [data?.faqs, loadData]
  );

  const updateFaq = useCallback(
    async (id: string, patch: Partial<Omit<FAQ, "id">>): Promise<MutationResult> => {
      const result = await apiUpdateFaq(id, patch);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const removeFaq = useCallback(
    async (id: string): Promise<MutationResult> => {
      const result = await apiDeleteFaq(id);
      if (result.ok) await loadData();
      return result;
    },
    [loadData]
  );

  const value: AdminDataContextValue = {
    divisions: data?.divisions ?? [],
    projects: data?.projects ?? [],
    members: data?.members ?? [],
    albums: data?.albums ?? [],
    events: data?.events ?? [],
    faqs: data?.faqs ?? [],
    loading,
    error,
    refetch: loadData,
    addDivision,
    updateDivision,
    removeDivision,
    addProject,
    updateProject,
    removeProject,
    addMember,
    updateMember,
    removeMember,
    addAlbum,
    updateAlbum,
    removeAlbum,
    addEvent,
    updateEvent,
    removeEvent,
    addFaq,
    updateFaq,
    removeFaq,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return ctx;
}
