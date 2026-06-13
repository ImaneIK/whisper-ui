// app/api/reviews/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const VALID_PROS = [
  "competitive-salary",
  "flexible-hours",
  "good-team",
  "learning-opportunities",
  "job-stability",
  "good-management",
  "modern-tools",
  "remote-work",
];

const VALID_CONS = [
  "unpaid-overtime",
  "no-career-path",
  "poor-management",
  "toxic-atmosphere",
  "late-salaries",
  "no-work-life-balance",
  "lack-of-recognition",
  "high-turnover",
];

const ReviewSchema = z.object({
  companyId: z.string().cuid(),

  // Layer 1
  jobType: z.enum(["full-time", "internship", "freelance", "part-time"]),
  seniority: z.enum(["junior", "mid", "senior", "executive"]),
  tenure: z.enum(["less-than-1", "1-3", "3-5", "more-than-5"]),
  employmentStatus: z.enum(["current", "former"]),
  city: z.string().min(2).max(100),

  // Layer 2
  ratingOverall: z.number().int().min(1).max(5),
  ratingWorkLife: z.number().int().min(1).max(5),
  ratingSalary: z.number().int().min(1).max(5),
  ratingManagement: z.number().int().min(1).max(5),
  ratingGrowth: z.number().int().min(1).max(5),
  ratingAtmosphere: z.number().int().min(1).max(5),

  // Layer 3
  pros: z.array(z.enum(VALID_PROS as [string, ...string[]])).min(1).max(5),
  cons: z.array(z.enum(VALID_CONS as [string, ...string[]])).min(1).max(5),

  // Layer 4
  summary: z.string().max(300).optional(),
});

// Simple in-memory rate limiter — swap for Redis in production
const ipSubmissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const maxPerWindow = 3;

  const timestamps = (ipSubmissions.get(ip) || []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= maxPerWindow) return true;

  ipSubmissions.set(ip, [...timestamps, now]);
  return false;
}

// POST /api/reviews
// Submits a new review — goes into PENDING status for moderation
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: parsed.data.companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        ...parsed.data,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { message: "Review submitted. It will be published within 48 hours after verification.", id: review.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/reviews]", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}