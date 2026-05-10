"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";

import { SiteShell } from "../../components/layout/SiteShell";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { api } from "../../lib/mock/api";
import type { Industry } from "../../lib/mock/types";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(60),
  industry: z.enum([
    "Tech",
    "Finance",
    "Retail",
    "Hospitality",
    "Healthcare",
    "Public",
    "Logistics",
  ]),
  description: z.string().trim().min(10).max(500),
});

const industries: Industry[] = [
  "Tech",
  "Finance",
  "Retail",
  "Hospitality",
  "Healthcare",
  "Public",
  "Logistics",
];

export default function NewCompany() {
  const router = useRouter();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    city: "",
    industry: "Tech" as Industry,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse(form);

    if (!parsed.success) {
      const fe: Record<string, string> = {};

      parsed.error.issues.forEach((i) => {
        fe[i.path[0] as string] = i.message;
      });

      setErrors(fe);
      return;
    }

    try {
      const company = await api.createCompany(parsed.data);

      qc.invalidateQueries({ queryKey: ["companies"] });

      toast.success("Company added");

      router.push(`/companies/${company.slug}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-semibold">
          Add a company
        </h1>

        <p className="mt-2 text-muted-foreground">
          Anyone can add a company. Reviews stay anonymous either way.
        </p>

        <Card className="mt-8 p-6 sm:p-8">
          <form
            onSubmit={submit}
            className="space-y-5"
          >
            <Field
              label="Company name"
              error={errors.name}
            >
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="e.g. Atlas Cloud"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="City"
                error={errors.city}
              >
                <Input
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                  placeholder="Casablanca"
                />
              </Field>

              <Field
                label="Industry"
                error={errors.industry}
              >
                <Select
                  value={form.industry}
                  onValueChange={(v) =>
                    setForm({ ...form, industry: v as Industry })
                  }
                >
                  <SelectTrigger>
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
              </Field>
            </div>

            <Field
              label="Short description"
              error={errors.description}
            >
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                rows={4}
                placeholder="What does the company do?"
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/companies")}
              >
                Cancel
              </Button>

              <Button type="submit">
                Add company
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </SiteShell>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">
        {label}
      </Label>

      {children}

      {error && (
        <div className="mt-1 text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}