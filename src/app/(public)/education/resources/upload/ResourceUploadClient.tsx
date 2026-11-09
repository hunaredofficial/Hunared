"use client";

import { useRouter } from "next/navigation";
import { ResourceUploadForm } from "@/components/learning/LearningResourcesSection";

export function ResourceUploadClient() {
  const router = useRouter();

  return (
    <ResourceUploadForm
      onPublished={() => {
        router.push("/education/resources");
        router.refresh();
      }}
    />
  );
}
