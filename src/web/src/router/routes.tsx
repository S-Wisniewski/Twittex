import { createBrowserRouter, type RouteObject } from "react-router";
import GeneralLayout from "@/layouts/GeneralLayout";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import PostPage from "@/pages/PostPage";
import Auth from "@/pages/Auth";
import ConfirmEmail from "@/pages/ConfirmEmail";
import Onboarding from "@/pages/Onboarding";

const authRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/confirm-email",
    element: <ConfirmEmail />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
];

const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/:userName",
    element: <Profile />,
  },
  {
    path: "/:userName/post/:postId",
    element: <PostPage />,
  },
  {
    path: "*",
    element: <div className="p-8 text-muted-foreground">Page not found</div>,
  },
];

appRoutes.forEach(
  (route) => (route.element = <GeneralLayout>{route.element}</GeneralLayout>),
);

const router = createBrowserRouter([...authRoutes, ...appRoutes]);

export { router };
