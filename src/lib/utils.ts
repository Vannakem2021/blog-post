import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "No date";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Convert Markdown text to HTML for consistent rendering across the application
 * This function handles the same Markdown syntax as the rich text editor preview
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // Convert headings
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Convert bold text (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Convert italic text (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Convert underline text
  html = html.replace(/<u>(.*?)<\/u>/g, "<u>$1</u>");

  // Convert links [text](url)
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" class="text-blue-600 hover:text-blue-700" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Convert images ![alt](url)
  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<img src="$2" alt="$1" class="rounded-xl shadow-lg my-6 w-full h-auto" />'
  );

  // Convert unordered lists (improved to handle multiple items)
  html = html.replace(/^(\s*[-*]\s+.+)$/gm, (match) => {
    const items = match.split(/\n\s*[-*]\s+/).filter(Boolean);
    if (items.length > 1) {
      return (
        "<ul>" +
        items
          .map((item) => `<li>${item.replace(/^\s*[-*]\s+/, "")}</li>`)
          .join("") +
        "</ul>"
      );
    }
    return `<ul><li>${match.replace(/^\s*[-*]\s+/, "")}</li></ul>`;
  });

  // Convert ordered lists (improved to handle multiple items)
  html = html.replace(/^(\s*\d+\.\s+.+)$/gm, (match) => {
    const items = match.split(/\n\s*\d+\.\s+/).filter(Boolean);
    if (items.length > 1) {
      return (
        "<ol>" +
        items
          .map((item) => `<li>${item.replace(/^\s*\d+\.\s+/, "")}</li>`)
          .join("") +
        "</ol>"
      );
    }
    return `<ol><li>${match.replace(/^\s*\d+\.\s+/, "")}</li></ol>`;
  });

  // Convert line breaks to paragraphs
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return "";

      // Don't wrap headings, lists, or already wrapped content in paragraphs
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<p") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<img")
      ) {
        return trimmed;
      }

      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  // Convert single line breaks to <br> within paragraphs
  html = html.replace(/\n(?!<)/g, "<br>");

  // Clean up any double spaces
  html = html.replace(/\s+/g, " ");

  return html;
}

/**
 * Strip Markdown formatting to get plain text
 * Useful for excerpts, meta descriptions, and other plain text contexts
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return "";

  let text = markdown;

  // Remove headings
  text = text.replace(/^#{1,6}\s+/gm, "");

  // Remove bold and italic
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/__(.*?)__/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/_(.*?)_/g, "$1");

  // Remove links but keep text
  text = text.replace(/\[(.*?)\]\(.*?\)/g, "$1");

  // Remove images
  text = text.replace(/!\[.*?\]\(.*?\)/g, "");

  // Remove list markers
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");

  // Remove underline tags
  text = text.replace(/<\/?u>/g, "");

  // Clean up extra whitespace
  text = text.replace(/\n\s*\n/g, "\n");
  text = text.replace(/^\s+|\s+$/g, "");

  return text;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
