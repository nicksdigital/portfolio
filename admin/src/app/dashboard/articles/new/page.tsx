'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewArticlePage() {
  const router = useRouter();
  
  // Redirect to the article editor with 'new' as the ID
  // This allows us to reuse the same editor component for both new and existing articles
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/dashboard/articles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create New Article</h1>
        </div>
      </div>
      
      <Card className="flex items-center justify-center p-12">
        <div className="text-center">
          <CardTitle className="text-2xl mb-4">Redirecting to Editor</CardTitle>
          <CardContent className="p-0">
            <p className="text-muted-foreground mb-6">
              You will be redirected to the article editor in a moment...
            </p>
            <Button 
              onClick={() => router.push('/dashboard/articles/new')}
              className="mx-auto"
            >
              Go to Editor
            </Button>
          </CardContent>
        </div>
      </Card>
      
      {/* Auto-redirect */}
      {typeof window !== 'undefined' && router.push('/dashboard/articles/new')}
    </div>
  );
}
