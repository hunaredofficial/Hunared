import { permanentRedirect } from "next/navigation";

/**
 * Internal Hunared Program page removed permanently.
 * Always send users to the official programs site.
 */
export default function ProgramPage() {
  permanentRedirect("https://hunared.org/programs");
}
