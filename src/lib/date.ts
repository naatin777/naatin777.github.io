export const formatDate = (date: Date | string): string => {
  // Bare "YYYY-MM-DD" strings parse as UTC midnight; treat them as local dates.
  const value = typeof date === "string" && !date.includes("T") ? `${date}T00:00:00` : date;
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
