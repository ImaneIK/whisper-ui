"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Trash2, Check, MessageSquare, Building2, Star } from "lucide-react";
import { toast } from "sonner";

import Link from "next/link";

import { SiteShell } from "../../components/layout/SiteShell";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { useAuth } from "../../lib/auth";
import { api } from "../../lib/mock/api";

export default function AdminPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.stats(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api.listReports(),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => api.listCompanies(),
  });

  if (!user?.isAdmin) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <Shield className="mx-auto text-muted-foreground" />
          <h1 className="mt-3 font-display text-2xl font-semibold">
            Admins only
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in with an email starting with{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5">
              admin
            </code>
          </p>
        </div>
      </SiteShell>
    );
  }

  const pending = reports.filter((r) => r.status === "pending");

  const removeReview = async (id: string) => {
    await api.deleteReview(id);
    qc.invalidateQueries({ queryKey: ["reports"] });
    qc.invalidateQueries({ queryKey: ["companies"] });
    toast.success("Review removed");
  };

  const dismiss = async (id: string) => {
    await api.dismissReport(id);
    qc.invalidateQueries({ queryKey: ["reports"] });
    toast.success("Report dismissed");
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield size={18} />
          </span>

          <div>
            <h1 className="font-display text-3xl font-semibold">
              Moderation
            </h1>
            <p className="text-muted-foreground">
              Keep Whisper safe and trustworthy.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <Stat icon={<Building2 size={14} />} label="Companies" value={stats?.companies ?? 0} />
          <Stat icon={<MessageSquare size={14} />} label="Reviews" value={stats?.reviews ?? 0} />
          <Stat icon={<Shield size={14} />} label="Pending reports" value={pending.length} highlight={pending.length > 0} />
          <Stat icon={<Star size={14} />} label="Avg rating" value={(stats?.avgRating ?? 0).toFixed(1)} />
        </div>

        {/* REPORTS */}
        <Card className="mt-8 overflow-hidden p-0">
          <div className="border-b p-5">
            <h2 className="font-display text-lg font-semibold">
              Reported reviews
            </h2>
            <p className="text-sm text-muted-foreground">
              Resolve queue · {pending.length} pending
            </p>
          </div>

          {pending.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              All clear. No reports awaiting review.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Review</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pending.map((r) => {
                      if (!r.review) return null;

                      return (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-medium">
                        {r.review?.title ?? "—"}
                      </div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {r.review?.cons}
                      </div>
                    </TableCell>

                    <TableCell>
                      {r.company?.name ?? "—"}
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">
                        {r.reason}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => dismiss(r.id)}>
                          <Check size={14} className="mr-1" />
                          Dismiss
                        </Button>

                        {r.review && (
                          <Button size="sm" variant="destructive" onClick={() => removeReview(r.review!.id)}>
                            <Trash2 size={14} className="mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
                })}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* COMPANIES */}
        <Card className="mt-8 overflow-hidden p-0">
          <div className="border-b p-5">
            <h2 className="font-display text-lg font-semibold">
              Companies
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage the company directory
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Avg</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {companies.map((c) => {
                if (!c.reviewCount) return null;

                return ( 
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.name}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">
                      {c.industry}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {c.city}
                  </TableCell>

                  <TableCell>
                    {c.reviewCount}
                  </TableCell>

                  <TableCell>
                    {c.avgRating?.toFixed(1)} ★
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </Card>
      </div>
    </SiteShell>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={`p-5 ${highlight ? "border-primary/40 bg-primary-soft/40" : ""}`}>
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