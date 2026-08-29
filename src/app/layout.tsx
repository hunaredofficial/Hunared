import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { GeoProvider } from "@/components/providers/GeoProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://hunared.com"),
  title: {
    default: "Hunared — Global Jobs, Property, Marketplace & Learning",
    template: "%s | Hunared",
  },
  description:
    "Hunared connects you with jobs, employers, property, marketplace deals, and learning opportunities worldwide. Your complete global workforce and lifestyle platform.",
  keywords: [
    "jobs",
    "global jobs",
    "jobs abroad",
    "temp work",
    "property for rent",
    "marketplace",
    "courses",
    "certifications",
    "scholarships",
    "Hunared",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/assets/logos/hunared-mark-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logos/hunared-mark-64.png", sizes: "64x64", type: "image/png" },
      { url: "/assets/logos/hunared-mark.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/assets/logos/hunared-mark-32.png",
    apple: [{ url: "/assets/logos/hunared-mark-192.png", sizes: "192x192", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Hunared — Global Jobs, Property, Marketplace & Learning",
    description:
      "Find jobs, property, marketplace deals, and learning opportunities worldwide on Hunared.",
    url: "https://hunared.com",
    siteName: "Hunared",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hunared — Global Jobs, Property, Marketplace & Learning",
    description:
      "Find jobs, property, marketplace deals, and learning opportunities worldwide on Hunared.",
    site: "@hunared",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased font-[var(--font-poppins)]">
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/register"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/register?mode=complete"
          afterSignOutUrl="/"
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <GeoProvider>
              <TooltipProvider>
                <NextTopLoader
                  color="#3b82f6"
                  height={3}
                  showSpinner={false}
                  easing="ease"
                  speed={200}
                />
                {children}
                <Toaster richColors position="top-right" />
              </TooltipProvider>
            </GeoProvider>
          </ThemeProvider>
        </ClerkProvider>

        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}