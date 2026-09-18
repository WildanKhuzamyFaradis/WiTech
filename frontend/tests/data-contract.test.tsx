import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router";
import { createStoreActions, initialStoreData, StoreProvider } from "../src/lib/store";
import {
  divisionName, formatEventDate, formatEventTime, isEventCompleted,
  isValidDate, isValidTime, todayInJakarta, validateStoreData, withDerivedCounts,
  type MutationResult, type StoreData,
} from "../src/lib/dataContract";
import Home from "../src/pages/public/Home";
import Divisions from "../src/pages/public/Divisions";
import Portfolio from "../src/pages/public/Portfolio";
import ProjectDetail from "../src/pages/public/ProjectDetail";
import Members from "../src/pages/public/Members";
import Gallery from "../src/pages/public/Gallery";
import Events from "../src/pages/public/Events";
import FAQ from "../src/pages/public/FAQ";
import Contact from "../src/pages/public/Contact";
import AdminPortfolio from "../src/pages/admin/AdminPortfolio";
import AdminEvents from "../src/pages/admin/AdminEvents";

// Use the same mutations as StoreProvider. Re-render actual pages against the
// resulting snapshot; this verifies logic/data flow, not browser interactions.
function localStore() {
  let data = withDerivedCounts(structuredClone(initialStoreData));
  const actions = createStoreActions(() => data, next => { data = next; });
  return { actions, get data() { return data; } };
}

function accepted(result: MutationResult) {
  assert.deepEqual(result, { ok: true });
}

function rejectedWithoutWrite(store: ReturnType<typeof localStore>, action: () => MutationResult) {
  const before = store.data;
  assert.equal(action().ok, false);
  assert.equal(store.data, before, "Rejected mutation must not commit or partially modify state");
}

function render(Page: React.ComponentType, data: StoreData, url = "/") {
  return renderToStaticMarkup(
    <StoreProvider initialData={data}>
      <MemoryRouter initialEntries={[url]}>
        <Routes><Route path={Page === ProjectDetail ? "/portfolio/:slug" : "*"} element={<Page />} /></Routes>
      </MemoryRouter>
    </StoreProvider>,
  );
}

test("fixtures conform to stable division IDs, Core nullability, and machine-readable dates", () => {
  assert.equal(validateStoreData(initialStoreData), null);
  assert.equal(initialStoreData.divisions.length, 5);
  assert.equal(initialStoreData.members.filter(m => m.divisionId === null).length, 7);
  assert.equal(divisionName(initialStoreData.divisions, null), "Core");
  assert.ok(initialStoreData.projects.every(p => initialStoreData.divisions.some(d => d.id === p.divisionId)));
  assert.ok(initialStoreData.projects.every(p => !("division" in p)));
  assert.ok(initialStoreData.members.every(m => !("division" in m)));
  for (const event of initialStoreData.events) {
    assert.ok(isValidDate(event.date));
    assert.ok(isValidTime(event.startTime));
    assert.ok(isValidTime(event.endTime));
  }
});

test("admin add/edit reaches public Portfolio and detail without changing fixtures", () => {
  const store = localStore();
  const fixturesBefore = structuredClone(initialStoreData);
  const { id, ...template } = store.data.projects[0];
  accepted(store.actions.addProject({ ...template, slug: "stage-two-project", title: "Stage Two Added", featured: true }));
  const added = store.data.projects.find(p => p.slug === "stage-two-project")!;
  assert.match(render(Portfolio, store.data), /Stage Two Added/);
  assert.match(render(ProjectDetail, store.data, "/portfolio/stage-two-project"), /Stage Two Added/);
  accepted(store.actions.updateProject(added.id, { title: "Stage Two Edited" }));
  assert.match(render(Portfolio, store.data), /Stage Two Edited/);
  assert.doesNotMatch(render(Portfolio, store.data), /Stage Two Added/);
  accepted(store.actions.removeProject(added.id));
  assert.doesNotMatch(render(Portfolio, store.data), /Stage Two Edited/);
  assert.deepEqual(initialStoreData, fixturesBefore);
});

