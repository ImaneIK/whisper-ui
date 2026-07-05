"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/app/lib/utils";
import { api } from "@/app/lib/api";
import { SiteShell } from "@/app/components/layout/SiteShell";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";



// ─── Constants ────────────────────────────────────────────────────────────────

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger",
  "Agadir", "Meknès", "Oujda", "Kenitra", "Tétouan",
  "Salé", "Mohammedia", "El Jadida", "Beni Mellal", "Autre",
];

const PROS_OPTIONS = [
  { value: "competitive-salary",     label: "Salaire compétitif" },
  { value: "flexible-hours",         label: "Horaires flexibles" },
  { value: "good-team",              label: "Bonne ambiance d'équipe" },
  { value: "learning-opportunities", label: "Opportunités d'apprentissage" },
  { value: "job-stability",          label: "Stabilité de l'emploi" },
  { value: "good-management",        label: "Bonne direction" },
  { value: "modern-tools",           label: "Outils modernes" },
  { value: "remote-work",            label: "Télétravail possible" },
];

const CONS_OPTIONS = [
  { value: "unpaid-overtime",      label: "Heures sup non payées" },
  { value: "no-career-path",       label: "Pas d'évolution de carrière" },
  { value: "poor-management",      label: "Mauvaise gestion" },
  { value: "toxic-atmosphere",     label: "Ambiance toxique" },
  { value: "late-salaries",        label: "Salaires en retard" },
  { value: "no-work-life-balance", label: "Aucun équilibre vie pro/perso" },
  { value: "lack-of-recognition",  label: "Manque de reconnaissance" },
  { value: "high-turnover",        label: "Fort turnover" },
];

const RATING_FIELDS = [
  { key: "ratingOverall",    label: "Expérience globale" },
  { key: "ratingWorkLife",   label: "Équilibre vie pro/perso" },
  { key: "ratingSalary",     label: "Équité salariale" },
  { key: "ratingManagement", label: "Qualité du management" },
  { key: "ratingGrowth",     label: "Opportunités de croissance" },
  { key: "ratingAtmosphere", label: "Ambiance au travail" },
] as const;

const STEPS = ["Poste", "Notes", "Retours", "Résumé"] as const;

// ─── Zod schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  companyId:        z.string(),
  anonId:           z.string(),
  role:             z.string().trim().max(60).optional().default(""),
  jobType:          z.enum(["FULL_TIME", "INTERNSHIP", "FREELANCE", "PART_TIME"]),
  seniority:        z.enum(["JUNIOR", "MID", "SENIOR", "EXECUTIVE"]),
  tenure:           z.enum(["LESS_THAN_1", "1_3", "3_5", "MORE_THAN_5"]),
  employmentStatus: z.enum(["CURRENT", "FORMER"]),
  city:             z.string().min(1),
  ratingOverall:    z.number().int().min(1).max(5),
  ratingWorkLife:   z.number().int().min(1).max(5),
  ratingSalary:     z.number().int().min(1).max(5),
  ratingManagement: z.number().int().min(1).max(5),
  ratingGrowth:     z.number().int().min(1).max(5),
  ratingAtmosphere: z.number().int().min(1).max(5),
  pros:             z.array(z.string()).min(1).max(5),
  cons:             z.array(z.string()).min(1).max(5),
  summary:          z.string().trim().max(300).optional().default(""),
});

type FormData = Omit<z.infer<typeof schema>, "companyId" | "anonId">;

const INITIAL: FormData = {
  role:             "",
  jobType:          "" as FormData["jobType"],
  seniority:        "" as FormData["seniority"],
  tenure:           "" as FormData["tenure"],
  employmentStatus: "" as FormData["employmentStatus"],
  city:             "",
  ratingOverall:    0,
  ratingWorkLife:   0,
  ratingSalary:     0,
  ratingManagement: 0,
  ratingGrowth:     0,
  ratingAtmosphere: 0,
  pros:             [],
  cons:             [],
  summary:          "",
};

