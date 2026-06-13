"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Star } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteShell } from "../../../components/layout/SiteShell";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { api } from "../../../lib/api";
import { cn } from "../../../lib/utils";

// ─── Schema & Types ──────────────────────────────────────────────────────────
const schema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().trim().min(5).max(120),
  role: z.string().trim().max(60).optional().default(""),
  pros: z.string().trim().min(10).max(800),
  cons: z.string().trim().min(10).max(800),
  advice: z.string().trim().max(500).optional().default(""),
  workLife: z.number().min(1).max(5),
  salary: z.number().min(1).max(5),
  management: z.number().min(1).max(5),
  growth: z.number().min(1).max(5),
  atmosphere: z.number().min(1).max(5),
  jobType: z.string().optional(),
  seniority: z.string().optional(),
  tenure: z.string().optional(),
  employmentStatus: z.string().optional(),
  city: z.string().optional(),
});

type FormData = z.infer<typeof schema> & {
  companyId: string;
  companyName: string;
};

const STEPS = ["Aperçu", "Poste", "Notes", "Points forts/faibles", "Conclusion"];

// Moroccan cities and options (from second version)
const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger",
  "Agadir", "Meknès", "Oujda", "Kenitra", "Tétouan",
  "Salé", "Mohammedia", "El Jadida", "Beni Mellal", "Autre",
];

const PROS_OPTIONS = [
  { value: "competitive-salary", label: "Salaire compétitif" },
  { value: "flexible-hours", label: "Horaires flexibles" },
  { value: "good-team", label: "Bonne ambiance d'équipe" },
  { value: "learning-opportunities", label: "Opportunités d'apprentissage" },
  { value: "job-stability", label: "Stabilité de l'emploi" },
  { value: "good-management", label: "Bonne direction" },
  { value: "modern-tools", label: "Outils modernes" },
  { value: "remote-work", label: "Télétravail possible" },
];

const CONS_OPTIONS = [
  { value: "unpaid-overtime", label: "Heures sup non payées" },
  { value: "no-career-path", label: "Pas d'évolution de carrière" },
  { value: "poor-management", label: "Mauvaise gestion" },
  { value: "toxic-atmosphere", label: "Ambiance toxique" },
  { value: "late-salaries", label: "Salaires en retard" },
  { value: "no-work-life-balance", label: "Aucun équilibre vie pro/perso" },
  { value: "lack-of-recognition", label: "Manque de reconnaissance" },
  { value: "high-turnover", label: "Fort turnover" },
];

