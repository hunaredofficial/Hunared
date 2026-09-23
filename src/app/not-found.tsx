import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home, Briefcase, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-6xl font-bold text-primary/20 tracking-tight" aria-hidden>
          404
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            This page doesn&apos;t exist or may have moved. Try searching or go back
            to a main section.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-1.5" />
              Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search">
              <Search className="h-4 w-4 mr-1.5" />
              Search
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm pt-2">
          <Link href="/jobs" className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" /> Jobs
          </Link>
          <Link href="/market" className="text-muted-foreground hover:text-primary inline-flex items-center gap-1">
            <ShoppingBag className="h-3.5 w-3.5" /> Marketplace
          </Link>
          <Link href="/candidates" className="text-muted-foreground hover:text-primary">
            Talent
          </Link>
          <Link href="/companies" className="text-muted-foreground hover:text-primary">
            Companies
          </Link>
          <Link href="/post" className="text-muted-foreground hover:text-primary">
            Post an Ad
          </Link>
        </div>
      </div>
    </main>
  );
}
