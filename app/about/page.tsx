import Link from "next/link";
import {
  ShieldCheck,
  Eye,
  MessageSquareQuote,
  Lock,
  Heart,
} from "lucide-react";

import { SiteShell } from "../components/layout/SiteShell";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { GhostLogo } from "../components/brand/GhostLogo";

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <span className="text-primary">
          <GhostLogo
            size={56}
            mood="shh"
          />
        </span>

        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Anonymity isn't a feature.
          <br />
          <span className="text-primary">
            It's the foundation.
          </span>
        </h1>

        <p className="mt-5 text-lg text-muted-foreground">
          Whisper exists so former employees can share what they couldn't say
          inside — without fear, without traceability, without compromise.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Pillar
            icon={<Lock size={18} />}
            title="Private by architecture"
          >
            Reviews are stored separately from accounts. We can't link a review
            back to a user, even with a court order.
          </Pillar>

          <Pillar
            icon={<Eye size={18} />}
            title="No surveillance"
          >
            We don't log IPs against reviews and we don't sell data to anyone.
          </Pillar>

          <Pillar
            icon={<ShieldCheck size={18} />}
            title="Human moderation"
          >
            A small team removes anything unsafe — hate, doxxing, defamation —
            without changing the substance of feedback.
          </Pillar>

          <Pillar
            icon={<MessageSquareQuote size={18} />}
            title="Honest by design"
          >
            We never edit reviews, sort them to favor companies, or accept
            payment for placement.
          </Pillar>
        </div>

        <Card className="mt-12 flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <Heart
              size={18}
              className="text-primary"
            />

            <div>
              <div className="font-display text-base font-semibold">
                Help others choose well.
              </div>

              <div className="text-sm text-muted-foreground">
                Three minutes. Stays anonymous.
              </div>
            </div>
          </div>

          <Button asChild>
            <Link href="/companies">
              Find your company
            </Link>
          </Button>
        </Card>
      </section>
    </SiteShell>
  );
}

function Pillar({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-sm text-muted-foreground">
        {children}
      </p>
    </Card>
  );
}