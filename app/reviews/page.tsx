"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Star,
  MapPin,
  Building2,
  Users,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  PenLine,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { SiteShell } from "../components/layout/SiteShell";
import { cn } from "../lib/utils";


// ─── Types ────────────────────────────────────────────────────────────────────

type Review = {
  id: string;
  role: string | null;
  jobType: string;
  seniority: string;
  tenure: string;
  employmentStatus: string;
  city: string;
  ratingOverall: number;
  ratingWorkLife: number;
  ratingSalary: number;
  ratingManagement: number;
  ratingGrowth: number;
  ratingAtmosphere: number;
  pros: string[];
  cons: string[];
  summary: string | null;
  publishedAt: string;
};

type Company = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  city: string | null;
  country: string;
  industry: string | null;
  size: string | null;
  averageRating: number;
  averageWorkLife: number;
  averageSalary: number;
  averageManagement: number;
  averageGrowth: number;
  averageAtmosphere: number;
  totalReviews: number;
  reviews: Review[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PROS_LABELS: Record<string, string> = {
  "competitive-salary":     "Salaire compétitif",
  "flexible-hours":         "Horaires flexibles",
  "good-team":              "Bonne ambiance d'équipe",
  "learning-opportunities": "Opportunités d'apprentissage",
  "job-stability":          "Stabilité de l'emploi",
  "good-management":        "Bonne direction",
  "modern-tools":           "Outils modernes",
  "remote-work":            "Télétravail possible",
};

const CONS_LABELS: Record<string, string> = {
  "unpaid-overtime":      "Heures sup non payées",
  "no-career-path":       "Pas d'évolution de carrière",
  "poor-management":      "Mauvaise gestion",
  "toxic-atmosphere":     "Ambiance toxique",
  "late-salaries":        "Salaires en retard",
  "no-work-life-balance": "Aucun équilibre vie pro/perso",
  "lack-of-recognition":  "Manque de reconnaissance",
  "high-turnover":        "Fort turnover",
};

const JOB_TYPE_LABEL: Record<string, string> = {
  "FULL_TIME":  "CDI / CDD",
  "INTERNSHIP":   "Stage",
  "FREELANCE":    "Freelance",
  "PART_TIME":  "Temps partiel",
};

const SENIORITY_LABEL: Record<string, string> = {
  "JUNIOR":    "Junior",
  "MID":       "Confirmé",
  "SENIOR":    "Senior",
  "EXECUTIVE": "Cadre / Direction",
};

const TENURE_LABEL: Record<string, string> = {
  "LESS_THAN_1": "Moins d'1 an",
  "1_3":         "1 – 3 ans",
  "3_5":         "3 – 5 ans",
  "MORE_THAN_5": "Plus de 5 ans",
};

const RATING_FIELDS = [
  { key: "averageWorkLife",   label: "Vie pro / perso" },
  { key: "averageSalary",     label: "Salaire" },
  { key: "averageManagement", label: "Management" },
  { key: "averageGrowth",     label: "Évolution" },
  { key: "averageAtmosphere", label: "Ambiance" },
] as const;

const SORT_OPTIONS = [
  { value: "recent",  label: "Plus récents" },
  { value: "highest", label: "Meilleure note" },
  { value: "lowest",  label: "Note la plus basse" },
] as const;

type SortKey = typeof SORT_OPTIONS[number]["value"];

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchCompany(slug: string): Promise<Company> {
  const res = await fetch(`/api/companies/${slug}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarsDisplay({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(value)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/20"
          }
        />
      ))}
    </span>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium w-6 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);

  const hasTags = review.pros.length > 0 || review.cons.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarsDisplay value={review.ratingOverall} size={14} />
            <span className="text-xs text-muted-foreground">{review.ratingOverall}/5</span>
          </div>
          <p className="text-sm font-medium">
            {review.role
              ? review.role
              : JOB_TYPE_LABEL[review.jobType] ?? review.jobType}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {SENIORITY_LABEL[review.seniority] ?? review.seniority}
            {" · "}
            {review.city}
            {" · "}
            {TENURE_LABEL[review.tenure] ?? review.tenure}
            {" · "}
            {review.employmentStatus === "current" ? "Employé(e) actuel(le)" : "Ancien(ne) employé(e)"}
          </p>
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          {formatDistanceToNow(new Date(review.publishedAt), {
            addSuffix: true,
            locale: fr,
          })}
        </span>
      </div>

      {/* Summary */}
      {review.summary && (
        <p className="text-sm text-foreground italic border-l-2 border-border pl-3">
          "{review.summary}"
        </p>
      )}

      {/* Tags — collapsed on mobile, expandable */}
      {hasTags && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Masquer les détails" : "Voir les points forts & faibles"}
          </button>

          {expanded && (
            <div className="space-y-2.5">
              {review.pros.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1.5">Points forts</p>
                  <div className="flex flex-wrap gap-1.5">
                    {review.pros.map((p) => (
                      <span
                        key={p}
                        className="text-xs bg-green-50 text-green-800 border border-green-200 px-2.5 py-1 rounded-full"
                      >
                        {PROS_LABELS[p] ?? p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {review.cons.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-700 mb-1.5">Points faibles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {review.cons.map((c) => (
                      <span
                        key={c}
                        className="text-xs bg-red-50 text-red-800 border border-red-200 px-2.5 py-1 rounded-full"
                      >
                        {CONS_LABELS[c] ?? c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sub-ratings — always visible as a subtle row */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 pt-1 border-t border-border">
        {[
          { label: "Vie pro/perso", value: review.ratingWorkLife },
          { label: "Salaire",       value: review.ratingSalary },
          { label: "Management",    value: review.ratingManagement },
          { label: "Évolution",     value: review.ratingGrowth },
          { label: "Ambiance",      value: review.ratingAtmosphere },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium">{value}/5</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ slug }: { slug: string }) {
  return (
    <div className="text-center py-20 border border-dashed border-border rounded-2xl">
      <p className="text-sm font-medium mb-1">Aucun avis pour le moment</p>
      <p className="text-xs text-muted-foreground mb-4">
        Soyez le premier à partager votre expérience.
      </p>
      <Button asChild size="sm">
        <Link href={`/companies/${slug}/review`}>
          <PenLine size={13} className="mr-1.5" />
          Laisser un avis
        </Link>
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompanyReviewsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState<SortKey>("recent");

  const { data: company, isLoading, isError } = useQuery({
    queryKey: ["company", slug],
    queryFn: () => fetchCompany(slug),
  });

  const sortedReviews = company
    ? [...company.reviews].sort((a, b) => {
        if (sort === "highest") return b.ratingOverall - a.ratingOverall;
        if (sort === "lowest")  return a.ratingOverall - b.ratingOverall;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      })
    : [];

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SiteShell>
        <div className="flex items-center justify-center py-32 gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Chargement…</span>
        </div>
      </SiteShell>
    );
  }

  if (isError || !company) {
    return (
      <SiteShell>
        <div className="flex items-center justify-center py-32 gap-2 text-destructive">
          <AlertCircle size={16} />
          <span className="text-sm">Entreprise introuvable.</span>
        </div>
      </SiteShell>
    );
  }

  // ── Page ─────────────────────────────────────────────────────────────────

  return (
    <SiteShell>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6">

        {/* ── Company header ────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 mb-8">
          {/* Logo or placeholder */}
          <div className="w-14 h-14 rounded-xl border border-border bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
            {company.logo
              ? <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-1" />
              : <Building2 size={24} className="text-muted-foreground" />
            }
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold leading-tight">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
              {company.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {company.city}
                </span>
              )}
              {company.industry && (
                <span className="flex items-center gap-1">
                  <Building2 size={11} /> {company.industry}
                </span>
              )}
              {company.size && (
                <span className="flex items-center gap-1">
                  <Users size={11} /> {company.size} employés
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <ExternalLink size={11} /> Site web
                </a>
              )}
            </div>
          </div>

          {/* CTA */}
          <Button asChild size="sm" className="flex-shrink-0 hidden sm:flex">
            <Link href={`/companies/${slug}/review`}>
              <PenLine size={13} className="mr-1.5" />
              Laisser un avis
            </Link>
          </Button>
        </div>

        {/* ── Ratings overview ──────────────────────────────────────────── */}
        {company.totalReviews > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 mb-8">
            <div className="flex items-center gap-6 mb-6">
              {/* Big score */}
              <div className="text-center flex-shrink-0">
                <p className="text-5xl font-bold leading-none">
                  {company.averageRating.toFixed(1)}
                </p>
                <StarsDisplay value={company.averageRating} size={16} />
                <p className="text-xs text-muted-foreground mt-1">
                  {company.totalReviews} avis
                </p>
              </div>

              {/* Rating bars */}
              <div className="flex-1 space-y-2.5">
                {RATING_FIELDS.map(({ key, label }) => (
                  <RatingBar
                    key={key}
                    label={label}
                    value={company[key]}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Reviews list ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">
            {company.totalReviews > 0
              ? `${company.totalReviews} avis`
              : "Avis"}
          </h2>

          {company.totalReviews > 1 && (
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border transition-all",
                    sort === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {sortedReviews.length === 0
          ? <EmptyState slug={slug} />
          : (
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )
        }

        {/* Mobile CTA */}
        {company.totalReviews > 0 && (
          <div className="mt-8 sm:hidden">
            <Button asChild className="w-full">
              <Link href={`/companies/${slug}/review`}>
                <PenLine size={13} className="mr-1.5" />
                Laisser un avis
              </Link>
            </Button>
          </div>
        )}

        {/* Anonymity note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Tous les avis sont anonymes et vérifiés avant publication.
        </p>
      </div>
    </SiteShell>
  );
}