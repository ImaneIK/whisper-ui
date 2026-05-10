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

export default function RegisterPage() {
  const auth = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !name) return;

    try {
      setLoading(true);

      await auth.register(name, email, password);

      toast.success("Account created");

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
        <span className="text-primary">
          <GhostLogo size={48} />
        </span>

        <h1 className="mt-4 font-display text-3xl font-semibold">
          Create your account
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Free forever. Reviews are anonymous regardless of your account.
        </p>

        <Card className="mt-8 w-full p-6 sm:p-8">
          <form
            onSubmit={submit}
            className="space-y-4"
          >
            <div>
              <Label className="mb-1.5 block">
                Display name
              </Label>

              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">
                Email
              </Label>

              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Creating account…"
                : "Create account"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </SiteShell>
  );
}