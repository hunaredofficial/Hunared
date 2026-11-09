import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  Upload,
} from "lucide-react";
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
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-card to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
                <FolderOpen className="h-3.5 w-3.5" />
                Resource library
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Learning Resources
              </h1>
              <p className="mt-3 text-muted-foreground text-base sm:text-lg leading-relaxed">
                Browse downloadable templates, guides, checklists, procedures, and
                training files shared by the community. Sign in to upload and share
                your own resources.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <Button asChild variant="outline" size="sm">
                <Link href="/education">
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  Articles
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href="https://hunared.org/programs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GraduationCap className="h-4 w-4 mr-1.5" />
                  Programs
                </a>
              </Button>
              {userId ? (
                <Button asChild size="sm">
                  <a href="#upload">
                    <Upload className="h-4 w-4 mr-1.5" />
                    Upload resource
                  </a>
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link href="/sign-in">
                    <Upload className="h-4 w-4 mr-1.5" />
                    Sign in to upload
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Quick value strip */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card/80 px-4 py-3 flex items-start gap-3">
              <Download className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Free downloads</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PDFs, Word, Excel, and more for daily work.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/80 px-4 py-3 flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Practical categories</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  HSE, engineering, career, templates, and training.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/80 px-4 py-3 flex items-start gap-3">
              <ClipboardList className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Share with the network</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload useful files to help other professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Library + upload */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <LearningResourcesSection signedIn={!!userId} />
      </div>
    </div>
  );
}
