import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ResourceUploadFormDashboard } from "@/components/dashboard/ResourceUploadFormDashboard";

export const metadata: Metadata = {
  title: "Upload Resource",
  description: "Share a learning resource on Hunared.",
};

export default async function DashboardNewResourcePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard/resources/new");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Publish a Resource</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share guides, templates, checklists, and training files with the community.
        </p>
      </div>
      <ResourceUploadFormDashboard />
    </div>
  );
}
