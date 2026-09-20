import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import AdminRouteGuard from "../auth/AdminRouteGuard";
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Divisions from "../pages/public/Divisions";
import Portfolio from "../pages/public/Portfolio";
import ProjectDetail from "../pages/public/ProjectDetail";
import Members from "../pages/public/Members";
import Gallery from "../pages/public/Gallery";
import Events from "../pages/public/Events";
import FAQ from "../pages/public/FAQ";
import Contact from "../pages/public/Contact";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminDivisions from "../pages/admin/AdminDivisions";
import AdminPortfolio from "../pages/admin/AdminPortfolio";
import AdminGallery from "../pages/admin/AdminGallery";
import AdminEvents from "../pages/admin/AdminEvents";
import AdminMembers from "../pages/admin/AdminMembers";
import AdminMemberEditor from "../pages/admin/AdminMemberEditor";
import AdminFAQ from "../pages/admin/AdminFAQ";
import AdminResourceEditor from "../pages/admin/AdminResourceEditor";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "divisions", Component: Divisions },
      { path: "portfolio", Component: Portfolio },
      { path: "portfolio/:slug", Component: ProjectDetail },
      { path: "members", Component: Members },
      { path: "gallery", Component: Gallery },
      { path: "events", Component: Events },
      { path: "faq", Component: FAQ },
      { path: "contact", Component: Contact },
    ],
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminRouteGuard,
    children: [{
      Component: AdminLayout,
      children: [
        { index: true, Component: AdminDashboard },
        { path: "divisions", Component: AdminDivisions },
        { path: "divisions/new", Component: () => createElement(AdminResourceEditor, { kind: "divisions" }) },
        { path: "divisions/:id/edit", Component: () => createElement(AdminResourceEditor, { kind: "divisions" }) },
        { path: "portfolio", Component: AdminPortfolio },
        { path: "portfolio/new", Component: () => createElement(AdminResourceEditor, { kind: "portfolio" }) },
        { path: "portfolio/:id/edit", Component: () => createElement(AdminResourceEditor, { kind: "portfolio" }) },
        { path: "gallery", Component: AdminGallery },
        { path: "gallery/new", Component: () => createElement(AdminResourceEditor, { kind: "gallery" }) },
        { path: "gallery/:id/edit", Component: () => createElement(AdminResourceEditor, { kind: "gallery" }) },
        { path: "events", Component: AdminEvents },
        { path: "events/new", Component: () => createElement(AdminResourceEditor, { kind: "events" }) },
        { path: "events/:id/edit", Component: () => createElement(AdminResourceEditor, { kind: "events" }) },
        { path: "members", Component: AdminMembers },
        { path: "members/new", Component: AdminMemberEditor },
        { path: "members/:id/edit", Component: AdminMemberEditor },
        { path: "faq", Component: AdminFAQ },
        { path: "faq/new", Component: () => createElement(AdminResourceEditor, { kind: "faq" }) },
        { path: "faq/:id/edit", Component: () => createElement(AdminResourceEditor, { kind: "faq" }) },
      ],
    }],
  },
]);
