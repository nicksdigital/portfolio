'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

interface LayerEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function LayerEditor({ content, onChange, placeholder }: LayerEditorProps) {
  const [activeView, setActiveView] = useState<'write' | 'preview'>('write');

  return (
    <div className="space-y-4">
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'write' | 'preview')}>
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="mt-4">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[300px] font-mono"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card className="p-4 min-h-[300px] prose prose-invert max-w-none">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">No content to preview</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
