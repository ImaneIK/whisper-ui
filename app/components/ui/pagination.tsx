"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [
      1,
      "...",
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    ];
  }

  return [
    1,
    "...",
    current - 1,
    current,
    current + 1,
    "...",
    total,
  ];
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(page, totalPages);

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="mt-10 flex flex-col items-center gap-5">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{start}</span>
        –
        <span className="font-medium text-foreground">{end}</span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {totalItems}
        </span>{" "}
        companies
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={18} />
        </Button>

        {pages.map((item, index) =>
          item === "..." ? (
            <span
              key={index}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={item}
              size="icon"
              variant={item === page ? "default" : "outline"}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}