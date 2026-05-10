import { useState } from "react";
import { Flag, ShieldCheck } from "lucide-react";
import { Stars } from "./Stars";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { api } from "../lib/mock/api";
import type { Review } from "../lib/mock/types";
import { formatDistanceToNow } from "date-fns";

export function ReviewCard({ review }: { review: Review }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const submit = async () => {
    await api.reportReview(review.id, reason || "Unspecified");
    setOpen(false);
    setReason("");
    toast.success("Report submitted", { description: "Our team will review it shortly." });
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">
              <ShieldCheck size={11} /> Anonymous
            </span>
            {review.role && <span>· {review.role}</span>}
            <span>· {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
          </div>
          <h4 className="mt-2 font-display text-lg font-semibold leading-snug">
            {review.title}
          </h4>
          <Stars value={review.rating} className="mt-1.5" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Flag size={14} className="mr-1" /> Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report this review</DialogTitle>
              <DialogDescription>
                Tell us briefly why this review violates our community guidelines.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Identifies a specific person, contains hate speech…"
              rows={4}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit}>Submit report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Section label="Pros" tone="primary">{review.pros}</Section>
        <Section label="Cons" tone="destructive">{review.cons}</Section>
        <Section label="Advice to management" tone="sand">{review.advice}</Section>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
        <Sub label="Work-life" v={review.workLife} />
        <Sub label="Salary" v={review.salary} />
        <Sub label="Management" v={review.management} />
      </div>
    </Card>
  );
}

function Section({
  label,
  children,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  tone: "primary" | "destructive" | "sand";
}) {
  const dot =
    tone === "primary" ? "bg-primary" : tone === "destructive" ? "bg-destructive" : "bg-gold";
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

function Sub({ label, v }: { label: string; v: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span>{label}</span>
      <Stars value={v} size={12} />
    </span>
  );
}
