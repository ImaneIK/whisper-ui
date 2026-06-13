// app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CompanySchema = z.object({
  name: z.string().min(2).max(100),
  sector: z.string().min(2).max(100).optional(),
  industry: z.string().min(2).max(100).optional(),
  city: z.string().min(2).max(100),
  slug: z.string().optional(), // Will be auto-generated if not provided
});

// GET /api/companies
export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        sector: true,
        industry: true,
        city: true,
        averageRating: true,
        totalReviews: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error("[GET /api/companies]", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

// POST /api/companies
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CompanySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const company = await prisma.company.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        sector: data.sector || data.industry,
        industry: data.industry || data.sector,
        city: data.city,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Company with this name or slug already exists" }, { status: 409 });
    }
    console.error("[POST /api/companies]", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}