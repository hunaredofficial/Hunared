"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid theme script warning during first client render
  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}