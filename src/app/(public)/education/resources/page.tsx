import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft, FolderOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearningResourcesSection } from "@/components/learning/LearningResourcesSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Resources",
  description:
    "Download and share professional files on Hunared — templates, guides, checklists, HSE procedures, certificates, and training materials.",
};

export default async function EducationResourcesPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen">
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/education"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Learning Hub
            </Link>
            <span aria-hidden>/</span>
            <span className="text-foreground font-medium">Resources</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FolderOpen className="h-7 w-7 text-primary shrink-0" />
                Resources
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
                Browse and download professional templates, guides, and training files.
              </p>
            </div>
            {userId ? (
              <Button asChild size="sm" className="shrink-0">
                <Link href="/dashboard/resources/new">
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload resource
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href="/sign-in">
                  <Upload className="h-4 w-4 mr-1.5" />
                  Sign in to upload
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <LearningResourcesSection signedIn={!!userId} showHeader={false} />
      </div>
    </div>
  );
}
