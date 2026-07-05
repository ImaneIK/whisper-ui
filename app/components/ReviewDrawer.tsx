"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Check, XCircle, Star, ShieldCheck } from "lucide-react";
import { AdminReview } from "./ReviewTable";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";


// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "";

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

const RATING_FIELDS = [
  { key: "ratingOverall",    label: "Globale" },
  { key: "ratingWorkLife",   label: "Vie pro/perso" },
  { key: "ratingSalary",     label: "Salaire" },
  { key: "ratingManagement", label: "Management" },
  { key: "ratingGrowth",     label: "Évolution" },
  { key: "ratingAtmosphere", label: "Ambiance" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={11}
            className={s <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}
          />
        ))}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Moderation actions ───────────────────────────────────────────────────────

async function moderate(
  id: string,
  action: "approve" | "reject",
  payload: { summary?: string; rejectionReason?: string; moderatorNote?: string },
) {
  const res = await fetch(`/api/admin/reviews/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": ADMIN_SECRET,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error("Action failed");
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

export function ReviewDrawer({
  review,
  onClose,
  onMutate,
}: {
  review: AdminReview | null;
  onClose: () => void;
  onMutate: () => void;
}) {
  const [editedSummary, setEditedSummary] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [moderatorNote, setModeratorNote] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  // Sync edited summary when drawer opens on a new review
  const isOpen = !!review;

  const handleApprove = async () => {
    if (!review) return;
    setLoading("approve");
    try {
      await moderate(review.id, "approve", {
        summary: editedSummary.trim() || review.summary || undefined,
        moderatorNote: moderatorNote.trim() || undefined,
      });
      toast.success("Avis approuvé et publié.");
      onMutate();
      reset();
    } catch {
      toast.error("Échec de l'approbation.");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!review) return;
    if (!rejectionReason.trim()) {
      toast.error("Motif de rejet requis.");
      return;
    }
    setLoading("reject");
    try {
      await moderate(review.id, "reject", {
        rejectionReason: rejectionReason.trim(),
        moderatorNote: moderatorNote.trim() || undefined,
      });
      toast.success("Avis rejeté.");
      onMutate();
      reset();
    } catch {
      toast.error("Échec du rejet.");
    } finally {
      setLoading(null);
    }
  };

  const reset = () => {
    setEditedSummary("");
    setRejectionReason("");
    setModeratorNote("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!review) return null;

  const isPending = review.status === "PENDING";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <p className="font-semibold text-base leading-tight">{review.company.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {review.role ?? review.jobType} · {review.city} · {review.seniority}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-1">

          {/* Ratings */}
          <Section title="Notes">
            <div className="rounded-xl border border-border px-4 py-1">
              {RATING_FIELDS.map(({ key, label }) => (
                <StarRow key={key} label={label} value={review[key]} />
              ))}
            </div>
          </Section>

          {/* Tags */}
          <Section title="Points forts">
            <div className="flex flex-wrap gap-1.5">
              {review.pros.length > 0
                ? review.pros.map((p) => (
                    <span key={p} className="text-xs bg-green-50 text-green-800 border border-green-200 px-2 py-1 rounded-full">
                      {PROS_LABELS[p] ?? p}
                    </span>
                  ))
                : <span className="text-xs text-muted-foreground">Aucun</span>
              }
            </div>
          </Section>

          <Section title="Points faibles">
            <div className="flex flex-wrap gap-1.5">
              {review.cons.length > 0
                ? review.cons.map((c) => (
                    <span key={c} className="text-xs bg-red-50 text-red-800 border border-red-200 px-2 py-1 rounded-full">
                      {CONS_LABELS[c] ?? c}
                    </span>
                  ))
                : <span className="text-xs text-muted-foreground">Aucun</span>
              }
            </div>
          </Section>

          {/* Summary — editable if pending */}
          <Section title="Résumé (optionnel)">
            {isPending ? (
              <>
                <Textarea
                  placeholder={review.summary ?? "Aucun résumé soumis — vous pouvez en ajouter un avant d'approuver."}
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  maxLength={300}
                  rows={3}
                  className="text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {review.summary
                    ? "Modifiez le résumé avant d'approuver si besoin."
                    : "Facultatif — laissez vide pour publier sans résumé."}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {review.summary ?? "—"}
              </p>
            )}
          </Section>

          {/* Rejection reason — only for pending or already rejected */}
          {(isPending || review.status === "REJECTED") && (
            <Section title={review.status === "REJECTED" ? "Motif de rejet" : "Motif de rejet (si applicable)"}>
              {isPending ? (
                <Textarea
                  placeholder="ex : Contenu vague, non vérifiable ou inapproprié."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="text-sm resize-none"
                />
              ) : (
                <p className="text-sm text-muted-foreground">{review.rejectionReason ?? "—"}</p>
              )}
            </Section>
          )}

          {/* Internal note */}
          <Section title="Note interne (non publiée)">
            {isPending ? (
              <Textarea
                placeholder="Notes pour vous-même, jamais visibles publiquement."
                value={moderatorNote}
                onChange={(e) => setModeratorNote(e.target.value)}
                rows={2}
                className="text-sm resize-none"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{review.moderatorNote ?? "—"}</p>
            )}
          </Section>

          {/* Meta */}
          <Section title="Métadonnées">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>ID : <span className="font-mono">{review.id}</span></p>
              <p>AnonID : <span className="font-mono">{review.anonId}</span></p>
              <p>Soumis le : {new Date(review.createdAt).toLocaleString("fr-FR")}</p>
              {review.publishedAt && (
                <p>Publié le : {new Date(review.publishedAt).toLocaleString("fr-FR")}</p>
              )}
            </div>
          </Section>
        </div>

        {/* Action footer — only shown for PENDING reviews */}
        {isPending && (
          <div className="flex-shrink-0 border-t border-border px-6 py-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={handleReject}
              disabled={!!loading}
            >
              {loading === "reject"
                ? <span className="animate-pulse">Rejet…</span>
                : <><XCircle size={14} className="mr-1.5" /> Rejeter</>
              }
            </Button>
            <Button
              className="flex-1"
              onClick={handleApprove}
              disabled={!!loading}
            >
              {loading === "approve"
                ? <span className="animate-pulse">Publication…</span>
                : <><Check size={14} className="mr-1.5" /> Approuver</>
              }
            </Button>
          </div>
        )}

        {/* Non-pending status banner */}
        {!isPending && (
          <div className={cn(
            "flex-shrink-0 border-t px-6 py-3 flex items-center gap-2 text-sm",
            review.status === "APPROVED"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          )}>
            <ShieldCheck size={14} />
            {review.status === "APPROVED" ? "Cet avis est publié." : "Cet avis a été rejeté."}
          </div>
        )}
      </div>
    </>
  );
}