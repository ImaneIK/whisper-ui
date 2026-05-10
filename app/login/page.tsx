"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { SiteShell } from "../components/layout/SiteShell";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { GhostLogo } from "../components/brand/GhostLogo";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    try {
      setLoading(true);

      await auth.login(email, password);

      toast.success("Welcome back");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
        <span className="text-primary">
          <GhostLogo
            size={48}
            mood="wink"
          />
        </span>

        <h1 className="mt-4 font-display text-3xl font-semibold">
          Welcome back
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to write reviews and manage your account.
        </p>

        <Card className="mt-8 w-full p-6 sm:p-8">
          <form
            onSubmit={submit}
            className="space-y-4"
          >
            <div>
              <Label className="mb-1.5 block">
                Email
              </Label>

              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">
                Password
              </Label>

              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Signing in…"
                : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-sm text-muted-foreground">
          New to Whisper?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>

        <p className="mt-3 text-xs text-muted-foreground">
          Tip: use any email. Use one starting with{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5">
            admin
          </code>{" "}
          for the moderation view.
        </p>
      </div>
    </SiteShell>
  );
}