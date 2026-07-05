// app/api/companies/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma";
import { z } from "zod";

export const revalidate = 300; // Cache GET responses for 5 minutes

/* -------------------------------------------------------------------------- */
/*                                   Schemas                                  */
/* -------------------------------------------------------------------------- */

const CompanySchema = z.object({
  name: z.string().trim().min(2).max(100),
  industry: z.string().trim().min(2).max(100).optional(),
  city: z.string().trim().min(2).max(100),
  slug: z.string().trim().optional(),
});

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  q: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  sort: z
    .enum(["name", "rating", "reviews", "newest"])
    .default("name"),
});

/* -------------------------------------------------------------------------- */
/*                                     GET                                    */
/* -------------------------------------------------------------------------- */

export async function GET(req: NextRequest) {
  try {
    const query = Object.fromEntries(req.nextUrl.searchParams.entries());

    const parsed = QuerySchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { page, limit, q, industry, sort } = parsed.data;

    const where: Prisma.CompanyWhereInput = {};

    if (q) {
      where.OR = [
        {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          industry: {
            contains: q,
            mode: "insensitive",
          },
        },
      ];
    }

    if (industry) {
      where.industry = industry;
    }

   const orderByMap: Record<
  "name" | "rating" | "reviews" | "newest",
  Prisma.CompanyOrderByWithRelationInput
> = {
  name: {
    name: "asc",
  },
  rating: {
    averageRating: "desc",
  },
  reviews: {
    totalReviews: "desc",
  },
  newest: {
    createdAt: "desc",
  },
};

const orderBy = orderByMap[sort];

    const [companies, total] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
          city: true,
          averageRating: true,
          totalReviews: true,
        },
      }),

      prisma.company.count({
        where,
      }),
    ]);

    return NextResponse.json({
      data: companies,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/companies]", error);

    return NextResponse.json(
      {
        error: "Failed to fetch companies",
      },
      {
        status: 500,
      }
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                                    POST                                    */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = CompanySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const slug =
      data.slug ??
      data.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const company = await prisma.company.create({
      data: {
        name: data.name,
        slug,
        industry: data.industry,
        city: data.city,
      },
    });

    return NextResponse.json(company, {
      status: 201,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "A company with this slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    console.error("[POST /api/companies]", error);

    return NextResponse.json(
      {
        error: "Failed to create company",
      },
      {
        status: 500,
      }
    );
  }
}