// ─── Small reusable components ────────────────────────────────────────────────

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl font-semibold text-foreground leading-tight">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm border transition-all duration-150",
              value === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StarRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-xl transition-transform duration-100 hover:scale-110"
          >
            <span className={star <= (hovered || value) ? "text-yellow-500" : "text-muted-foreground/30"}>
              ★
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxGrid({
  label,
  hint,
  options,
  selected,
  onChange,
  max,
}: {
  label: string;
  hint: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
  max: number;
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else if (selected.length < max) {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="mb-6">
      <p className="text-sm font-medium mb-0.5">{label}</p>
      <p className="text-xs text-muted-foreground mb-3">{hint}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          const disabled = !checked && selected.length >= max;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt.value)}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-all duration-150",
                checked  && "bg-primary text-primary-foreground border-primary",
                !checked && !disabled && "bg-background text-foreground border-border hover:border-primary",
                disabled && "bg-secondary text-muted-foreground border-border cursor-not-allowed opacity-50"
              )}
            >
              <span className={cn(
                "w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center text-xs",
                checked ? "bg-primary-foreground border-primary-foreground text-primary" : "border-current"
              )}>
                {checked && <Check size={10} />}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step0Position({
  data,
  companyName,
  update,
}: {
  data: FormData;
  companyName: string;
  update: (p: Partial<FormData>) => void;
}) {
  return (
    <>
      <StepHeading
        title={`Votre poste chez ${companyName}`}
        subtitle="Ces informations restent anonymes et ne permettent pas de vous identifier."
      />

      {/* Optional role title */}
      <div className="mb-5">
        <p className="text-sm font-medium mb-2">Intitulé du poste <span className="text-muted-foreground font-normal">(facultatif)</span></p>
        <input
          type="text"
          maxLength={60}
          placeholder="ex : Développeur fullstack, Chargé de clientèle…"
          value={data.role}
          onChange={(e) => update({ role: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <PillGroup
        label="Type de contrat"
        value={data.jobType}
        onChange={(v) => update({ jobType: v as FormData["jobType"] })}
        options={[
          { value: "FULL_TIME",  label: "CDI / CDD" },
          { value: "INTERNSHIP", label: "Stage" },
          { value: "FREELANCE",  label: "Freelance" },
          { value: "PART_TIME",  label: "Temps partiel" },
        ]}
      />

      <PillGroup
        label="Niveau"
        value={data.seniority}
        onChange={(v) => update({ seniority: v as FormData["seniority"] })}
        options={[
          { value: "JUNIOR",    label: "Junior" },
          { value: "MID",       label: "Confirmé" },
          { value: "SENIOR",    label: "Senior" },
          { value: "EXECUTIVE", label: "Cadre / Direction" },
        ]}
      />

      <PillGroup
        label="Durée dans l'entreprise"
        value={data.tenure}
        onChange={(v) => update({ tenure: v as FormData["tenure"] })}
        options={[
          { value: "LESS_THAN_1", label: "< 1 an" },
          { value: "1_3",         label: "1 – 3 ans" },
          { value: "3_5",         label: "3 – 5 ans" },
          { value: "MORE_THAN_5", label: "+ 5 ans" },
        ]}
      />

      <PillGroup
        label="Statut"
        value={data.employmentStatus}
        onChange={(v) => update({ employmentStatus: v as FormData["employmentStatus"] })}
        options={[
          { value: "CURRENT", label: "Employé(e) actuel(le)" },
          { value: "FORMER",  label: "Ancien(ne) employé(e)" },
        ]}
      />

      {/* City grid */}
      <div>
        <p className="text-sm font-medium mb-2">Ville du poste</p>
        <div className="grid grid-cols-3 gap-1.5">
          {MOROCCAN_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => update({ city })}
              className={cn(
                "py-2 px-3 rounded-lg border text-sm transition-all duration-150 truncate",
                data.city === city
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary"
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Step1Ratings({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <>
      <StepHeading
        title="Évaluez votre expérience"
        subtitle="Notez chaque aspect de 1 (très mauvais) à 5 (excellent)."
      />
      <div className="rounded-2xl border border-border px-5 py-1">
        {RATING_FIELDS.map(({ key, label }) => (
          <StarRow
            key={key}
            label={label}
            value={data[key] as number}
            onChange={(v) => update({ [key]: v })}
          />
        ))}
      </div>
    </>
  );
}

function Step2Tags({ data, update }: { data: FormData; update: (p: Partial<FormData>) => void }) {
  return (
    <>
      <StepHeading
        title="Points forts & points faibles"
        subtitle="Sélectionnez ce qui décrit le mieux votre expérience."
      />
      <CheckboxGrid
        label="✓ Ce que l'entreprise fait bien"
        hint="Jusqu'à 5 choix"
        options={PROS_OPTIONS}
        selected={data.pros}
        onChange={(pros) => update({ pros })}
        max={5}
      />
      <CheckboxGrid
        label="✗ Ce qui pose problème"
        hint="Jusqu'à 5 choix"
        options={CONS_OPTIONS}
        selected={data.cons}
        onChange={(cons) => update({ cons })}
        max={5}
      />
    </>
  );
}

function Step3Summary({
  data,
  companyName,
  update,
}: {
  data: FormData;
  companyName: string;
  update: (p: Partial<FormData>) => void;
}) {
  const MAX = 300;
  const remaining = MAX - data.summary.length;

  return (
    <>
      <StepHeading
        title="Un mot pour conclure"
        subtitle="Facultatif. Que diriez-vous à un ami qui envisage de rejoindre cette entreprise ?"
      />

      <div className="relative mb-6">
        <textarea
          maxLength={MAX}
          value={data.summary}
          onChange={(e) => update({ summary: e.target.value })}
          placeholder="ex : Bonne boîte pour débuter, mais les perspectives d'évolution sont limitées après 2 ans."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
        />
        <span className={cn(
          "absolute bottom-3 right-3 text-xs",
          remaining < 50 ? "text-destructive" : "text-muted-foreground"
        )}>
          {remaining} car. restants
        </span>
      </div>

      {/* Preview card */}
      <div className="rounded-2xl bg-secondary p-5 mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Aperçu de votre avis</p>
        <p className="text-sm font-semibold mb-0.5">{companyName}</p>
        <p className="text-xs text-muted-foreground mb-3">
          {data.city}{data.role ? ` · ${data.role}` : ""} · {data.jobType} · {data.seniority}
        </p>
        <div className="flex gap-0.5 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={s <= data.ratingOverall ? "text-yellow-500" : "text-muted-foreground/30"}>★</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.pros.map((p) => (
            <span key={p} className="text-xs bg-background text-foreground px-2 py-1 rounded-full border border-border">
              {PROS_OPTIONS.find((o) => o.value === p)?.label}
            </span>
          ))}
          {data.cons.map((c) => (
            <span key={c} className="text-xs bg-foreground text-background px-2 py-1 rounded-full">
              {CONS_OPTIONS.find((o) => o.value === c)?.label}
            </span>
          ))}
        </div>
        {data.summary && (
          <p className="text-sm text-muted-foreground mt-3 italic">"{data.summary}"</p>
        )}
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck size={14} className="mt-0.5 flex-shrink-0" />
        <p>Aucun compte créé. Votre avis sera publié anonymement sous 48h après vérification par notre équipe.</p>
      </div>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NewReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: company, isLoading } = useQuery({
    queryKey: ["company", slug],
    queryFn: () => api.getCompanyBySlug(slug),
  });

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const update = (patch: Partial<FormData>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const canProceed = (): boolean => {
    if (step === 0)
      return (
        !!form.jobType &&
        !!form.seniority &&
        !!form.tenure &&
        !!form.employmentStatus &&
        !!form.city
      );
    if (step === 1)
      return RATING_FIELDS.every(({ key }) => (form[key] as number) > 0);
    if (step === 2)
      return form.pros.length > 0 && form.cons.length > 0;
    return true; // step 3 (summary) is optional
  };

  const handleSubmit = async () => {
    if (!company) return;

    // Retrieve or create a persistent anonymous browser ID
    const anonId =
      localStorage.getItem("anonId") ?? crypto.randomUUID();
    localStorage.setItem("anonId", anonId);

    const parsed = schema.safeParse({
      ...form,
      companyId: company.id,
      anonId,
    });

    if (!parsed.success) {
      toast.error("Veuillez compléter tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createReview(parsed.data);

      // Invalidate relevant React Query caches
      qc.invalidateQueries({ queryKey: ["company", slug] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["latest-reviews"] });

      toast.success("Avis envoyé — il sera publié sous 48h après vérification.");
      router.push(`/companies/${slug}`);
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !company) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-2xl p-10 text-center text-muted-foreground">
          Chargement…
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* Back link */}
        <Link
          href={`/companies/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Retour à {company.name}
        </Link>

        {/* Page title */}
        <div className="mt-6 mb-8">
          <p className="text-xs font-medium tracking-widest text-primary uppercase mb-1">Avis anonyme</p>
          <h1 className="font-display text-3xl font-semibold">Partagez votre expérience</h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex flex-1 items-center gap-2">
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold flex-shrink-0",
                i < step  && "bg-primary text-primary-foreground",
                i === step && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                i > step  && "bg-secondary text-muted-foreground"
              )}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span className={cn(
                "text-xs hidden sm:block",
                i === step ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "h-px flex-1 rounded-full",
                  i < step ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <Card className="p-6 sm:p-8">
          {step === 0 && (
            <Step0Position data={form} companyName={company.name} update={update} />
          )}
          {step === 1 && (
            <Step1Ratings data={form} update={update} />
          )}
          {step === 2 && (
            <Step2Tags data={form} update={update} />
          )}
          {step === 3 && (
            <Step3Summary data={form} companyName={company.name} update={update} />
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
            >
              <ArrowLeft size={14} className="mr-1" />
              Retour
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Continuer
                <ArrowRight size={14} className="ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Envoi…" : "Soumettre mon avis"}
              </Button>
            )}
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Aucune inscription requise · Totalement anonyme · Vérifié avant publication
        </p>
      </div>
    </SiteShell>
  );
}