const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {

    async listCompanies(params?: {
  q?: string;
  industry?: string;
}) {
  const search = new URLSearchParams();

  if (params?.q) {
    search.set("q", params.q);
  }

  if (params?.industry && params.industry !== "All") {
    search.set("industry", params.industry);
  }

  const res = await fetch(
    `${API_URL}/companies?${search.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch companies");
  }

  return res.json();
},

  async getCompanyBySlug(slug: string) {
    const res = await fetch(`${API_URL}/companies/${slug}`);

    if (!res.ok) {
      throw new Error("Failed to fetch company");
    }

    return res.json();
  },

  async listReviews(companyId: string, sort: string) {
    const res = await fetch(
      `${API_URL}/companies/${companyId}/reviews?sort=${sort}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch reviews");
    }

    return res.json();
  },

  async createReview(data: {
    companyId: string;
    anonId: string;

    title: string;
    pros: string;
    cons: string;
    advice?: string;

    rating: number;
    workLife: number;
    salary: number;
    management: number;
  }) {
    const res = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to create review");
    }

    return res.json();
  },
};