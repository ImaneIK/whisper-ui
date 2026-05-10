"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Star } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { SiteShell } from "../../../components/layout/SiteShell";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Slider } from "../../../components/ui/slider";

import { api } from "../../../lib/api";
import { cn } from "../../../lib/utils";

const schema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().trim().min(5).max(120),
  pros: z.string().trim().min(10).max(800),
  cons: z.string().trim().min(10).max(800),
  advice: z.string().trim().max(500).optional().default(""),
  workLife: z.number().min(1).max(5),
  salary: z.number().min(1).max(5),
  management: z.number().min(1).max(5),
  role: z.string().trim().max(60).optional().default(""),
});

const steps = ["Rating", "Experience", "Details", "Submit"];

export default function NewReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: company } = useQuery({
    queryKey: ["company", slug],
    queryFn: () => api.getCompanyBySlug(slug),
  });

  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    rating: 0,
    title: "",
    role: "",
    pros: "",
    cons: "",
    advice: "",
    workLife: 3,
    salary: 3,
    management: 3,
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const stepValid = () => {
    if (step === 0) return form.rating >= 1 && form.title.trim().length >= 5;
    if (step === 1) return form.pros.length >= 10 && form.cons.length >= 10;
    return true;
  };

const submit = async () => {
  const parsed = schema.safeParse(form);

  if (!parsed.success || !company) {
    toast.error("Please complete all required fields");
    return;
  }

  const anonId =
    localStorage.getItem("anonId") || crypto.randomUUID();

  localStorage.setItem("anonId", anonId);

  await api.createReview({
    ...parsed.data,

    companyId: company.id,
    anonId,
  });

  qc.invalidateQueries({ queryKey: ["reviews"] });
  qc.invalidateQueries({ queryKey: ["companies"] });
  qc.invalidateQueries({ queryKey: ["latest-reviews"] });

  toast.success(
    "Thank you — your review is anonymous and live."
  );

  router.push(`/companies/${slug}`);
};

  if (!company) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-2xl p-10 text-center text-muted-foreground">
          Loading…
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href={`/companies/${slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} className="mr-1" />
          Back to {company.name}
        </Link>

        {/* STEPS */}
        <div className="mt-6 flex items-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  i < step && "bg-primary text-primary-foreground",
                  i === step && "bg-primary text-primary-foreground ring-4 ring-primary-soft",
                  i > step && "bg-secondary text-muted-foreground"
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>

              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i < step ? "bg-primary" : "bg-secondary"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="mt-8 p-6 sm:p-8">
          {/* STEP 0 */}
          {step === 0 && (
            <div className="space-y-6">
              <h1 className="font-display text-2xl font-semibold">
                How was your time at {company.name}?
              </h1>

              <div>
                <Label>Overall rating</Label>
                <div className="flex gap-1.5 mt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setForm({ ...form, rating: n })}
                    >
                      <Star
                        size={32}
                        className={n <= form.rating ? "text-yellow-500" : "text-muted-foreground/30"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Headline</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* STEP BUTTONS */}
          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              Back
            </Button>

            {step < steps.length - 1 ? (
              <Button onClick={next} disabled={!stepValid()}>
                Continue <ArrowRight size={14} className="ml-1" />
              </Button>
            ) : (
              <Button onClick={submit}>Post anonymously</Button>
            )}
          </div>
        </Card>
      </div>
    </SiteShell>
  );
}