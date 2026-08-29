"use client";

/**
 * Hunared Sign-In
 * Single clear states: loading → already signed in → sign-in form
 * Never show login form while a valid session exists.
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
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && userId) {
      setPhase("signed_in");
      setMsg("You're already signed in.");
      return;
    }

    setPhase("form");
  }, [isLoaded, isSignedIn, userId]);

  async function goDashboard() {
    setMsg("Opening dashboard…");
    window.location.replace("/dashboard");
  }

  async function forceRefreshSession() {
    setMsg("Checking session…");
    try {
      await clerk.session?.reload();
      const token = await getToken({ skipCache: true });
      if (token) {
        setMsg("Session found. Opening dashboard…");
        window.location.replace("/dashboard");
        return;
      }
      setMsg("No active session. Please sign in below.");
      setPhase("form");
    } catch {
      setMsg("Could not refresh session. Please sign in.");
      setPhase("form");
    }
  }

  if (!isLoaded || phase === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <HunaredLogo size="lg" href="/" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking your session…
        </div>
      </div>
    );
  }

  if (phase === "signed_in") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background px-4">
        <HunaredLogo size="lg" href="/" />
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card/80 p-6 text-center space-y-4">
          <h1 className="text-xl font-bold gradient-text">
            You&apos;re signed in
          </h1>
          <p className="text-sm text-muted-foreground">
            Continue to your dashboard, or sign out from the menu if you need a
            different account.
          </p>
          <Button className="w-full h-11 rounded-xl" onClick={goDashboard}>
            Go to Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={forceRefreshSession}
          >
            Refresh session
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-[var(--brand-from)] opacity-[0.12] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-[var(--brand-via)] opacity-[0.08] blur-3xl" />
      </div>

      <div className="w-full max-w-[420px] space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <HunaredLogo size="lg" href="/" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight gradient-text">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to continue to Hunared
            </p>
          </div>
        </div>

        {msg && (
          <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-center text-muted-foreground">
            {msg}
          </div>
        )}

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
                card: "w-full shadow-none border border-border rounded-2xl bg-card/80 backdrop-blur-sm",
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

        <div className="flex flex-col items-center gap-2">
          <Button variant="ghost" size="sm" onClick={forceRefreshSession}>
            Already signed in? Refresh session
          </Button>
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
    </div>
  );
}
