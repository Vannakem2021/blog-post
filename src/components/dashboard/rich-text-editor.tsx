'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your blog post...",
  className 
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const toolbarButtons = [
    { icon: BoldIcon, label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: ItalicIcon, label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: UnderlineIcon, label: 'Underline', action: () => insertMarkdown('<u>', '</u>') },
    { icon: ListBulletIcon, label: 'Bullet List', action: () => insertMarkdown('\n- ', '') },
    { icon: NumberedListIcon, label: 'Numbered List', action: () => insertMarkdown('\n1. ', '') },
    { icon: LinkIcon, label: 'Link', action: () => insertMarkdown('[', '](url)') },
    { icon: PhotoIcon, label: 'Image', action: () => insertMarkdown('![alt text](', ')') },
  ]

  const insertMarkdown = (before: string, after: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const insertHeading = (level: number) => {
    const heading = '#'.repeat(level) + ' '
    insertMarkdown('\n' + heading, '')
  }

  return (
    <div className={cn("border border-gray-300 rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-300">
        <div className="flex items-center space-x-1">
          {/* Heading buttons */}
          <div className="flex items-center space-x-1 mr-3 border-r border-gray-300 pr-3">
            {[1, 2, 3].map((level) => (
              <Button
                key={level}
                variant="ghost"
                size="sm"
                onClick={() => insertHeading(level)}
                className="text-xs"
              >
                H{level}
              </Button>
            ))}
          </div>
          
          {/* Formatting buttons */}
          {toolbarButtons.map((button) => (
            <Button
              key={button.label}
              variant="ghost"
              size="sm"
              onClick={button.action}
              title={button.label}
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isPreview ? "ghost" : "secondary"}
            size="sm"
            onClick={() => setIsPreview(false)}
          >
            Edit
          </Button>
          <Button
            variant={isPreview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(true)}
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="min-h-[400px]">
        {isPreview ? (
          <div 
            className="p-4 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br>') }}
          />
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] border-0 rounded-none resize-none focus:ring-0"
          />
        )}
      </div>
    </div>
  )
}
