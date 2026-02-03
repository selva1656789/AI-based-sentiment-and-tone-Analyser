'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, RefreshCw, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface AnalysisResult {
  sentiment: string;
  sentimentScore: number;
  confidenceScore: number;
  tone: string;
  toneBreakdown: { [key: string]: number };
  emotions: { [key: string]: number };
  language: string;
  professionalReply: string;
  originalMessage: string;
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [replyMode, setReplyMode] = useState('professional');
  const [editableReply, setEditableReply] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  const resultsData = searchParams.get('data');
  
  if (!resultsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h1>
          <p className="text-gray-600 mb-6">Please go back and analyze a message first.</p>
          <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analyzer
          </Button>
        </Card>
      </div>
    );
  }

  const data: AnalysisResult = JSON.parse(decodeURIComponent(resultsData));

  useEffect(() => {
    setEditableReply(data.professionalReply);
  }, [data.professionalReply]);

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😡';
      default: return '😐';
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'from-green-500 to-green-600';
    if (score < -0.1) return 'from-red-500 to-red-600';
    return 'from-yellow-500 to-yellow-600';
  };

  const rewriteReply = async (mode: string) => {
    setReplyMode(mode);
    setLoading(true);
    
    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          originalMessage: data.originalMessage,
          mode,
          currentReply: data.professionalReply
        })
      });
      
      const result = await response.json();
      setEditableReply(result.rewrittenReply);
    } catch (err) {
      console.error('Rewrite failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Button onClick={() => router.push('/')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analyzer
        </Button>
        <h1 className="text-2xl font-bold">Analysis Results</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Original Message */}
          <Card className="p-6 md:col-span-2">
            <h3 className="font-semibold mb-4">Original Message</h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-gray-700">{data.originalMessage}</p>
            </div>
          </Card>

          {/* Sentiment */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              Sentiment Analysis {getSentimentEmoji(data.sentiment)}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>{data.sentiment}</span>
                <span>{data.confidenceScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${getSentimentColor(data.sentimentScore)}`}
                  style={{ width: `${Math.abs(data.sentimentScore) * 100}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">
                Score: {data.sentimentScore.toFixed(2)} | Language: {data.language}
              </div>
            </div>
          </Card>

          {/* Tone Breakdown */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Tone Analysis</h3>
            <div className="space-y-2">
              {Object.entries(data.toneBreakdown).map(([tone, percentage]) => (
                <div key={tone} className="flex justify-between items-center">
                  <Badge variant="outline">{tone}</Badge>
                  <div className="flex items-center gap-2 flex-1 ml-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Emotions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Emotion Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(data.emotions).map(([emotion, percentage]) => (
                <div key={emotion} className="flex justify-between items-center">
                  <span className="text-sm">{emotion}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-purple-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm w-8">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Conflict Triggers */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Conflict Triggers</h3>
            <div className="space-y-2">
              {data.conflictTriggers && data.conflictTriggers.length > 0 ? (
                data.conflictTriggers.map((trigger, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-700 text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{trigger}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No conflict triggers detected</p>
              )}
            </div>
          </Card>

          {/* AI Reply Generator */}
          <Card className="p-6 md:col-span-2">
            <h3 className="font-semibold mb-4">AI Reply Generator</h3>
            
            {/* Tone Rewrite Options */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['Formal', 'Friendly', 'Calm', 'Assertive', 'Apologetic'].map((mode) => (
                <Button
                  key={mode}
                  variant={replyMode === mode.toLowerCase() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => rewriteReply(mode.toLowerCase())}
                  disabled={loading}
                >
                  {mode}
                </Button>
              ))}
            </div>
            
            {/* Editable Reply */}
            <textarea
              value={editableReply}
              onChange={(e) => setEditableReply(e.target.value)}
              className="w-full h-24 p-3 border rounded-lg mb-4 resize-none"
              placeholder="AI-generated reply will appear here..."
            />
            
            {/* Controls */}
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button onClick={() => rewriteReply('professional')} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerate
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}