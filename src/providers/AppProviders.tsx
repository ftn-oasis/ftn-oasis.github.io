import { ThemeProvider } from "@src/contexts/ThemeContext";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router";

type AppProvidersProps = {
  children: ReactNode;
};

function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <ThemeProvider>{children}</ThemeProvider>
    </BrowserRouter>
  );
}

export { AppProviders };
