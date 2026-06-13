// app/api/admin/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === ADMIN_SECRET;
}

// GET /api/admin/reviews/:id — View a single review (for admin panel)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: { name: true, slug: true, city: true },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("[GET /api/admin/reviews/:id]", error);
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 });
  }
}

// DELETE /api/admin/reviews/:id — Allow admin to delete a review if needed
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const review = await prisma.review.delete({
      where: { id: params.id },
    });

    // Optional: Update company stats after deletion
    await prisma.company.update({
      where: { id: review.companyId },
      data: {
        totalReviews: { decrement: 1 },
        // You can recalculate averageRating here if needed
      },
    });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/admin/reviews/:id]", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}