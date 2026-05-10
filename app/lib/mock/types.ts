export type Industry =
  | "Tech"
  | "Finance"
  | "Retail"
  | "Hospitality"
  | "Public"
  | "Healthcare"
  | "Logistics";

export interface Company {
  id: string;
  slug: string;
  name: string;
  city: string;
  industry: Industry;
  logo?: string;
  description: string;
  createdAt: string;
}

export interface Review {
  id: string;
  companyId: string;
  title: string;
  rating: number; // overall 1-5
  pros: string;
  cons: string;
  advice: string;
  workLife: number;
  salary: number;
  management: number;
  role?: string;
  createdAt: string;
  reported?: boolean;
  hidden?: boolean;
}

export interface Report {
  id: string;
  reviewId: string;
  reason: string;
  createdAt: string;
  status: "pending" | "resolved";
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}
