import { MapPin, Building2 } from "lucide-react";
import { Card } from "./ui/card";
import Link from "next/link";

export type Company = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  city: string;
  description: string;
  createdAt: string;
};

export function CompanyCard({ c }: { c: Company }) {
  return (
    <Link href={`/companies/${c.slug}`} className="group block">
      <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft hover:border-primary/30">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground font-display font-semibold">
            {c.name.charAt(0)}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-semibold group-hover:text-primary">
              {c.name}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Building2 size={12} /> {c.industry}
              </span>

              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {c.city}
              </span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {c.description}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}