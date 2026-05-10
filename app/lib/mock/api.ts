import type { Company, Industry, Report, Review } from "./types";
import { seedCompanies, seedReports, seedReviews } from "./seed";

const STORAGE_KEY = "whisper.mock.v1";

interface State {
  companies: Company[];
  reviews: Review[];
  reports: Report[];
}

function load(): State {
  if (typeof window === "undefined") {
    return { companies: seedCompanies, reviews: seedReviews, reports: seedReports };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = { companies: seedCompanies, reviews: seedReviews, reports: seedReports };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function save(state: State) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const delay = <T,>(value: T, ms = 120) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export interface CompanyWithStats extends Company {
  reviewCount: number;
  avgRating: number;
  avgWorkLife: number;
  avgSalary: number;
  avgManagement: number;
}

function withStats(company: Company, reviews: Review[]): CompanyWithStats {
  const own = reviews.filter((r) => r.companyId === company.id && !r.hidden);
  const n = own.length || 1;
  const avg = (sel: (r: Review) => number) =>
    own.length ? own.reduce((a, r) => a + sel(r), 0) / n : 0;
  return {
    ...company,
    reviewCount: own.length,
    avgRating: avg((r) => r.rating),
    avgWorkLife: avg((r) => r.workLife),
    avgSalary: avg((r) => r.salary),
    avgManagement: avg((r) => r.management),
  };
}

export const api = {
  async listCompanies(filter?: { q?: string; industry?: Industry | "All"; city?: string }) {
    const s = load();
    let list = s.companies.map((c) => withStats(c, s.reviews));
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q),
      );
    }
    if (filter?.industry && filter.industry !== "All") {
      list = list.filter((c) => c.industry === filter.industry);
    }
    if (filter?.city) list = list.filter((c) => c.city === filter.city);
    return delay(list);
  },

  async getCompanyBySlug(slug: string) {
    const s = load();
    const c = s.companies.find((c) => c.slug === slug);
    if (!c) return delay(null);
    return delay(withStats(c, s.reviews));
  },

  async listReviews(companyId: string, sort: "newest" | "highest" | "lowest" = "newest") {
    const s = load();
    let list = s.reviews.filter((r) => r.companyId === companyId && !r.hidden);
    if (sort === "newest") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "highest") list.sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") list.sort((a, b) => a.rating - b.rating);
    return delay(list);
  },

  async latestReviews(limit = 6) {
    const s = load();
    return delay(
      [...s.reviews]
        .filter((r) => !r.hidden)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit),
    );
  },

  async createCompany(input: Omit<Company, "id" | "slug" | "createdAt">) {
    const s = load();
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const company: Company = {
      ...input,
      id: crypto.randomUUID(),
      slug,
      createdAt: new Date().toISOString(),
    };
    s.companies.unshift(company);
    save(s);
    return delay(company);
  },

  async createReview(input: Omit<Review, "id" | "createdAt">) {
    const s = load();
    const review: Review = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    s.reviews.unshift(review);
    save(s);
    return delay(review);
  },

  async reportReview(reviewId: string, reason: string) {
    const s = load();
    s.reports.unshift({
      id: crypto.randomUUID(),
      reviewId,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    save(s);
    return delay(true);
  },

  async listReports() {
    const s = load();
    return delay(
      s.reports.map((r) => ({
        ...r,
        review: s.reviews.find((rv) => rv.id === r.reviewId),
        company:
          s.companies.find(
            (c) => c.id === s.reviews.find((rv) => rv.id === r.reviewId)?.companyId,
          ) || null,
      })),
    );
  },

  async deleteReview(reviewId: string) {
    const s = load();
    s.reviews = s.reviews.filter((r) => r.id !== reviewId);
    s.reports = s.reports.map((r) =>
      r.reviewId === reviewId ? { ...r, status: "resolved" } : r,
    );
    save(s);
    return delay(true);
  },

  async dismissReport(reportId: string) {
    const s = load();
    s.reports = s.reports.map((r) =>
      r.id === reportId ? { ...r, status: "resolved" } : r,
    );
    save(s);
    return delay(true);
  },

  async stats() {
    const s = load();
    return delay({
      companies: s.companies.length,
      reviews: s.reviews.length,
      reports: s.reports.filter((r) => r.status === "pending").length,
      avgRating:
        s.reviews.reduce((a, r) => a + r.rating, 0) / Math.max(s.reviews.length, 1),
    });
  },
};
