"use client";

import { markdownToHtml, stripMarkdown } from "@/lib/utils";

const sampleMarkdown = `**Bangkok, June 13, 2025** – In an event that has left both scientists and the public puzzled, mysterious blue lights were seen darting across the skies in Thailand, Cambodia, and Vietnam shortly after 9 PM local time on Thursday.

## Key Details

The phenomenon included:
- *Bright blue streaks* moving gracefully
- **Completely silent** operation
- High altitude positioning

### Scientific Response

Astronomers from the Southeast Asian Astronomy Society (SEASA) suggested that the lights could be caused by a rare meteorological event or possibly debris from a satellite re-entry.

[Read more about atmospheric phenomena](https://example.com/atmospheric-phenomena)

---

This is a demonstration of markdown rendering in the NewsHub application.`;

export function MarkdownDemo() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Markdown Rendering Demo
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Raw Markdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Raw Markdown Input
            </h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap font-mono">
              {sampleMarkdown}
            </pre>
          </div>

          {/* Rendered HTML */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Rendered HTML Output
            </h3>
            <div
              className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h2:text-xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                prose-h3:text-lg prose-h3:mb-3 prose-h3:mt-6
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700
                prose-strong:text-gray-900 prose-strong:font-bold
                prose-em:text-gray-600 prose-em:italic
                prose-ul:list-disc prose-ul:list-inside prose-ul:ml-4
                prose-li:text-gray-700 prose-li:mb-1"
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(sampleMarkdown),
              }}
            />
          </div>
        </div>

        {/* Stripped Markdown for Excerpts */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Stripped Markdown (for excerpts)
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              {stripMarkdown(sampleMarkdown).substring(0, 200)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
