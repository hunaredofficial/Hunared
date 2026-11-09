import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import type { Metadata } from "next";
import { ResourceUploadClient } from "./ResourceUploadClient";

export const metadata: Metadata = {
  title: "Upload Resource",
  description: "Share a learning resource on Hunared — PDF, Word, Excel, and more.",
};

export default async function UploadResourcePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/education/resources/upload");
  }

  return (
    <div className="min-h-screen">
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/education/resources"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Resources
            </Link>
            <span aria-hidden>/</span>
            <span className="text-foreground font-medium">Upload</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Upload className="h-7 w-7 text-primary shrink-0" />
            Publish a resource
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Upload a PDF, Word, PowerPoint, Excel, or image (up to 15MB). It appears in the
            library after publish.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ResourceUploadClient />
      </div>
    </div>
  );
}
