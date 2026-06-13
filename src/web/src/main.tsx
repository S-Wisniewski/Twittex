import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { Toaster } from "./components/ui/sonner.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { router } from "./router/routes.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
