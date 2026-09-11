import { createBrowserRouter } from "react-router";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home";
import About from "../pages/About";
import Divisions from "../pages/Divisions";
import Portfolio from "../pages/Portfolio";
import ProjectDetail from "../pages/ProjectDetail";
import Members from "../pages/Members";
import Gallery from "../pages/Gallery";
import Events from "../pages/Events";
import FAQ from "../pages/FAQ";
import Contact from "../pages/Contact";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminDivisions from "../pages/admin/AdminDivisions";
import AdminPortfolio from "../pages/admin/AdminPortfolio";
import AdminGallery from "../pages/admin/AdminGallery";
import AdminEvents from "../pages/admin/AdminEvents";
import AdminMembers from "../pages/admin/AdminMembers";

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
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "divisions", Component: AdminDivisions },
      { path: "portfolio", Component: AdminPortfolio },
      { path: "gallery", Component: AdminGallery },
      { path: "events", Component: AdminEvents },
      { path: "members", Component: AdminMembers },
    ],
  },
]);
