
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SentimentItem {
  text: string;
  sentiment: string;
  score: number;
}

interface SentimentResult {
  stock_name: string;
  trend: string;
  reason: string;
  overall_score: number;
  results: SentimentItem[];
}

const SentimentAnalysis = () => {
  const [stockName, setStockName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeSentiment = async () => {
    if (!stockName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log(`Attempting sentiment analysis for: ${stockName}`);
      
      // Try the correct endpoint first
      const response = await fetch(`http://localhost:5000/api/sentiment/${stockName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed: ${response.status} - ${errorText}`);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received API data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Check if we received actual Reddit data
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        console.log('Using real Reddit API data');
        setResult(data);
        
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed social sentiment for ${stockName} using Reddit API`,
        });
      } else {
        throw new Error('No sentiment data available from Reddit API');
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to analyze sentiment. Please check if the backend server is running.';
      setError(errorMessage);
      
      toast({
        title: "Analysis Failed",
        description: errorMessage || 'Backend server unavailable',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'negative':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Social Media Sentiment Analysis</h1>
          
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-brand-accent flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Analyze Social Media Sentiment
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Analyze sentiment from Reddit for stock insights using real API data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter stock name (e.g., Tesla, Apple)"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  className="bg-background border-border text-foreground"
                  onKeyPress={(e) => e.key === 'Enter' && analyzeSentiment()}
                />
                <Button 
                  onClick={analyzeSentiment} 
                  disabled={loading}
                  className="bg-brand-accent hover:bg-brand-accent/90 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading && (
            <Card className="bg-card border-border mb-8">
              <CardContent className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin"></div>
                    <MessageSquare className="w-6 h-6 text-brand-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-muted-foreground">Scanning Reddit for real sentiment data...</p>
                  <p className="text-muted-foreground text-sm">Analyzing r/stocks, r/investing, and r/StockMarket</p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="bg-card border-border mb-8">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-400 text-lg font-semibold mb-2">Sentiment Analysis Failed</p>
                  <p className="text-muted-foreground">{error}</p>
                  <p className="text-muted-foreground text-sm mt-2">Please ensure the backend server is running and Reddit API is configured.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center justify-between">
                    {result.stock_name} Social Sentiment
                    <Badge className={`${result.trend === 'Bullish' ? 'bg-green-500/10 text-green-400 border-green-500/20' : result.trend === 'Bearish' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                      {result.trend}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Overall Trend</p>
                      <p className="text-2xl font-bold text-foreground">{result.trend}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Sentiment Score</p>
                      <p className={`text-2xl font-bold ${result.overall_score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {result.overall_score >= 0 ? '+' : ''}{result.overall_score.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Data Source</p>
                      <p className="text-lg font-semibold text-brand-primary">Reddit API</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm mb-2">Analysis Summary</p>
                    <p className="text-foreground">{result.reason}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Real Reddit Sentiment Data</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Latest posts and comments from Reddit stock communities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.results.map((item, index) => (
                      <div key={index} className="border-l-4 border-brand-accent/30 pl-4 py-3 bg-muted rounded-r-lg">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Reddit Post #{index + 1}</span>
                          <div className="flex items-center gap-2">
                            {getSentimentIcon(item.sentiment)}
                            <Badge className={getSentimentColor(item.sentiment)}>
                              {item.sentiment} ({item.score >= 0 ? '+' : ''}{item.score.toFixed(2)})
                            </Badge>
                          </div>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Sentiment Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <ThumbsUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-semibold">Positive</p>
                      <p className="text-2xl font-bold text-foreground">
                        {result.results.filter(r => r.sentiment === 'positive').length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <Minus className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-yellow-400 font-semibold">Neutral</p>
                      <p className="text-2xl font-bold text-foreground">
                        {result.results.filter(r => r.sentiment === 'neutral').length}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <ThumbsDown className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 font-semibold">Negative</p>
                      <p className="text-2xl font-bold text-foreground">
                        {result.results.filter(r => r.sentiment === 'negative').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
