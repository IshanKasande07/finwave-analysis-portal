import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as Slider from "@radix-ui/react-slider";

interface AnalysisData {
  ticker: string;
  signal: "Buy" | "Sell" | "Hold";
  entry_price: number;
  stop_loss: number | null;
  target_price: number | null;
  atr: number;
  timestamp: string;
}

const StockInvesting = () => {
  const [symbol, setSymbol] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [riskRewardRatio, setRiskRewardRatio] = useState(2.5); // Default 1:2.5
  const { toast } = useToast();

  const fetchAnalysis = async () => {
    if (!symbol.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock symbol",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/technical-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_symbol: symbol, risk_reward_ratio: riskRewardRatio }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${symbol}`,
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to analyze stock.";
      if (error instanceof Error) {
        errorMessage = error.message.includes("Invalid stock symbol")
          ? `${error.message} Ensure the symbol is correct (e.g., TSLA, AAPL).`
          : error.message;
      }
      setAnalysis(null);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !loading) {
      fetchAnalysis();
    }
  };

  // Inject TradingView Screener script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: 600,
      defaultColumn: "overview",
      screener_type: "stock",
      displayCurrency: "USD",
      colorTheme: "light", // Changed to light mode
      locale: "en",
    });

    const container = document.getElementById("tradingview-screener-container");
    if (container) {
      container.innerHTML = ""; // clear existing widget
      container.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">
            AI-Powered Stock Investing
          </h1>

          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-brand-accent flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Analyze Stock Investment
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Get AI-driven investment signals using technical analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Enter stock symbol (e.g., TSLA, AAPL)"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="bg-background border-border text-foreground"
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <Button
                  onClick={fetchAnalysis}
                  disabled={loading}
                  className="bg-brand-accent hover:bg-brand-accent/90 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Analyze"}
                </Button>
              </div>
              <div className="mt-4">
                <label htmlFor="risk-reward" className="block text-foreground mb-2">
                  Risk:Reward Ratio (1:{riskRewardRatio.toFixed(1)}):{" "}
                  <span className="text-sm text-muted-foreground">(Min: 1:1.5, Max: 1:5)</span>
                </label>
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-5"
                  value={[riskRewardRatio]}
                  onValueChange={(values) => setRiskRewardRatio(values[0])}
                  min={1.5}
                  max={5}
                  step={0.1}
                  aria-label="Risk:Reward Ratio"
                >
                  <Slider.Track className="bg-muted relative flex-1 rounded-full h-2">
                    <Slider.Range className="absolute bg-brand-accent rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-5 h-5 bg-brand-accent rounded-full focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-colors"
                    style={{
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  />
                </Slider.Root>
              </div>
            </CardContent>
          </Card>

          {loading && (
            <Card className="bg-card border-border mb-8">
              <CardContent className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-brand-primary rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <p className="text-muted-foreground">Analyzing market data and generating signals...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {analysis === null && !loading && (
            <Card className="bg-card border-border mb-8">
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-muted-foreground text-lg">Enter a stock symbol to start analysis.</p>
              </CardContent>
            </Card>
          )}

          {analysis && (
            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle className="text-foreground">{analysis.ticker} Investment Analysis</CardTitle>
                <CardDescription className="text-muted-foreground">AI-driven signals based on technical indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm mb-1">Entry Price</p>
                    <p className="text-2xl font-bold text-foreground">${analysis.entry_price.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm mb-1">ATR</p>
                    <p className="text-2xl font-bold text-foreground">{analysis.atr.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm mb-1">Stop Loss</p>
                    <p className="text-2xl font-bold text-foreground">${analysis.stop_loss?.toFixed(2) || "N/A"}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm mb-1">Target Price</p>
                    <p className="text-2xl font-bold text-foreground">${analysis.target_price?.toFixed(2) || "N/A"}</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg col-span-2 lg:col-span-1">
                    <p className="text-muted-foreground text-sm mb-1">Signal</p>
                    <p className={`text-2xl font-bold ${analysis.signal === "Buy" ? "text-green-400" : analysis.signal === "Sell" ? "text-red-400" : "text-yellow-400"}`}>
                      {analysis.signal}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg col-span-2 lg:col-span-1">
                    <p className="text-muted-foreground text-sm mb-1">Timestamp</p>
                    <p className="text-2xl font-bold text-foreground">{analysis.timestamp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TradingView Screener Widget */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
              Explore Stock Screener
            </h2>
            <div id="tradingview-screener-container" className="rounded-lg overflow-hidden border border-border shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInvesting;