test("featured drafts stay visible in admin but absent from all public project surfaces", () => {
  const store = localStore();
  const project = store.data.projects[0];
  accepted(store.actions.updateProject(project.id, { title: "Private Draft Marker", status: "draft", featured: true }));
  assert.match(render(AdminPortfolio, store.data), /Private Draft Marker/);
  assert.doesNotMatch(render(Portfolio, store.data), /Private Draft Marker/);
  assert.doesNotMatch(render(Home, store.data), /Private Draft Marker/);
  const detail = render(ProjectDetail, store.data, `/portfolio/${project.slug}`);
  assert.match(detail, /Proyek Nggak Ketemu/);
  assert.doesNotMatch(detail, /Private Draft Marker/);
  accepted(store.actions.updateProject(project.id, { status: "published" }));
  assert.match(render(Portfolio, store.data), /Private Draft Marker/);
  assert.match(render(Home, store.data), /Private Draft Marker/);
  assert.match(render(ProjectDetail, store.data, `/portfolio/${project.slug}`), /Private Draft Marker/);
});

test("renaming a division retains member/project IDs and updates public labels", () => {
  const store = localStore();
  const member = store.data.members.find(m => m.divisionId === "lab")!;
  const project = store.data.projects.find(p => p.divisionId === "lab")!;
  accepted(store.actions.updateDivision("lab", { name: "Lab Renamed Marker" }));
  assert.equal(store.data.members.find(m => m.id === member.id)!.divisionId, "lab");
  assert.equal(store.data.projects.find(p => p.id === project.id)!.divisionId, "lab");
  for (const Page of [Members, Divisions, Portfolio, Home]) assert.match(render(Page, store.data), /Lab Renamed Marker/);
  assert.match(render(ProjectDetail, store.data, `/portfolio/${project.slug}`), /Lab Renamed Marker/);
});

test("division deletion rejects member-only and project-only references; allows unused divisions", () => {
  const store = localStore();
  rejectedWithoutWrite(store, () => store.actions.removeDivision("connect")); // members only
  for (const member of store.data.members.filter(m => m.divisionId === "lab")) accepted(store.actions.updateMember(member.id, { divisionId: null }));
  rejectedWithoutWrite(store, () => store.actions.removeDivision("lab")); // projects only
  const { id, ...template } = store.data.divisions[0];
  accepted(store.actions.addDivision({ ...template, name: "Unused Division" }));
  const added = store.data.divisions.find(d => d.name === "Unused Division")!;
  accepted(store.actions.removeDivision(added.id));
  assert.ok(!store.data.divisions.some(d => d.id === added.id));
  assert.equal(validateStoreData(store.data), null);
});

test("consecutive mutations validate against the latest snapshot and keep IDs stable", () => {
  const store = localStore();
  const { id, ...division } = store.data.divisions[0];
  accepted(store.actions.addDivision({ ...division, name: "New Relation" }));
  const newId = store.data.divisions[0].id;
  accepted(store.actions.updateMember(store.data.members[0].id, { divisionId: newId }));
  rejectedWithoutWrite(store, () => store.actions.removeDivision(newId));
  assert.equal(store.data.divisions.find(d => d.id === newId)!.memberCount, 1);
  // Even an untyped patch cannot rewrite the stable ID.
  const patch = { id: "replacement-id", name: "Still Same ID" };
  accepted(store.actions.updateDivision(newId, patch));
  assert.equal(store.data.divisions.find(d => d.name === "Still Same ID")!.id, newId);
});

test("slug uniqueness and foreign references are enforced on create and edit", () => {
  const store = localStore();
  const { id, ...project } = store.data.projects[0];
  rejectedWithoutWrite(store, () => store.actions.addProject(project));
  rejectedWithoutWrite(store, () => store.actions.addProject({ ...project, slug: "" }));
  rejectedWithoutWrite(store, () => store.actions.updateProject(id, { slug: "Not A Slug" }));
  rejectedWithoutWrite(store, () => store.actions.updateProject(id, { slug: store.data.projects[1].slug }));
  rejectedWithoutWrite(store, () => store.actions.addProject({ ...project, slug: "valid-slug", divisionId: "missing" }));
  rejectedWithoutWrite(store, () => store.actions.updateProject(id, { divisionId: "missing" }));
  const { id: memberId, ...member } = store.data.members[0];
  rejectedWithoutWrite(store, () => store.actions.addMember({ ...member, divisionId: "missing" }));
  rejectedWithoutWrite(store, () => store.actions.updateMember(memberId, { divisionId: "missing" }));
  accepted(store.actions.updateProject(id, { slug: project.slug }));
  accepted(store.actions.addMember({ ...member, divisionId: null }));
});

