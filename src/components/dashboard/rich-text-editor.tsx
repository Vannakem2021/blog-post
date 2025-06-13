"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your blog post...",
  className,
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRichMode, setIsRichMode] = useState(false);

  // Convert HTML to Markdown
  const htmlToMarkdown = useCallback((html: string): string => {
    let markdown = html;

    // Convert headings
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n");
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n");
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n#### $1\n");
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, "\n##### $1\n");
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, "\n###### $1\n");

    // Convert bold and strong
    markdown = markdown.replace(
      /<(b|strong)[^>]*>(.*?)<\/(b|strong)>/gi,
      "**$2**"
    );

    // Convert italic and emphasis
    markdown = markdown.replace(/<(i|em)[^>]*>(.*?)<\/(i|em)>/gi, "*$2*");

    // Convert underline
    markdown = markdown.replace(/<u[^>]*>(.*?)<\/u>/gi, "<u>$1</u>");

    // Convert unordered lists
    markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      const items = content.replace(/<li[^>]*>(.*?)<\/li>/gis, "- $1\n");
      return "\n" + items + "\n";
    });

    // Convert ordered lists
    markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      let counter = 1;
      const items = content.replace(/<li[^>]*>(.*?)<\/li>/gis, () => {
        return `${counter++}. $1\n`;
      });
      return "\n" + items + "\n";
    });

    // Convert links
    markdown = markdown.replace(
      /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
      "[$2]($1)"
    );

    // Convert images
    markdown = markdown.replace(
      /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
      "![$2]($1)"
    );
    markdown = markdown.replace(
      /<img[^>]*src="([^"]*)"[^>]*\/?>/gi,
      "![Image]($1)"
    );

    // Convert paragraphs
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gis, "\n$1\n");

    // Convert line breaks
    markdown = markdown.replace(/<br\s*\/?>/gi, "\n");

    // Convert divs to paragraphs
    markdown = markdown.replace(/<div[^>]*>(.*?)<\/div>/gis, "\n$1\n");

    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, "");

    // Clean up extra whitespace and newlines
    markdown = markdown.replace(/\n\s*\n\s*\n/g, "\n\n");
    markdown = markdown.replace(/^\s+|\s+$/g, "");

    // Decode HTML entities
    markdown = markdown.replace(/&nbsp;/g, " ");
    markdown = markdown.replace(/&amp;/g, "&");
    markdown = markdown.replace(/&lt;/g, "<");
    markdown = markdown.replace(/&gt;/g, ">");
    markdown = markdown.replace(/&quot;/g, '"');
    markdown = markdown.replace(/&#39;/g, "'");

    return markdown;
  }, []);

  // Handle paste events to preserve formatting
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();

      const clipboardData = e.clipboardData;
      const htmlData = clipboardData.getData("text/html");
      const textData = clipboardData.getData("text/plain");

      if (htmlData && htmlData.trim()) {
        // Convert HTML to Markdown
        const markdownContent = htmlToMarkdown(htmlData);

        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue =
          value.substring(0, start) + markdownContent + value.substring(end);

        onChange(newValue);

        // Set cursor position after the pasted content
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + markdownContent.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 10);
      } else if (textData) {
        // Fallback to plain text
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue =
          value.substring(0, start) + textData + value.substring(end);

        onChange(newValue);

        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + textData.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 10);
      }
    },
    [value, onChange, htmlToMarkdown]
  );

  const toolbarButtons = [
    { icon: BoldIcon, label: "Bold", action: () => insertMarkdown("**", "**") },
    {
      icon: ItalicIcon,
      label: "Italic",
      action: () => insertMarkdown("*", "*"),
    },
    {
      icon: UnderlineIcon,
      label: "Underline",
      action: () => insertMarkdown("<u>", "</u>"),
    },
    {
      icon: ListBulletIcon,
      label: "Bullet List",
      action: () => insertMarkdown("\n- ", ""),
    },
    {
      icon: NumberedListIcon,
      label: "Numbered List",
      action: () => insertMarkdown("\n1. ", ""),
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: () => insertMarkdown("[", "](url)"),
    },
    {
      icon: PhotoIcon,
      label: "Image",
      action: () => insertMarkdown("![alt text](", ")"),
    },
  ];

  const insertMarkdown = useCallback(
    (before: string, after: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end);

      onChange(newText);

      // Set cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        const newCursorPos =
          start + before.length + selectedText.length + after.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 10);
    },
    [value, onChange]
  );

  const insertHeading = useCallback(
    (level: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      // Check if we're at the beginning of a line
      const beforeCursor = value.substring(0, start);
      const isAtLineStart = beforeCursor === "" || beforeCursor.endsWith("\n");

      const heading = "#".repeat(level) + " ";
      const prefix = isAtLineStart ? "" : "\n";
      const suffix = selectedText ? "" : "Heading " + level;

      const newText =
        value.substring(0, start) +
        prefix +
        heading +
        (selectedText || suffix) +
        value.substring(end);

      onChange(newText);

      // Set cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        const newCursorPos =
          start +
          prefix.length +
          heading.length +
          (selectedText || suffix).length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 10);
    },
    [value, onChange]
  );

  // Simple markdown renderer for preview
  const renderMarkdownPreview = (text: string) => {
    if (!text)
      return <p className="text-gray-500">Start typing to see preview...</p>;

    const lines = text.split("\n");
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("### ")) {
        elements.push(
          <h3 key={index} className="text-lg font-bold text-gray-900 mt-4 mb-2">
            {trimmedLine.substring(4)}
          </h3>
        );
      } else if (trimmedLine.startsWith("## ")) {
        elements.push(
          <h2 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
            {trimmedLine.substring(3)}
          </h2>
        );
      } else if (trimmedLine.startsWith("# ")) {
        elements.push(
          <h1
            key={index}
            className="text-2xl font-bold text-gray-900 mt-8 mb-4"
          >
            {trimmedLine.substring(2)}
          </h1>
        );
      } else if (trimmedLine.startsWith("- ")) {
        elements.push(
          <ul key={index} className="list-disc list-inside ml-4 mb-2">
            <li className="text-gray-700">{trimmedLine.substring(2)}</li>
          </ul>
        );
      } else if (trimmedLine.match(/^\d+\. /)) {
        elements.push(
          <ol key={index} className="list-decimal list-inside ml-4 mb-2">
            <li className="text-gray-700">
              {trimmedLine.replace(/^\d+\. /, "")}
            </li>
          </ol>
        );
      } else if (trimmedLine === "") {
        elements.push(<br key={index} />);
      } else {
        // Process inline formatting
        let processedLine = trimmedLine;

        // Bold text
        processedLine = processedLine.replace(
          /\*\*(.*?)\*\*/g,
          "<strong>$1</strong>"
        );

        // Italic text
        processedLine = processedLine.replace(/\*(.*?)\*/g, "<em>$1</em>");

        // Underline text
        processedLine = processedLine.replace(/<u>(.*?)<\/u>/g, "<u>$1</u>");

        // Links
        processedLine = processedLine.replace(
          /\[(.*?)\]\((.*?)\)/g,
          '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
        );

        elements.push(
          <p
            key={index}
            className="text-gray-700 mb-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      }
    });

    return <div>{elements}</div>;
  };

  return (
    <div
      className={cn(
        "border-2 border-gray-300 rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20",
        className
      )}
    >
      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-300">
        <div className="flex items-center space-x-1 flex-1 min-w-0">
          {/* Heading buttons */}
          <div className="flex items-center space-x-1 mr-3 border-r border-gray-300 pr-3 flex-shrink-0">
            {[1, 2, 3].map((level) => (
              <Button
                key={level}
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  insertHeading(level);
                }}
                className="text-xs font-semibold hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 px-2 py-1"
                title={`Heading ${level}`}
              >
                H{level}
              </Button>
            ))}
          </div>

          {/* Formatting buttons */}
          <div className="flex items-center space-x-1 flex-wrap">
            {toolbarButtons.map((button) => (
              <Button
                key={button.label}
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  button.action();
                }}
                title={button.label}
                className="hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200 p-1.5"
              >
                <button.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setIsPreview(false);
            }}
            className={`px-3 py-1 text-xs transition-all duration-200 ${
              !isPreview
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setIsPreview(true);
            }}
            className={`px-3 py-1 text-xs transition-all duration-200 ${
              isPreview
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="min-h-[400px]">
        {isPreview ? (
          <div className="p-6 prose max-w-none bg-gradient-to-br from-gray-50 to-white min-h-[400px]">
            {renderMarkdownPreview(value)}
          </div>
        ) : (
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              placeholder={placeholder}
              className="min-h-[400px] border-0 rounded-none resize-none focus:ring-0 p-6 text-gray-900 leading-relaxed text-base placeholder:text-gray-400"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              }}
            />
            {!value && (
              <div className="absolute bottom-4 left-6 text-xs text-gray-400 pointer-events-none">
                💡 Tip: Paste formatted content from websites or documents -
                formatting will be preserved!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
