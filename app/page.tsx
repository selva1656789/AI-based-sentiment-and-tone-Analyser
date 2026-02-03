'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, RefreshCw, History, Moon, Sun } from 'lucide-react';
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
  conflictTriggers?: string[];
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [replyMode, setReplyMode] = useState('professional');
  const [editableReply, setEditableReply] = useState('');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [copied, setCopied] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const savedHistory = localStorage.getItem('analysisHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (result: AnalysisResult) => {
    const newHistory = [result, ...history.slice(0, 9)];
    setHistory(newHistory);
    localStorage.setItem('analysisHistory', JSON.stringify(newHistory));
  };

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
    if (!results) return;
    setReplyMode(mode);
    setLoading(true);
    
    try {
      // Mock rewrite functionality - replace with actual API call
      const rewrittenReplies = {
        formal: "I appreciate your message and would like to provide a formal response to address your concerns.",
        friendly: "Thanks for reaching out! I'd love to help you with this.",
        calm: "I understand your perspective and would like to discuss this calmly.",
        assertive: "I want to be clear about my position on this matter.",
        apologetic: "I sincerely apologize for any inconvenience this may have caused."
      };
      
      setTimeout(() => {
        setEditableReply(rewrittenReplies[mode as keyof typeof rewrittenReplies] || results.professionalReply);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Rewrite failed:', err);
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editableReply || results?.professionalReply || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError('Please enter a message to analyze');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      const analysisResult: AnalysisResult = {
        ...data,
        originalMessage: message,
        sentimentScore: data.sentimentScore || (data.sentiment === 'Positive' ? 0.7 : data.sentiment === 'Negative' ? -0.7 : 0),
        toneBreakdown: data.toneBreakdown || { [data.tone]: 85, 'Neutral': 15 },
        emotions: data.emotions || { 'Calm': 60, 'Confident': 30, 'Happy': 10 },
        language: data.language || 'English',
        conflictTriggers: data.conflictTriggers || []
      };
      
      setResults(analysisResult);
      setEditableReply(analysisResult.professionalReply);
      saveToHistory(analysisResult);
      
      // Navigate to results page
      const encodedData = encodeURIComponent(JSON.stringify(analysisResult));
      window.location.href = `/results?data=${encodedData}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Sentiment Analyzer</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyze" className="space-y-6">
            {/* Input Section */}
            <Card className="p-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium">Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste your message, email, or feedback here…"
                  className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Ctrl+Enter to analyze</span>
                  <span>{message.length} characters</span>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
              
              <Button
                onClick={handleAnalyze}
                disabled={loading || !message.trim()}
                className="w-full mt-4"
              >
                {loading ? 'Analyzing...' : 'Analyze Message'}
              </Button>
            </Card>

            {/* Results - Remove this section since we navigate to results page */}
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Analysis History
              </h3>
              {history.length === 0 ? (
                <p className="text-gray-500">No analysis history yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => {
                           setMessage(item.originalMessage);
                           // Navigate to results with history item data
                           const encodedData = encodeURIComponent(JSON.stringify(item));
                           window.location.href = `/results?data=${encodedData}`;
                         }}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 truncate">
                            {item.originalMessage.substring(0, 60)}...
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.sentiment} {getSentimentEmoji(item.sentiment)}
                            </Badge>
                            <span className="text-xs text-gray-500">{item.language}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}