"use client";

/**
 * Hunared Sign-In — clean, minimal, professional.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignIn, useAuth, useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { HunaredLogo } from "@/components/brand/HunaredLogo";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const clerk = useClerk();
  const [phase, setPhase] = useState<"loading" | "signed_in" | "form">(
    "loading"
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && userId) {
      setPhase("signed_in");
      return;
    }
    setPhase("form");
  }, [isLoaded, isSignedIn, userId]);

  function goDashboard() {
    window.location.replace("/dashboard");
  }

  async function forceRefreshSession() {
    try {
      await clerk.session?.reload();
      const token = await getToken({ skipCache: true });
      if (token) {
        window.location.replace("/dashboard");
        return;
      }
      setPhase("form");
    } catch {
      setPhase("form");
    }
  }

  if (!isLoaded || phase === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <HunaredLogo size="lg" href="/" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (phase === "signed_in") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background px-4">
        <HunaredLogo size="lg" href="/" />
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center space-y-4">
          <h1 className="text-xl font-bold text-foreground">You&apos;re signed in</h1>
          <p className="text-sm text-muted-foreground">
            Continue to your dashboard to manage jobs, messages and profile.
          </p>
          <Button className="w-full h-11 rounded-xl" onClick={goDashboard}>
            Go to Dashboard
          </Button>
          <button
            type="button"
            onClick={() => void forceRefreshSession()}
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            Having trouble? Refresh session
          </button>
        </div>
        <Link href="/" className="text-sm text-primary hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-[420px] space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <HunaredLogo size="lg" href="/" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sign in
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Access your Hunared account
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <SignIn
            routing="hash"
            signUpUrl="/register"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              variables: {
                colorPrimary: "#3b82f6",
                colorBackground: "transparent",
                colorInputBackground: "hsl(var(--background))",
                colorInputText: "hsl(var(--foreground))",
                colorText: "hsl(var(--foreground))",
                colorTextSecondary: "hsl(var(--muted-foreground))",
                borderRadius: "0.75rem",
              },
              elements: {
                rootBox: "w-full mx-auto",
                card:
                  "w-full shadow-none border border-border rounded-2xl bg-card",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border border-border bg-background hover:bg-muted text-foreground",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground h-11 rounded-xl font-medium",
                formFieldInput:
                  "h-11 rounded-xl border-border bg-background text-foreground",
                footerActionLink: "text-primary hover:underline",
              },
            }}
          />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          New to Hunared?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
