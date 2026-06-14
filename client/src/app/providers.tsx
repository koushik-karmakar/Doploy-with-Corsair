"use client";

import { Provider as JotaiProvider } from "jotai";
import { AuthProvider } from "@/app/context/AuthContext";
import { ChartThemeProvider } from "@/components/providers/chart-theme-provider";
import { ModeThemeProvider } from "@/components/providers/mode-theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <AuthProvider>
        <ModeThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ChartThemeProvider>{children}</ChartThemeProvider>
        </ModeThemeProvider>
      </AuthProvider>
    </JotaiProvider>
  );
}
