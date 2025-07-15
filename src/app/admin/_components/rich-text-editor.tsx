'use client';

import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  name,
  value = '',
  onChange,
  placeholder = 'Start typing...',
  minHeight = '200px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/50 p-2">
        <Button
          className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Bold className="h-3 w-3" />
        </Button>
        <Button
          className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Italic className="h-3 w-3" />
        </Button>
        <Button
          className={cn('h-8 w-8 p-0', editor.isActive('code') && 'bg-muted')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Code className="h-3 w-3" />
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('heading', { level: 2 }) && 'bg-muted'
          )}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          size="sm"
          type="button"
          variant="ghost"
        >
          <Heading2 className="h-3 w-3" />
        </Button>
        <Button
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('bulletList') && 'bg-muted'
          )}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          size="sm"
          type="button"
          variant="ghost"
        >
          <List className="h-3 w-3" />
        </Button>
        <Button
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('orderedList') && 'bg-muted'
          )}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          size="sm"
          type="button"
          variant="ghost"
        >
          <ListOrdered className="h-3 w-3" />
        </Button>
        <Button
          className={cn(
            'h-8 w-8 p-0',
            editor.isActive('blockquote') && 'bg-muted'
          )}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Quote className="h-3 w-3" />
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button
          className="h-8 w-8 p-0"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Undo className="h-3 w-3" />
        </Button>
        <Button
          className="h-8 w-8 p-0"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Redo className="h-3 w-3" />
        </Button>
      </div>
      <EditorContent
        className="prose prose-sm max-w-none overflow-y-auto p-4 focus:outline-none"
        editor={editor}
        style={{ minHeight }}
      />
      <input name={name} type="hidden" value={editor.getHTML()} />
    </div>
  );
}
