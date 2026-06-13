// app/api/companies/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/companies/:id
// Returns a single company with all its approved reviews
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            jobType: true,
            seniority: true,
            tenure: true,
            employmentStatus: true,
            city: true,
            ratingOverall: true,
            ratingWorkLife: true,
            ratingSalary: true,
            ratingManagement: true,
            ratingGrowth: true,
            ratingAtmosphere: true,
            pros: true,
            cons: true,
            summary: true,
            publishedAt: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("[GET /api/companies/:id]", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}