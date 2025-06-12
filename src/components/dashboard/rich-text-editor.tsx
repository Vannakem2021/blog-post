"use client";

import { useState, useRef, useCallback } from "react";
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
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] border-0 rounded-none resize-none focus:ring-0 p-6 text-gray-900 leading-relaxed text-base placeholder:text-gray-400"
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            }}
          />
        )}
      </div>
    </div>
  );
}
