
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  summary: string;
  sentiment: string;
  score: number;
}

interface HistoricalData {
  current_price?: number;
  change_percent?: number;
  percent_growth?: number;
  volatility?: number;
  highest_price?: number;
  lowest_price?: number;
  initial_price?: number;
}

interface AnalysisResult {
  stock_name: string;
  stock_symbol: string;
  current_price: number | string;
  change_percent: number | string;
  trend: string;
  reason: string;
  news_summaries: NewsItem[];
  historical_data: HistoricalData;
}

const NewsAnalysis = () => {
  const [stockName, setStockName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const safeToFixed = (value: number | string | undefined, decimals: number = 2): string => {
    if (value === undefined || value === null) return "0.00";
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? "0.00" : num.toFixed(decimals);
  };

  const safeNumber = (value: number | string | undefined): number => {
    if (value === undefined || value === null) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const analyzeStock = async () => {
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
      console.log(`Attempting news analysis for: ${stockName}`);
      
      const response = await fetch('http://localhost:5000/api/news-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock_name: stockName }),
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

      // Ensure all numeric values are properly handled
      const processedData = {
        ...data,
        current_price: safeNumber(data.current_price),
        change_percent: safeNumber(data.change_percent),
        historical_data: data.historical_data ? {
          ...data.historical_data,
          current_price: safeNumber(data.historical_data.current_price),
          change_percent: safeNumber(data.historical_data.change_percent),
          percent_growth: safeNumber(data.historical_data.percent_growth),
          volatility: safeNumber(data.historical_data.volatility),
          highest_price: safeNumber(data.historical_data.highest_price),
          lowest_price: safeNumber(data.historical_data.lowest_price),
          initial_price: safeNumber(data.historical_data.initial_price)
        } : {}
      };
      
      setResult(processedData);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${stockName}`,
      });
    } catch (error: any) {
      console.error('Error analyzing stock:', error);
      setError(error.message || 'Failed to analyze stock. Please check if the backend server is running.');
      
      toast({
        title: "Analysis Failed",
        description: error.message || 'Backend server unavailable',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
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
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Stock News Analysis</h1>
          
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-brand-primary">Analyze Stock News Sentiment</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter a stock name to analyze recent news sentiment and market trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter stock name (e.g., Tesla, Apple)"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  className="bg-background border-border text-foreground"
                  onKeyPress={(e) => e.key === 'Enter' && analyzeStock()}
                />
                <Button 
                  onClick={analyzeStock} 
                  disabled={loading}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white"
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
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary mr-3" />
                <p className="text-muted-foreground">Analyzing news sentiment...</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="bg-card border-border mb-8">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-400 text-lg font-semibold mb-2">Analysis Failed</p>
                  <p className="text-muted-foreground">{error}</p>
                  <p className="text-muted-foreground text-sm mt-2">Please ensure the backend server is running and try again.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center justify-between">
                    {result.stock_symbol}
                    <Badge className={`${result.trend === 'Bullish' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {result.trend}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Current Price</p>
                      <p className="text-2xl font-bold text-foreground">${safeToFixed(result.current_price)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Change</p>
                      <p className={`text-2xl font-bold ${safeNumber(result.change_percent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {safeNumber(result.change_percent) >= 0 ? '+' : ''}{safeToFixed(result.change_percent)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Trend</p>
                      <p className="text-xl font-semibold text-foreground">{result.trend}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Volatility</p>
                      <p className="text-xl font-semibold text-foreground">
                        {safeToFixed(result.historical_data?.volatility)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-muted-foreground text-sm">Analysis Reason</p>
                    <p className="text-foreground">{result.reason}</p>
                  </div>
                </CardContent>
              </Card>

              {result.news_summaries && result.news_summaries.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Recent News Summaries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.news_summaries.map((news, index) => (
                        <div key={index} className="border-l-4 border-brand-primary/30 pl-4 py-2">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-foreground font-medium">{news.title}</h4>
                            <div className="flex items-center gap-2 ml-4">
                              {getSentimentIcon(news.sentiment)}
                              <Badge className={getSentimentColor(news.sentiment)}>
                                {news.sentiment} ({safeToFixed(news.score)})
                              </Badge>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm">{news.summary}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.historical_data && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">5-Year Historical Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">Initial Price (5 years ago)</p>
                        <p className="text-xl font-semibold text-foreground">
                          ${safeToFixed(result.historical_data.initial_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Percent Growth</p>
                        <p className="text-xl font-semibold text-green-400">
                          {safeToFixed(result.historical_data.percent_growth)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Highest Price</p>
                        <p className="text-xl font-semibold text-foreground">
                          ${safeToFixed(result.historical_data.highest_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Lowest Price</p>
                        <p className="text-xl font-semibold text-foreground">
                          ${safeToFixed(result.historical_data.lowest_price)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsAnalysis;