export default function NewReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ["company", slug],
    queryFn: () => api.getCompanyBySlug(slug),
  });

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    companyId: "",
    companyName: "",
    rating: 0,
    title: "",
    role: "",
    pros: "",
    cons: "",
    advice: "",
    workLife: 3,
    salary: 3,
    management: 3,
    growth: 3,
    atmosphere: 3,
    jobType: "",
    seniority: "",
    tenure: "",
    employmentStatus: "",
    city: "",
  });

  const [selectedPros, setSelectedPros] = useState<string[]>([]);
  const [selectedCons, setSelectedCons] = useState<string[]>([]);

  const updateForm = (patch: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const stepValid = () => {
    if (step === 0) return form.rating >= 1 && form.title.trim().length >= 5;
    if (step === 1) return !!form.jobType && !!form.seniority && !!form.tenure && !!form.employmentStatus && !!form.city;
    if (step === 2) return [form.workLife, form.salary, form.management, form.growth, form.atmosphere].every(r => r >= 1);
    if (step === 3) return form.pros.length >= 10 && form.cons.length >= 10;
    return true;
  };

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success || !company) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const anonId = localStorage.getItem("anonId") || crypto.randomUUID();
    localStorage.setItem("anonId", anonId);

    await api.createReview({
      ...parsed.data,
      companyId: company.id,
      anonId,
      // prosTags: selectedPros,
      // consTags: selectedCons,
    });

    qc.invalidateQueries({ queryKey: ["reviews"] });
    qc.invalidateQueries({ queryKey: ["companies"] });
    qc.invalidateQueries({ queryKey: ["latest-reviews"] });

    toast.success("Merci ! Votre avis anonyme est en ligne.");
    router.push(`/companies/${slug}`);
  };

  if (!company) {
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
        <Link
          href={`/companies/${slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={14} className="mr-1" />
          Retour à {company.name}
        </Link>

        {/* Progress Bar - Enhanced with second version style */}
        <div className="mb-8">
          <div className="flex justify-between mb-3 text-xs font-medium">
            {STEPS.map((label, i) => (
              <span
                key={i}
                className={cn(
                  "transition-colors",
                  i < step ? "text-primary" : i === step ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="p-8">
          {/* Step 0: Overall Rating + Headline */}
          {step === 0 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight mb-2">
                  Comment s’est passée votre expérience chez {company.name} ?
                </h1>
                <p className="text-muted-foreground">Votre avis est anonyme et aide la communauté.</p>
              </div>

              <div>
                <Label className="text-base">Note globale</Label>
                <div className="flex gap-2 mt-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateForm({ rating: n })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={48}
                        className={n <= form.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Titre de l’avis (headline)</Label>
                <Input
                  value={form.title}
                  onChange={(e) => updateForm({ title: e.target.value })}
                  placeholder="Ex: Super ambiance mais évolution limitée"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Step 1: Position Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Parlez-nous de votre poste</h2>
                <p className="text-sm text-muted-foreground">Ces informations restent anonymes.</p>
              </div>

              {/* City */}
              <div>
                <Label>Ville du poste</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {MOROCCAN_CITIES.map((city) => (
                    <Button
                      key={city}
                      type="button"
                      variant={form.city === city ? "default" : "outline"}
                      onClick={() => updateForm({ city })}
                      className="justify-start"
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Other fields using simple selects / inputs for brevity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type de contrat</Label>
                  <select
                    value={form.jobType}
                    onChange={(e) => updateForm({ jobType: e.target.value })}
                    className="w-full mt-1 border rounded-md p-2"
                  >
                    <option value="">Sélectionner</option>
                    <option value="full-time">CDI / CDD</option>
                    <option value="internship">Stage</option>
                    <option value="freelance">Freelance</option>
                    <option value="part-time">Temps partiel</option>
                  </select>
                </div>

                <div>
                  <Label>Séniorité</Label>
                  <select
                    value={form.seniority}
                    onChange={(e) => updateForm({ seniority: e.target.value })}
                    className="w-full mt-1 border rounded-md p-2"
                  >
                    <option value="">Sélectionner</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Confirmé</option>
                    <option value="senior">Senior</option>
                    <option value="executive">Cadre / Direction</option>
                  </select>
                </div>

                <div>
                  <Label>Durée dans l’entreprise</Label>
                  <select
                    value={form.tenure}
                    onChange={(e) => updateForm({ tenure: e.target.value })}
                    className="w-full mt-1 border rounded-md p-2"
                  >
                    <option value="">Sélectionner</option>
                    <option value="less-than-1">Moins d’1 an</option>
                    <option value="1-3">1 – 3 ans</option>
                    <option value="3-5">3 – 5 ans</option>
                    <option value="more-than-5">Plus de 5 ans</option>
                  </select>
                </div>

                <div>
                  <Label>Statut actuel</Label>
                  <select
                    value={form.employmentStatus}
                    onChange={(e) => updateForm({ employmentStatus: e.target.value })}
                    className="w-full mt-1 border rounded-md p-2"
                  >
                    <option value="">Sélectionner</option>
                    <option value="current">Employé(e) actuel(le)</option>
                    <option value="former">Ancien(ne) employé(e)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Detailed Ratings */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Évaluez les aspects clés</h2>
                <p className="text-sm text-muted-foreground">1 = Très mauvais • 5 = Excellent</p>
              </div>

              {[
                { key: "workLife", label: "Équilibre vie pro / perso" },
                { key: "salary", label: "Équité salariale" },
                { key: "management", label: "Qualité du management" },
                { key: "growth", label: "Opportunités de croissance" },
                { key: "atmosphere", label: "Ambiance au travail" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-4 border-b last:border-0">
                  <span className="font-medium">{label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateForm({ [key]: n } as any)}
                      >
                        <Star
                          size={28}
                          className={n <= (form[key as keyof FormData] as number)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground/30"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Pros & Cons (text + tags) */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <Label className="text-base mb-2 block">Points forts (Pros)</Label>
                <Textarea
                  value={form.pros}
                  onChange={(e) => updateForm({ pros: e.target.value })}
                  placeholder="Décrivez ce que vous avez aimé..."
                  rows={4}
                />
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Ou sélectionnez des tags :</p>
                  <div className="flex flex-wrap gap-2">
                    {PROS_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        variant={selectedPros.includes(opt.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (selectedPros.includes(opt.value)) {
                            setSelectedPros(selectedPros.filter(v => v !== opt.value));
                          } else if (selectedPros.length < 5) {
                            setSelectedPros([...selectedPros, opt.value]);
                          }
                        }}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base mb-2 block">Points faibles (Cons)</Label>
                <Textarea
                  value={form.cons}
                  onChange={(e) => updateForm({ cons: e.target.value })}
                  placeholder="Décrivez les difficultés rencontrées..."
                  rows={4}
                />
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Ou sélectionnez des tags :</p>
                  <div className="flex flex-wrap gap-2">
                    {CONS_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        variant={selectedCons.includes(opt.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (selectedCons.includes(opt.value)) {
                            setSelectedCons(selectedCons.filter(v => v !== opt.value));
                          } else if (selectedCons.length < 5) {
                            setSelectedCons([...selectedCons, opt.value]);
                          }
                        }}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Advice / Summary */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <Label>Conseil à un futur candidat</Label>
                <Textarea
                  value={form.advice}
                  onChange={(e) => updateForm({ advice: e.target.value })}
                  placeholder="Que diriez-vous à un ami qui envisage de rejoindre cette entreprise ?"
                  rows={6}
                />
              </div>

              <div className="bg-muted/50 rounded-xl p-6 text-sm">
                <p className="font-medium mb-2">Votre avis en aperçu</p>
                <p className="text-muted-foreground line-clamp-3">{form.advice || "Aucun conseil ajouté."}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex justify-between items-center">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              ← Retour
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={next} disabled={!stepValid()}>
                Continuer <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button onClick={submit} size="lg">
                Publier mon avis anonymement
              </Button>
            )}
          </div>
        </Card>
      </div>
    </SiteShell>
  );
}