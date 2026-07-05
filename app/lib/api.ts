import { Company } from "@/prisma/generated/prisma";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {

    async listCompanies(params?: {
  q?: string;
  industry?: string;
  page?: number;
  limit?: number;
}) {
  const search = new URLSearchParams();

  if (params?.q) {
    search.set("q", params.q);
  }

  if (params?.industry && params.industry !== "All") {
    search.set("industry", params.industry);
  }

  if (params?.page) {
    search.set("page", params.page.toString());
  }

  if (params?.limit) {
    search.set("limit", params.limit.toString());
  }

  const res = await fetch(
    `/api/companies?${search.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch companies");
  }

  return res.json();
},

  async getCompanyBySlug(slug: string) {
    const res = await fetch(`/api/companies/${slug}`);

    if (!res.ok) {
      throw new Error("Failed to fetch company");
    }

    return res.json();
  },

  async listReviews(companyId: string, sort: string) {
    const res = await fetch(
      `/api/companies/${companyId}/reviews?sort=${sort}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch reviews");
    }

    return res.json();
  },

  createReview: (data: {
    companyId:        string;
    anonId:           string;
    role?:            string;
    jobType:          "FULL_TIME" | "INTERNSHIP" | "FREELANCE" | "PART_TIME";
    seniority:        "JUNIOR" | "MID" | "SENIOR" | "EXECUTIVE";
    tenure:           "LESS_THAN_1" | "1_3" | "3_5" | "MORE_THAN_5";
    employmentStatus: "CURRENT" | "FORMER";
    city:             string;
    ratingOverall:    number;
    ratingWorkLife:   number;
    ratingSalary:     number;
    ratingManagement: number;
    ratingGrowth:     number;
    ratingAtmosphere: number;
    pros:             string[];
    cons:             string[];
    summary?:         string;
  }) => Promise<void>
};

export interface CompanyListResponse {
  data: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}