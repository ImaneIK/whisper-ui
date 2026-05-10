export function getAnonId() {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem("anonId");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("anonId", id);
  }

  return id;
}