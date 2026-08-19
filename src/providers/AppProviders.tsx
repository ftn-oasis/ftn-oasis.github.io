import { ThemeProvider } from "@src/contexts/ThemeContext";
import { ToastProvider } from "@src/contexts/ToastContext";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router";

type AppProvidersProps = {
  children: ReactNode;
};

function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export { AppProviders };
