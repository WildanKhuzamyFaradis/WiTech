import assert from "node:assert/strict";
import test from "node:test";
import {
  divisionName,
  formatEventDate,
  formatEventTime,
  isEventCompleted,
  isPublishedProject,
  isValidDate,
  isValidTime,
  todayInJakarta,
  validateStoreData,
  withDerivedCounts,
  type StoreData,
} from "../src/lib/dataContract";
import type { Division, Project, Member, Album, Event, FAQ } from "../src/lib/types";

// Small, isolated local test fixtures (no dependence on runtime Supabase or data.ts)
const mockDivisions: Division[] = [
  {
    id: "academy",
    name: "WiTECH Academy",
    shortName: "Academy",
    description: "Divisi Academy",
    icon: "Smartphone",
    memberCount: 0,
    color: "#ff5e5b",
    technologies: ["Mentoring"],
  },
  {
    id: "lab",
    name: "WiTECH Lab",
    shortName: "Lab",
    description: "Divisi Lab",
    icon: "Code",
    memberCount: 0,
    color: "#6366f1",
    technologies: ["Kolaborasi"],
  },
];

const mockProjects: Project[] = [
  {
    id: "p1",
    slug: "wilearn-platform",
    title: "WiLearn",
    subtitle: "Platform E-Learning",
    description: "Deskripsi",
    divisionId: "lab",
    tags: ["React"],
    year: 2024,
    status: "published",
    featured: true,
    image: "/foto-proyek/test.jpg",
    members: ["Budi"],
  },
  {
    id: "p2",
    slug: "draft-project",
    title: "Draft Project",
    subtitle: "Subtitle Draft",
    description: "Deskripsi",
    divisionId: "academy",
    tags: ["Node"],
    year: 2024,
    status: "draft",
    featured: false,
    image: "/foto-proyek/draft.jpg",
    members: ["Ani"],
  },
];

const mockMembers: Member[] = [
  {
    id: "m1",
    name: "Core Member",
    role: "Ketua",
    divisionId: null,
    year: "2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Core",
    github: "",
    linkedin: "",
    active: true,
  },
  {
    id: "m2",
    name: "Lab Member 1",
    role: "Anggota",
    divisionId: "lab",
    year: "2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lab1",
    github: "",
    linkedin: "",
    active: true,
  },
  {
    id: "m3",
    name: "Lab Member Inactive",
    role: "Alumni",
    divisionId: "lab",
    year: "2023",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lab2",
    github: "",
    linkedin: "",
    active: false,
  },
];

const mockAlbums: Album[] = [
  {
    id: "a1",
    slug: "makrab-2024",
    title: "Makrab 2024",
    description: "Kegiatan makrab",
    coverImage: "/foto-kegiatan/cover.jpg",
    date: "2024-11-20",
    photoCount: 0,
    photos: ["/photo1.jpg", "/photo2.jpg", "/photo3.jpg"],
  },
];

const mockEvents: Event[] = [
  {
    id: "e1",
    title: "Workshop Web Dev",
    date: "2026-09-18",
    startTime: "09:00",
    endTime: "12:00",
    location: "Lab Komputer",
    type: "Workshop",
    description: "Belajar web dev",
    image: "/poster.jpg",
    registrationOpen: true,
  },
];

const mockFaqs: FAQ[] = [
  {
    id: "f1",
    question: "Apa itu WiTech?",
    answer: "UKM Teknologi di kampus.",
  },
];

const createValidStoreData = (): StoreData => ({
  divisions: structuredClone(mockDivisions),
  projects: structuredClone(mockProjects),
  members: structuredClone(mockMembers),
  albums: structuredClone(mockAlbums),
  events: structuredClone(mockEvents),
  faqs: structuredClone(mockFaqs),
});

// ── Tests ──────────────────────────────────────────────────────────────────

test("divisionName returns 'Core' for null and looks up division name by ID", () => {
  assert.equal(divisionName(mockDivisions, null), "Core");
  assert.equal(divisionName(mockDivisions, "lab"), "WiTECH Lab");
  assert.equal(divisionName(mockDivisions, "academy"), "WiTECH Academy");
  assert.equal(divisionName(mockDivisions, "unknown-id"), "Divisi tidak ditemukan");
  assert.equal(divisionName([], "lab"), "Divisi tidak ditemukan");
});

