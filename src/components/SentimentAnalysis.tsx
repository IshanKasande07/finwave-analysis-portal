
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
  const { toast } = useToast();

  const getMockData = (stockName: string): SentimentResult => {
    const mockPosts = [
      {
        text: `Just bought more ${stockName} shares. This company is solid and has great fundamentals. Long term hold for sure!`,
        sentiment: "positive",
        score: 0.85
      },
      {
        text: `${stockName} stock looking bearish today. Market volatility is affecting the price negatively.`,
        sentiment: "negative",
        score: 0.72
      },
      {
        text: `${stockName} announces new product launch. Innovation continues to drive growth and market expansion.`,
        sentiment: "positive",
        score: 0.91
      },
      {
        text: `Market uncertainty is affecting ${stockName}. Trading sideways for now, waiting for clear direction.`,
        sentiment: "neutral",
        score: 0.05
      },
      {
        text: `${stockName} partnerships with major companies announced. This could be a real game changer for the industry.`,
        sentiment: "positive",
        score: 0.88
      }
    ];

    const sentimentMapping = { "positive": 1, "neutral": 0, "negative": -1 };
    const totalScore = mockPosts.reduce((sum, item) => sum + sentimentMapping[item.sentiment as keyof typeof sentimentMapping] * item.score, 0);
    const avgScore = totalScore / mockPosts.length;
    
    const overallSentiment = avgScore > 0.3 ? "Bullish" : avgScore < -0.3 ? "Bearish" : "Neutral";
    
    return {
      stock_name: stockName,
      trend: overallSentiment,
      reason: overallSentiment === "Bullish" 
        ? "Positive sentiment observed across social media platforms, indicating market optimism and strong investor confidence."
        : overallSentiment === "Bearish" 
        ? "Negative sentiment detected in social discussions, reflecting market concerns and cautious investor sentiment."
        : "Mixed sentiment signals from social media analysis show a balanced outlook with neutral market sentiment.",
      overall_score: avgScore,
      results: mockPosts
    };
  };

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
    
    try {
      console.log(`Attempting to analyze sentiment for: ${stockName}`);
      
      const response = await fetch('http://localhost:5000/api/sentiment-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock_name: stockName }),
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        console.error(`API request failed with status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received API data:', data);
      
      if (data.error) {
        console.error('API returned error:', data.error);
        toast({
          title: "API Error",
          description: data.error,
          variant: "destructive",
        });
        // Fall back to mock data
        const mockData = getMockData(stockName);
        setResult(mockData);
        return;
      }

      // Check if we received actual Reddit data
      if (data.results && data.results.length > 0) {
        console.log('Using real Reddit API data');
        setResult(data);
        
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed social sentiment for ${stockName} using Reddit API`,
        });
      } else {
        console.log('No Reddit data received, using fallback');
        // If no results from Reddit API, use mock data but inform user
        const mockData = getMockData(stockName);
        setResult(mockData);
        
        toast({
          title: "Limited Data Available",
          description: "Reddit API returned no results, showing demo sentiment data",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      
      // Use mock data when API fails
      const mockData = getMockData(stockName);
      setResult(mockData);
      
      toast({
        title: "Using Demo Data",
        description: "Reddit API unavailable, showing demo sentiment data",
        variant: "default",
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
                Analyze sentiment from Reddit, Twitter, and other social platforms for stock insights
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
                  <p className="text-muted-foreground">Scanning social media platforms...</p>
                  <p className="text-muted-foreground text-sm">Analyzing Reddit, Twitter, and StockTwits</p>
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
                      <p className="text-muted-foreground text-sm mb-1">Data Sources</p>
                      <p className="text-lg font-semibold text-brand-primary">Reddit, Twitter, StockTwits</p>
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
                  <CardTitle className="text-foreground">Recent Social Media Sentiments</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Latest posts and comments from various social platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.results.map((item, index) => (
                      <div key={index} className="border-l-4 border-brand-accent/30 pl-4 py-3 bg-muted rounded-r-lg">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Post #{index + 1}</span>
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
