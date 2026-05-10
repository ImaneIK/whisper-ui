"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ShieldCheck,
  Sparkles,
  MessageSquareQuote,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

import { SiteShell } from "./components/layout/SiteShell";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";
import { CompanyCard } from "./components/CompanyCard";
import { Stars } from "./components/Stars";
import { GhostLogo } from "./components/brand/GhostLogo";
import { api } from "./lib/mock/api";

import Image from "next/image";
import heroImg from "../public/hero-ghost.png";

const categories = [
  "Tech",
  "Finance",
  "Retail",
  "Hospitality",
  "Healthcare",
  "Public",
  "Logistics",
];

export default function HomePage() {
  const router = useRouter();

  const [q, setQ] = useState("");

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => api.listCompanies(),
  });

  const { data: latest = [] } = useQuery({
    queryKey: ["latest-reviews"],
    queryFn: () => api.latestReviews(4),
  });

  const trending = [...companies]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 6);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();

    router.push(`/companies?q=${encodeURIComponent(q)}`);
  };

  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <ShieldCheck
                size={12}
                className="text-primary"
              />
              Fully anonymous · Moderated · Free forever
            </span>

            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Workplace truth,
              <br />
              <span className="text-primary">
                spoken softly.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Whisper is where former employees share honest reviews about what
              it's really like inside a company — protected by design, never
              tied to your name.
            </p>

            <form
              onSubmit={onSearch}
              className="mt-7 flex max-w-md gap-2"
            >
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search a company, city or industry"
                  className="h-12 pl-9"
                />
              </div>

              <Button
                type="submit"
                size="lg"
              >
                Search
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {categories.slice(0, 5).map((c) => (
                <Link
                  key={c}
                  href={`/companies?industry=${c}`}
                  className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-primary-soft via-sand/50 to-transparent blur-2xl" />

            <Image
              src={heroImg}
              alt="Whisper ghost mascot"
              className="w-full select-none"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <Trust
            icon={<ShieldCheck size={18} />}
            title="Anonymous by design"
            desc="No names, no IPs tied to reviews. Ever."
          />

          <Trust
            icon={<MessageSquareQuote size={18} />}
            title="Moderated for safety"
            desc="A human team removes anything unsafe."
          />

          <Trust
            icon={<Sparkles size={18} />}
            title="Built for ex-employees"
            desc="So you can say what couldn't be said inside."
          />
        </div>
      </section>

      {/* TRENDING */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Trending"
          title="Companies people are talking about"
          link={{
            label: "Browse all",
            href: "/companies",
          }}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((c) => (
            <CompanyCard
              key={c.id}
              c={c}
            />
          ))}
        </div>
      </section>

      {/* LATEST REVIEWS */}
      <section className="border-y bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHead
            eyebrow="Fresh"
            title="The latest whispers"
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {latest.map((r) => {
              const c = companies.find(
                (company) => company.id === r.companyId
              );

              return (
                <Link
                  key={r.id}
                  href={`/companies/${c?.slug}`}
                  className="block"
                >
                  <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">
                        {c?.name}
                      </span>

                      <Stars
                        value={r.rating}
                        size={13}
                      />
                    </div>

                    <h4 className="mt-2 font-display text-base font-semibold">
                      {r.title}
                    </h4>

                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {r.pros}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Explore"
          title="Find your industry"
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/companies?industry=${cat}`}
              className="group flex items-center justify-between rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            >
              <span className="font-display font-medium">
                {cat}
              </span>

              <ArrowRight
                size={16}
                className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground sm:p-14">
          <div className="absolute -right-10 -top-10 opacity-20">
            <GhostLogo size={240} />
          </div>

          <div className="relative max-w-2xl">
            <h3 className="font-display text-3xl font-semibold sm:text-4xl">
              Worked somewhere worth talking about?
            </h3>

            <p className="mt-3 text-base opacity-90">
              Help the next person make a better decision. Your review takes 3
              minutes and stays fully anonymous.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                variant="secondary"
                asChild
              >
                <Link href="/companies">
                  Find your company
                </Link>
              </Button>

              <Button
                size="lg"
                variant="ghost"
                className="border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/companies/new">
                  Add a company
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Trust({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>

      <div>
        <div className="text-sm font-semibold">
          {title}
        </div>

        <div className="text-sm text-muted-foreground">
          {desc}
        </div>
      </div>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string;
  title: string;
  link?: {
    label: string;
    href: string;
  };
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </div>

        <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
          {title}
        </h2>
      </div>

      {link && (
        <Link
          href={link.href}
          className="text-sm font-medium text-primary hover:underline"
        >
          {link.label} →
        </Link>
      )}
    </div>
  );
}