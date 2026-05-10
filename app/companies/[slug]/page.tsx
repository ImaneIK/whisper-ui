"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  MessageSquarePlus,
  Calendar,
} from "lucide-react";

import { SiteShell } from "../../components/layout/SiteShell";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { ReviewCard } from "../../components/ReviewCard";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

import { api } from "../../lib/api";

export default function CompanyPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [sort, setSort] = useState<"newest" | "highest" | "lowest">("newest");

  const { data: company } = useQuery({
    queryKey: ["company", slug],
    queryFn: () => api.getCompanyBySlug(slug),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", company?.id, sort],
    queryFn: () => api.listReviews(company!.id, sort),
    enabled: !!company,
  });

  if (!company) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl">Company not found</h1>

          <Button className="mt-4" asChild>
            <Link href="/companies">Browse companies</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      {/* HEADER */}
      <section className="border-b bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-3xl font-semibold shadow-soft">
              {company.name.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl font-semibold sm:text-4xl">
                {company.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={14} />
                  {company.industry}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} />
                  {company.city}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} />
                  Joined{" "}
                  {new Date(company.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="mt-3 max-w-2xl text-foreground/80">
                {company.description}
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => router.push(`/reviews/new/${slug}`)}
            >
              <MessageSquarePlus size={16} className="mr-1.5" />
              Write a review
            </Button>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* SIDEBAR (minimal, no fake stats) */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <Card className="p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Reviews
            </div>

            <div className="mt-2">
              <span className="font-display text-5xl font-semibold">
                {reviews.length}
              </span>
            </div>

            <div className="text-sm text-muted-foreground mt-2">
              Anonymous employee reviews
            </div>
          </Card>
        </aside>

        {/* REVIEWS */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">
              Reviews
            </h2>

            <Tabs value={sort} onValueChange={(v) => setSort(v as any)}>
              <TabsList>
                <TabsTrigger value="newest">Newest</TabsTrigger>
                <TabsTrigger value="highest">Highest</TabsTrigger>
                <TabsTrigger value="lowest">Lowest</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <Card className="p-10 text-center">
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to share.
                </p>

                <Button
                  className="mt-4"
                  onClick={() => router.push(`/reviews/new/${slug}`)}
                >
                  Write a review
                </Button>
              </Card>
            ) : (
              reviews.map((r: any) => (
                <ReviewCard key={r.id} review={r} />
              ))
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}