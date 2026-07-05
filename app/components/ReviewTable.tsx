"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Filter,
  Star,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ReviewDrawer } from "./ReviewDrawer";
import { useSearchParams } from "next/navigation";
import { Router, useRouter } from "next/router";



// ─── Types ────────────────────────────────────────────────────────────────────

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdminReview = {
  id: string;
  status: ReviewStatus;
  anonId: string;
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
  rejectionReason: string | null;
  moderatorNote: string | null;
  createdAt: string;
  publishedAt: string | null;
  company: {
    name: string;
    slug: string;
    city: string | null;
  };
};

type ReviewsResponse = {
  count: number;
  total: number;
  page: number;
  totalPages: number;
  reviews: AdminReview[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "";

const STATUS_OPTIONS = [
  { value: "ALL",      label: "Tous les statuts" },
  { value: "PENDING",  label: "En attente" },
  { value: "APPROVED", label: "Approuvés" },
  { value: "REJECTED", label: "Rejetés" },
];

const STATUS_BADGE: Record<ReviewStatus, { label: string; class: string }> = {
  PENDING:  { label: "En attente", class: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  APPROVED: { label: "Approuvé",   class: "bg-green-100  text-green-800  border-green-200"  },
  REJECTED: { label: "Rejeté",     class: "bg-red-100    text-red-800    border-red-200"    },
};

const JOB_TYPE_LABEL: Record<string, string> = {
  "FULL_TIME":  "CDI / CDD",
  "INTERNSHIP": "Stage",
  "FREELANCE":  "Freelance",
  "PART_TIME":  "Temps partiel",
};

const SENIORITY_LABEL: Record<string, string> = {
  "JUNIOR":    "Junior",
  "MID":       "Confirmé",
  "SENIOR":    "Senior",
  "EXECUTIVE": "Cadre / Direction",
};

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchReviews(
  page: number,
  status: string,
): Promise<ReviewsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: "20",
  });
  if (status !== "ALL") params.set("status", status);

  const res = await fetch(`/api/admin/reviews?${params}`, {
    headers: { "x-admin-secret": ADMIN_SECRET },
  });
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
}

// ─── Star display ─────────────────────────────────────────────────────────────

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}
        />
      ))}
    </span>
  );
}

// ─── Review row ───────────────────────────────────────────────────────────────

function ReviewRow({
  review,
  onClick,
}: {
  review: AdminReview;
  onClick: () => void;
}) {
  const badge = STATUS_BADGE[review.status];

  return (
    <tr
      onClick={onClick}
      className="border-b border-border hover:bg-muted/40 cursor-pointer transition-colors"
    >
      {/* Company */}
      <td className="py-3 px-4">
        <p className="text-sm font-medium leading-tight">{review.company.name}</p>
        <p className="text-xs text-muted-foreground">{review.company.city ?? "—"}</p>
      </td>

      {/* Role / position */}
      <td className="py-3 px-4">
        <p className="text-sm">{review.role ?? <span className="text-muted-foreground">—</span>}</p>
        <p className="text-xs text-muted-foreground">
          {JOB_TYPE_LABEL[review.jobType] ?? review.jobType} · {SENIORITY_LABEL[review.seniority] ?? review.seniority}
        </p>
      </td>

      {/* Rating */}
      <td className="py-3 px-4">
        <Stars value={review.ratingOverall} />
        <p className="text-xs text-muted-foreground mt-0.5">{review.ratingOverall}/5</p>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full border", badge.class)}>
          {badge.label}
        </span>
      </td>

      {/* Date */}
      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: fr })}
      </td>
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Page {page} sur {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}>
          <ChevronLeft size={14} />
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}>
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminReviewsTable() {
  const searchParams = useSearchParams();
const router = useRouter();

const currentPage = Number(searchParams.get("page") ?? 1);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-reviews", currentPage, statusFilter],
    queryFn: () => fetchReviews(currentPage, statusFilter),
    // Keep previous data visible while next page loads
    placeholderData: (prev) => prev,
  });

  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter(val);
  }, []);

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-44 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data && (
          <p className="text-xs text-muted-foreground">
            {data.total} avis au total
          </p>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Chargement…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-20 text-destructive gap-2">
            <AlertCircle size={16} />
            <span className="text-sm">Erreur de chargement.</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        )}

        {!isLoading && !isError && data?.reviews.length === 0 && (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Aucun avis dans cette catégorie.
          </div>
        )}

        {!isLoading && !isError && data && data.reviews.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground py-2.5 px-4">Entreprise</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-2.5 px-4">Poste</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-2.5 px-4">Note</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-2.5 px-4">Statut</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-2.5 px-4">Reçu</th>
              </tr>
            </thead>
            <tbody>
              {data.reviews.map((review) => (
                <ReviewRow
                  key={review.id}
                  review={review}
                  onClick={() => setSelectedReview(review)}
                />
              ))}
            </tbody>
          </table>
        )}

        {data && data.totalPages > 1 && (
          <Pagination
            page={currentPage}
            totalPages={data.totalPages}
            onPrev={() => {
              const params = new URLSearchParams(useSearchParams());
              params.set("page", (currentPage - 1).toString());
              router.push(`/admin/reviews?${params.toString()}`);
            }}
            onNext={() => {
              const params = new URLSearchParams(useSearchParams());
              params.set("page", (currentPage + 1).toString());
              router.push(`/admin/reviews?${params.toString()}`);
            }}
          />
        )}
      </div>

      {/* Detail drawer */}
      <ReviewDrawer
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
        onMutate={() => {
          refetch();
          setSelectedReview(null);
        }}
      />
    </>
  );
}