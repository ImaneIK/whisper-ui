import Link from "next/link";
import { Wordmark } from "../brand/GhostLogo";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Wordmark />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Workplace truth, spoken softly. Anonymous reviews from former
              employees, moderated for safety and clarity.
            </p>
          </div>
          <div>
            <h5 className="text-sm font-semibold">Product</h5>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/companies" className="hover:text-foreground">Browse companies</Link></li>
              <li><Link href="/companies/new" className="hover:text-foreground">Add a company</Link></li>
              <li><Link href="/about" className="hover:text-foreground">How anonymity works</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold">Company</h5>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Privacy</li>
              <li>Community guidelines</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Whisper. All rights reserved.</span>
          <span>Built with care for honest workplaces.</span>
        </div>
      </div>
    </footer>
  );
}
