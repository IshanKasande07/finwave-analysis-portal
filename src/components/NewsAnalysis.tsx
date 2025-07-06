import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  description: string;
  url: string;
}

interface AnalysisResult {
  stock_name: string;
  current_price: number | null;
  change_percent: number | null;
  volatility: number | null;
  news: NewsItem[];
  timestamp: string | null;
}

const NewsAnalysis = () => {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const safeToFixed = (num: number | null, digits = 2) => 
    num !== null ? num.toFixed(digits) : "N/A";

  const analyzeNews = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Attempting news analysis for: ${companyName}`);
      const response = await fetch("http://localhost:5000/api/news-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed: ${response.status} - ${errorText}`);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received API data:", data);
      if (data.error) throw new Error(data.error);
      setResult(data);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed news for ${companyName}`,
      });
    } catch (error: any) {
      console.error("Error analyzing news:", error);
      setError(error.message || "Failed to analyze news. Please check if the backend server is running or try again later.");
      toast({
        title: "Analysis Failed",
        description: error.message || "Backend server unavailable",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Stock News Analysis</h1>
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-brand-accent flex items-center">
                <Newspaper className="w-5 h-5 mr-2" />
                Analyze Stock News
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Get the latest news and price insights for a stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter company name (e.g., Tesla, Apple)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-background border-border text-foreground"
                  onKeyPress={(e) => e.key === "Enter" && analyzeNews()}
                />
                <Button
                  onClick={analyzeNews}
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
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-brand-accent mb-4" />
                  <p className="text-muted-foreground">Fetching news and price data...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="bg-card border-border mb-8">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-400 text-lg font-semibold mb-2">Analysis Failed</p>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">{result.stock_name} Stock Overview</CardTitle>
                  <CardDescription className="text-muted-foreground">Based on the latest data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                      <p className="text-2xl font-bold text-foreground">
                        {result.current_price === null ? "N/A" : `$${safeToFixed(result.current_price)}`}
                      </p>
                      {result.timestamp && (
                        <p className="text-muted-foreground text-xs mt-1">As of {result.timestamp} (delayed)</p>
                      )}
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Change</p>
                      <p className={`text-2xl font-bold ${result.change_percent !== null && result.change_percent >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {result.change_percent === null ? "N/A" : `${result.change_percent >= 0 ? "+" : ""}${safeToFixed(result.change_percent)}%`}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted-foreground rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Volatility (5Y)</p>
                      <p className="text-2xl font-bold text-foreground">
                        {result.volatility === null ? "N/A" : `${safeToFixed(result.volatility)}%`}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mt-4">* Prices are based on delayed data from yfinance and may not reflect real-time values shown in the chart.</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Latest News</CardTitle>
                  <CardDescription className="text-muted-foreground">Top 5 news articles from NewsAPI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.news.map((item, index) => (
                      <div key={index} className="border-l-4 border-brand-accent/30 pl-4 py-3 bg-muted rounded-r-lg">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">
                          <p className="font-semibold">{item.title}</p>
                        </a>
                        <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                      </div>
                    ))}
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

export default NewsAnalysis;


