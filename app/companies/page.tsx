"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { z } from "zod";

import { SiteShell } from "../components/layout/SiteShell";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { CompanyCard } from "../components/CompanyCard";
import { api } from "../lib/api";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import type { Industry } from "../lib/mock/types";

const industries: (Industry | "All")[] = [
  "All",
  "Tech",
  "Finance",
  "Retail",
  "Hospitality",
  "Healthcare",
  "Public",
  "Logistics",
];

const searchSchema = z.object({
  q: z.string().optional(),
  industry: z.string().optional(),
});

export default function CompaniesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const parsed = searchSchema.parse({
    q: searchParams.get("q") ?? "",
    industry: searchParams.get("industry") ?? "All",
  });

  const [q, setQ] = useState(parsed.q ?? "");
  const [industry, setIndustry] = useState<Industry | "All">(
    industries.includes(parsed.industry as Industry)
      ? (parsed.industry as Industry)
      : "All"
  );

  const { data = [], isLoading } = useQuery({
    queryKey: ["companies", q, industry],
    queryFn: () => api.listCompanies({ q, industry }),
  });

  const updateQuery = (nextQ: string, nextIndustry: Industry | "All") => {
    const params = new URLSearchParams();

    if (nextQ) params.set("q", nextQ);
    if (nextIndustry && nextIndustry !== "All")
      params.set("industry", nextIndustry);

    router.push(`/companies?${params.toString()}`);
  };

  return (
    <SiteShell>
      {/* HEADER */}
      <section className="border-b bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">
                Companies
              </h1>

              <p className="mt-2 text-muted-foreground">
                Search across {data.length} compan
                {data.length === 1 ? "y" : "ies"} reviewed by former employees.
              </p>
            </div>

            <Button asChild>
              <Link href="/companies/new">
                <Plus size={16} className="mr-1.5" />
                Add a company
              </Link>
            </Button>
          </div>

          {/* SEARCH BAR */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                value={q}
                onChange={(e) => {
                  const value = e.target.value;
                  setQ(value);
                  updateQuery(value, industry);
                }}
                placeholder="Search by name, city, industry…"
                className="h-11 pl-9"
              />
            </div>

            <Select
              value={industry}
              onValueChange={(v) => {
                const value = v as Industry | "All";
                setIndustry(value);
                updateQuery(q, value);
              }}
            >
              <SelectTrigger className="h-11 sm:w-56">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {industries.map((i) => (
                  <SelectItem
                    key={i}
                    value={i}
                  >
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : data.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground">
              No companies match your search.
            </p>

            <Button
              className="mt-4"
              asChild
            >
              <Link href="/companies/new">
                Add the first one
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c: any) => (
              <CompanyCard
                key={c.id}
                c={c}
              />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}