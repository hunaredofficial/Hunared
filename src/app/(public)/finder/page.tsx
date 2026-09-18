import type { Metadata } from "next";
import { FinderExperience } from "@/components/home/FinderExperience";

export const metadata: Metadata = {
  title: "Hunared Finder — Lost & Found",
  description:
    "Lost something? Found something? Search and report lost & found items with the Hunared community.",
};

export default function FinderPage() {
  return <FinderExperience />;
}
