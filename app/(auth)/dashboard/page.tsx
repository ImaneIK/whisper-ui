"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Star, Building2 } from "lucide-react";

import { SiteShell } from "../../components/layout/SiteShell";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../lib/auth";
import { api } from "../../lib/mock/api";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.stats(),
  });

  const { data: latest = [] } = useQuery({
    queryKey: ["latest-reviews"],
    queryFn: () => api.latestReviews(5),
  });

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Hi, {user?.name} 👋
            </h1>

            <p className="mt-1 text-muted-foreground">
              Your private dashboard. Reviews you write stay anonymous.
            </p>
          </div>

          <Button asChild>
            <Link href="/companies">
              Find a company to review
            </Link>
          </Button>
        </div>

        {/* STATS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<Building2 size={16} />}
            label="Companies"
            value={stats?.companies ?? 0}
          />

          <Stat
            icon={<MessageSquare size={16} />}
            label="Total reviews"
            value={stats?.reviews ?? 0}
          />

          <Stat
            icon={<Star size={16} />}
            label="Avg rating"
            value={(stats?.avgRating ?? 0).toFixed(1)}
          />
        </div>

        {/* LATEST REVIEWS */}
        <Card className="mt-10 p-6">
          <h2 className="font-display text-lg font-semibold">
            Latest community reviews
          </h2>

          <ul className="mt-4 divide-y">
            {latest.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="truncate">
                  {r.title}
                </span>

                <span className="text-muted-foreground">
                  {r.rating.toFixed(1)} ★
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </SiteShell>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>

      <div className="mt-2 font-display text-3xl font-semibold">
        {value}
      </div>
    </Card>
  );
}