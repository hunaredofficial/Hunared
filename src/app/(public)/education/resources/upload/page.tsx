import { redirect } from "next/navigation";

/** Public URL kept for bookmarks — always open dashboard upload (sidebar layout). */
export default function UploadResourceRedirectPage() {
  redirect("/dashboard/resources/new");
}
