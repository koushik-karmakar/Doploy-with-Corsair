"use client";

import { Provider as JotaiProvider } from "jotai";
import { AuthProvider } from "@/app/context/AuthContext";
import { AuthRouteProvider } from "@/app/context/AuthRouteProvider";
import { ChartThemeProvider } from "@/components/providers/chart-theme-provider";
import { ModeThemeProvider } from "@/components/providers/mode-theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <AuthProvider>
        <AuthRouteProvider>
          <ModeThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ChartThemeProvider>{children}</ChartThemeProvider>
          </ModeThemeProvider>
        </AuthRouteProvider>
      </AuthProvider>
    </JotaiProvider>
  );
}
