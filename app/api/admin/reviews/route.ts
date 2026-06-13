// app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("x-admin-secret") === ADMIN_SECRET;
}

// GET /api/admin/reviews
// Returns all reviews (or filtered)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    
    const companyId = searchParams.get("companyId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
      where: companyId ? { companyId } : undefined,
      include: {
        company: { 
          select: { 
            name: true, 
            slug: true, 
            city: true 
          } 
        },
      },
      orderBy: { createdAt: "desc" },   // Newest first (better for admin overview)
      take: limit,
      skip: skip,
    });

    const total = await prisma.review.count({
      where: companyId ? { companyId } : undefined,
    });

    return NextResponse.json({
      count: reviews.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      reviews,
    });
  } catch (error) {
    console.error("[GET /api/admin/reviews]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}