test("existing events round-trip form values; edits/adds render Indonesian date/time", () => {
  const store = localStore();
  const event = store.data.events[0];
  accepted(store.actions.updateEvent(event.id, { ...event }));
  accepted(store.actions.updateEvent(event.id, { date: "2026-09-18", startTime: "10:30", endTime: "13:15", title: "Edited Event Marker" }));
  const html = render(Events, store.data);
  assert.match(html, /18 September 2026/);
  assert.match(html, /10:30 - 13:15 WIB/);
  assert.match(render(AdminEvents, store.data), /Edited Event Marker/);
  const { id, ...template } = event;
  accepted(store.actions.addEvent({ ...template, date: "2099-01-02", title: "New Event Marker" }));
  assert.match(render(Events, store.data), /New Event Marker/);
});

test("invalid calendar dates, times and reversed intervals are rejected atomically", () => {
  const store = localStore();
  const event = store.data.events[0];
  for (const date of ["12 Oktober 2024", "2026-02-29", "2026-04-31", "2026-13-01", "0000-01-01"]) {
    rejectedWithoutWrite(store, () => store.actions.updateEvent(event.id, { date }));
  }
  for (const time of ["24:00", "09:60", "9:00", "09:00 WIB", ""]) {
    rejectedWithoutWrite(store, () => store.actions.updateEvent(event.id, { startTime: time }));
  }
  rejectedWithoutWrite(store, () => store.actions.updateEvent(event.id, { endTime: "08:00" }));
  rejectedWithoutWrite(store, () => store.actions.updateEvent(event.id, { endTime: event.startTime }));
  accepted(store.actions.updateEvent(event.id, { date: "2028-02-29" }));
});

test("completion uses WIB end time, independently of registration and local machine timezone", () => {
  const event = { ...initialStoreData.events[0], date: "2026-09-18", startTime: "09:00", endTime: "12:00", registrationOpen: false };
  assert.equal(isEventCompleted(event, new Date("2026-09-18T04:59:59Z")), false);
  assert.equal(isEventCompleted(event, new Date("2026-09-18T05:00:00Z")), true);
  assert.equal(isEventCompleted({ ...event, registrationOpen: true }, new Date("2026-09-18T05:00:00Z")), true);
  assert.equal(todayInJakarta(new Date("2026-09-17T18:00:00Z")), "2026-09-18");
  assert.equal(formatEventDate(event.date), "18 September 2026");
  assert.equal(formatEventTime(event), "09:00 - 12:00 WIB");
  const state = structuredClone(initialStoreData);
  state.events = [{ ...event, date: "2099-09-18" }];
  assert.doesNotMatch(render(Events, state), /SUDAH SELESAI/);
  assert.match(render(Events, state), /Ditutup/);
  state.events = [{ ...event, date: "2020-09-18", registrationOpen: true }];
  assert.match(render(Events, state), /SUDAH SELESAI/);
  assert.doesNotMatch(render(Events, state), />Daftar[\s<]/);
});

test("gallery, members, divisions and FAQ read current store resources", () => {
  const store = localStore();
  accepted(store.actions.updateAlbum(store.data.albums[0].id, { title: "Album Marker", photos: [] }));
  assert.equal(store.data.albums[0].photoCount, 0);
  assert.match(render(Gallery, store.data), /Album Marker/);
  accepted(store.actions.updateMember(store.data.members[0].id, { name: "Member Marker" }));
  assert.match(render(Members, store.data), /Member Marker/);
  accepted(store.actions.updateFAQ(store.data.faqs[0].id, { question: "FAQ Marker" }));
  assert.match(render(FAQ, store.data), /FAQ Marker/);
  accepted(store.actions.updateDivision("academy", { name: "Division Marker" }));
  assert.match(render(Divisions, store.data), /Division Marker/);
});

test("Contact identifies its local demo before submission", () => {
  assert.match(render(Contact, initialStoreData), /belum mengirim atau menyimpan pesan/);
  assert.doesNotMatch(render(Contact, initialStoreData), /kita bales secepetnya/);
});