test("isPublishedProject correctly identifies publication status", () => {
  assert.equal(isPublishedProject(mockProjects[0]), true);
  assert.equal(isPublishedProject(mockProjects[1]), false);
});

test("isValidDate validates ISO YYYY-MM-DD calendar dates strictly", () => {
  assert.equal(isValidDate("2026-09-18"), true);
  assert.equal(isValidDate("2028-02-29"), true); // leap year
  assert.equal(isValidDate("2026-02-29"), false); // non-leap year
  assert.equal(isValidDate("2026-04-31"), false); // April has 30 days
  assert.equal(isValidDate("2026-13-01"), false); // invalid month
  assert.equal(isValidDate("0000-01-01"), false); // year zero
  assert.equal(isValidDate("18 September 2026"), false);
  assert.equal(isValidDate(""), false);
});

test("isValidTime validates 24-hour HH:mm time format", () => {
  assert.equal(isValidTime("09:00"), true);
  assert.equal(isValidTime("13:15"), true);
  assert.equal(isValidTime("23:59"), true);
  assert.equal(isValidTime("00:00"), true);
  assert.equal(isValidTime("24:00"), false);
  assert.equal(isValidTime("09:60"), false);
  assert.equal(isValidTime("9:00"), false);
  assert.equal(isValidTime("09:00 WIB"), false);
  assert.equal(isValidTime(""), false);
});

test("formatEventDate formats date to Indonesian locale with Asia/Jakarta timezone", () => {
  assert.equal(formatEventDate("2026-09-18"), "18 September 2026");
  assert.equal(formatEventDate("2024-01-01"), "1 Januari 2024");
});

test("formatEventTime formats event duration with WIB suffix", () => {
  assert.equal(formatEventTime(mockEvents[0]), "09:00 - 12:00 WIB");
});

test("isEventCompleted computes completion using WIB end time", () => {
  const event = mockEvents[0]; // 2026-09-18 12:00 WIB = 2026-09-18 05:00 UTC
  assert.equal(isEventCompleted(event, new Date("2026-09-18T04:59:59Z")), false);
  assert.equal(isEventCompleted(event, new Date("2026-09-18T05:00:00Z")), true);
  assert.equal(isEventCompleted(event, new Date("2026-09-18T06:00:00Z")), true);
});

test("todayInJakarta returns YYYY-MM-DD for Jakarta timezone (UTC+7)", () => {
  // 18:00 UTC on Sept 17 = 01:00 WIB on Sept 18
  assert.equal(todayInJakarta(new Date("2026-09-17T18:00:00Z")), "2026-09-18");
  // 16:59 UTC on Sept 17 = 23:59 WIB on Sept 17
  assert.equal(todayInJakarta(new Date("2026-09-17T16:59:00Z")), "2026-09-17");
});

test("withDerivedCounts calculates memberCount for active division members and photoCount for albums", () => {
  const data = createValidStoreData();
  const derived = withDerivedCounts(data);

  // mockMembers has: 1 active in 'lab', 1 inactive in 'lab', 1 in 'Core' (null)
  const lab = derived.divisions.find((d) => d.id === "lab")!;
  assert.equal(lab.memberCount, 1);

  const academy = derived.divisions.find((d) => d.id === "academy")!;
  assert.equal(academy.memberCount, 0);

  // mockAlbums has 3 photos in mock
  assert.equal(derived.albums[0].photoCount, 3);
});

test("validateStoreData checks cross-resource references, slug format, and event intervals", () => {
  const data = createValidStoreData();
  assert.equal(validateStoreData(data), null);

  // Invalid slug
  const badSlug = createValidStoreData();
  badSlug.projects[0].slug = "INVALID SLUG";
  assert.match(validateStoreData(badSlug) ?? "", /kebab-case/);

  // Duplicate slug
  const dupSlug = createValidStoreData();
  dupSlug.projects[1].slug = dupSlug.projects[0].slug;
  assert.match(validateStoreData(dupSlug) ?? "", /sudah digunakan/);

  // Missing division reference
  const missingDiv = createValidStoreData();
  missingDiv.projects[0].divisionId = "non-existent-division";
  assert.match(validateStoreData(missingDiv) ?? "", /Divisi proyek tidak valid/);

  // Event end time before or equal to start time
  const badEvent = createValidStoreData();
  badEvent.events[0].endTime = "08:00";
  assert.match(validateStoreData(badEvent) ?? "", /Jam selesai harus setelah jam mulai/);
});
