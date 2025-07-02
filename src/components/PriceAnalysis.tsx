
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PredictionResult {
  stock: string;
  current_price: number | string;
  percentage_change: number | string;
  trend: string;
  reason: string;
  candle_pattern: string;
  color: string;
}

const PriceAnalysis = () => {
  const [stockSymbol, setStockSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [timeframe, setTimeframe] = useState("D");
  const [chartType, setChartType] = useState("candlestick");
  const { toast } = useToast();

  const safeToFixed = (value: number | string | undefined, decimals: number = 2): string => {
    if (value === undefined || value === null) return "N/A";
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? "N/A" : num.toFixed(decimals);
  };

  const safeNumber = (value: number | string | undefined): number => {
    if (value === undefined || value === null) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const getMockData = (stockSymbol: string): PredictionResult => {
    const currentPrice = Math.random() * 1000 + 50;
    const percentageChange = (Math.random() - 0.5) * 10;
    const trend = percentageChange > 1 ? "Bullish" : percentageChange < -1 ? "Bearish" : "Neutral";
    
    return {
      stock: stockSymbol.toUpperCase(),
      current_price: currentPrice,
      percentage_change: percentageChange,
      trend: trend,
      reason: trend === "Bullish" 
        ? "Strong uptrend due to recent buying pressure and positive market sentiment."
        : trend === "Bearish" 
        ? "Downtrend observed, possibly due to market corrections and selling pressure."
        : "Market is consolidating, waiting for direction with balanced buying and selling.",
      candle_pattern: percentageChange > 0 ? "Bullish Engulfing" : percentageChange < 0 ? "Bearish Harami" : "Doji",
      color: percentageChange >= 0 ? "positive" : "negative"
    };
  };

  const predictStock = async () => {
    if (!stockSymbol.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock symbol",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/price-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock_symbol: stockSymbol }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Process the data to ensure numeric values
      const processedData = {
        ...data,
        current_price: safeNumber(data.current_price),
        percentage_change: safeNumber(data.percentage_change)
      };

      setResult(processedData);
      
      toast({
        title: "Prediction Complete",
        description: `Successfully analyzed ${stockSymbol.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error analyzing stock:', error);
      
      // Use mock data when API fails
      const mockData = getMockData(stockSymbol);
      setResult(mockData);
      
      toast({
        title: "Using Demo Data",
        description: "Backend unavailable, showing demo prediction data",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Stock Price Predictor</h1>
          
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-brand-accent flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Stock Price Analysis & Prediction
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter a stock symbol to get AI-powered price predictions and technical analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
                    value={stockSymbol}
                    onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                    className="bg-background border-border text-foreground"
                    onKeyPress={(e) => e.key === 'Enter' && predictStock()}
                  />
                </div>
                <Button 
                  onClick={predictStock} 
                  disabled={loading}
                  className="bg-brand-accent hover:bg-brand-accent/90 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Predict
                </Button>
              </div>
            </CardContent>
          </Card>

          {loading && (
            <Card className="bg-card border-border mb-8">
              <CardContent className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-brand-primary rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-muted-foreground">Analyzing market data and generating predictions...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center justify-between">
                    {result.stock} Prediction
                    <Badge className={`${result.trend === 'Bullish' ? 'bg-green-500/10 text-green-400 border-green-500/20' : result.trend === 'Bearish' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                      {result.trend}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                      <p className="text-3xl font-bold text-foreground">${safeToFixed(result.current_price)}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Change</p>
                      <div className="flex items-center justify-center">
                        {safeNumber(result.percentage_change) >= 0 ? 
                          <TrendingUp className="w-5 h-5 text-green-400 mr-1" /> : 
                          <TrendingDown className="w-5 h-5 text-red-400 mr-1" />
                        }
                        <p className={`text-2xl font-bold ${safeNumber(result.percentage_change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {safeNumber(result.percentage_change) >= 0 ? '+' : ''}{safeToFixed(result.percentage_change)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Trend</p>
                      <p className="text-xl font-semibold text-foreground">{result.trend}</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Pattern</p>
                      <p className="text-xl font-semibold text-brand-primary">{result.candle_pattern}</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm mb-2">Analysis Reason</p>
                    <p className="text-foreground">{result.reason}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Live TradingView Chart</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Interactive chart with real-time data and technical indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-32 bg-background border-border">
                        <SelectValue placeholder="Timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1m</SelectItem>
                        <SelectItem value="5">5m</SelectItem>
                        <SelectItem value="15">15m</SelectItem>
                        <SelectItem value="60">1h</SelectItem>
                        <SelectItem value="D">1D</SelectItem>
                        <SelectItem value="W">1W</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={chartType} onValueChange={setChartType}>
                      <SelectTrigger className="w-40 bg-background border-border">
                        <SelectValue placeholder="Chart Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candlestick">Candlestick</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
                    <iframe
                      src={`https://s.tradingview.com/widgetembed/?symbol=${result.stock}&interval=${timeframe}&theme=dark&style=${chartType === 'candlestick' ? '1' : chartType === 'line' ? '2' : '3'}&toolbarbg=2B2B2B&timezone=exchange&withdateranges=1`}
                      className="w-full h-full rounded-lg"
                      frameBorder="0"
                      scrolling="no"
                    />
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

export default PriceAnalysis;
