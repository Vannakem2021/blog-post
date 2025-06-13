import { markdownToHtml, stripMarkdown } from "../utils";

describe("Markdown Utilities", () => {
  describe("markdownToHtml", () => {
    test("converts bold text correctly", () => {
      const input = "**Bangkok, June 13, 2025** – This is a test.";
      const expected =
        "<p><strong>Bangkok, June 13, 2025</strong> – This is a test.</p>";
      expect(markdownToHtml(input)).toBe(expected);
    });

    test("converts italic text correctly", () => {
      const input = "*This is italic* text.";
      const expected = "<p><em>This is italic</em> text.</p>";
      expect(markdownToHtml(input)).toBe(expected);
    });

    test("converts headings correctly", () => {
      const input = "# Main Title\n## Subtitle\n### Section";
      const expected =
        "<h1>Main Title</h1>\n<h2>Subtitle</h2>\n<h3>Section</h3>";
      expect(markdownToHtml(input)).toBe(expected);
    });

    test("converts links correctly", () => {
      const input = "Check out [this link](https://example.com).";
      const expected =
        '<p>Check out <a href="https://example.com" class="text-blue-600 hover:text-blue-700" target="_blank" rel="noopener noreferrer">this link</a>.</p>';
      expect(markdownToHtml(input)).toBe(expected);
    });

    test("handles mixed formatting", () => {
      const input =
        "**Bold** and *italic* text with [a link](https://example.com).";
      const expected =
        '<p><strong>Bold</strong> and <em>italic</em> text with <a href="https://example.com" class="text-blue-600 hover:text-blue-700" target="_blank" rel="noopener noreferrer">a link</a>.</p>';
      expect(markdownToHtml(input)).toBe(expected);
    });

    test("handles empty input", () => {
      expect(markdownToHtml("")).toBe("");
      expect(markdownToHtml(null as any)).toBe("");
      expect(markdownToHtml(undefined as any)).toBe("");
    });
  });

  describe("stripMarkdown", () => {
    test("strips bold formatting", () => {
      const input = "**Bangkok, June 13, 2025** – This is a test.";
      const expected = "Bangkok, June 13, 2025 – This is a test.";
      expect(stripMarkdown(input)).toBe(expected);
    });

    test("strips italic formatting", () => {
      const input = "*This is italic* text.";
      const expected = "This is italic text.";
      expect(stripMarkdown(input)).toBe(expected);
    });

    test("strips headings", () => {
      const input = "# Main Title\n## Subtitle\n### Section";
      const expected = "Main Title\nSubtitle\nSection";
      expect(stripMarkdown(input)).toBe(expected);
    });

    test("strips links but keeps text", () => {
      const input = "Check out [this link](https://example.com).";
      const expected = "Check out this link.";
      expect(stripMarkdown(input)).toBe(expected);
    });

    test("strips images completely", () => {
      const input =
        "Here is an image: ![Alt text](https://example.com/image.jpg)";
      const expected = "Here is an image: ";
      expect(stripMarkdown(input)).toBe(expected);
    });

    test("handles mixed formatting", () => {
      const input =
        "**Bold** and *italic* text with [a link](https://example.com).";
      const expected = "Bold and italic text with a link.";
      expect(stripMarkdown(input)).toBe(expected);
    });

    test("handles empty input", () => {
      expect(stripMarkdown("")).toBe("");
      expect(stripMarkdown(null as any)).toBe("");
      expect(stripMarkdown(undefined as any)).toBe("");
    });
  });
});
