import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, MessageSquare, Activity, Shield, Users, Moon, Sun, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import NewsAnalysis from "@/components/NewsAnalysis";
import PriceAnalysis from "@/components/PriceAnalysis";
import LiveNewsFeed from "@/components/LiveNewsFeed";
import StockInvesting from "@/components/StockInvesting";

interface IndexData {
  symbol: string;
  current_value: number;
  change_percent: number;
  trend: number[];
}

// Map index symbols to readable names
const INDEX_NAME_MAP: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^DJI": "Dow Jones",
  "^IXIC": "NASDAQ Composite",
  "^FTSE": "FTSE 100",
  "^NSEI": "Nifty 50",
  "^BSESN": "Sensex",
  "^GDAXI": "DAX",
  "^FCHI": "CAC 40",
  "^N225": "Nikkei 225",
  "^HSI": "Hang Seng",
  "^STI": "Straits Times"
};

const GlobalIndices = ({ region, onRegionChange }: { region: string; onRegionChange: (region: string) => void }) => {
  const [indices, setIndices] = useState<Record<string, IndexData>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGlobalIndices = async (region: string = "All") => {
    console.log("Fetching Global Indices for region:", region);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/global-indices?region=${region.toLowerCase()}`);
      if (!response.ok) throw new Error(`Failed to fetch indices: ${response.status}`);
      const data = await response.json();
      setIndices(data);
    } catch (error) {
      console.error("Error fetching global indices:", error);
      toast({
        title: "Error",
        description: "Failed to load market indices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLineGraph = (trend: number[]) => {
    if (!trend.length) return null;
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    const width = 60;
    const height = 20;
    const step = width / (trend.length - 1);

    const points = trend.map((value, index) => ({
      x: index * step,
      y: height - ((value - min) / range) * height,
    }));

    return (
      <svg width={width} height={height} className="ml-2">
        <polyline
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="1.5"
          points={points.map(p => `${p.x},${p.y}`).join(" ")}
        />
      </svg>
    );
  };

  useEffect(() => {
    fetchGlobalIndices(region);
  }, [region]);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black text-foreground">Global Market Indices</h2>
          <select
            value={region}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Store scroll position before update
              const scrollY = window.scrollY;

              onRegionChange(e.target.value);
              console.log("Region changed to:", e.target.value);

              // Restore scroll after a tick (after re-render)
              setTimeout(() => {
                window.scrollTo(0, scrollY);
              }, 0);
            }}
            className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="All">All Regions</option>
            <option value="USA">USA</option>
            <option value="Europe/UK">Europe/UK</option>
            <option value="India">India</option>
          </select>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(indices).map(([symbol, data]) => (
              <Card key={symbol} className="border-border hover:shadow-lg transition-shadow bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-foreground flex justify-between items-center">
                    {INDEX_NAME_MAP[symbol] || symbol}
                    <span className={`text-sm px-2 py-1 rounded ${
                      data.change_percent > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {data.change_percent > 0 ? <ArrowUp className="w-3 h-3 inline mr-1" /> : <ArrowDown className="w-3 h-3 inline mr-1" />}
                      {data.change_percent?.toFixed(2)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {data.current_value?.toFixed(2) || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">{symbol}</p>
                    </div>
                    {renderLineGraph(data.trend)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const LiveNewsFeedSection = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNews = async () => {
    console.log("Fetching Live News");
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/news`);
      if (!response.ok) throw new Error(`Failed to fetch news: ${response.status}`);
      const data = await response.json();
      setNews(data.news || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast({
        title: "Error",
        description: "Failed to load news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(); // Fetch news only on mount
    // Removed setInterval to prevent periodic reloads
  }, []); // Empty dependency array ensures it runs only once on mount

  return (
    <section className="py-16 bg-background" key="live-news-feed">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black text-foreground">Latest Financial News</h2>
          <Button 
            onClick={() => {}} 
            variant="outline"
            className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
          >
            View More News
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <LiveNewsFeed news={news} />
        )}
      </div>
    </section>
  );
};

const Index = () => {
  console.log("Index component re-rendered");
  const [activeSection, setActiveSection] = useState<string>("home");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "news":
        return <NewsAnalysis />;
      case "price":
        return <PriceAnalysis />;
      case "ai-investing":
        return <StockInvesting />; // Points to the updated StockInvesting component
      default:
        return <HomePage />;
    }
  };

  const HomePage = () => {
    console.log("HomePage component re-rendered");
    return (
      <>
        <section className="pt-20 pb-16 bg-gradient-to-b from-brand-secondary/20 to-background">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-6xl font-black text-foreground mb-6 leading-tight">
              Professional Stock Analysis
              <br />
              <span className="text-brand-primary font-extrabold">Powered by AI</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Comprehensive market intelligence platform providing <span className="font-bold text-foreground">advanced sentiment analysis</span>, 
              <span className="font-bold text-foreground"> price predictions</span>, and <span className="font-bold text-foreground">real-time market insights</span> for professional traders and investors.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => setActiveSection("news")} 
                className="bg-brand-accent hover:bg-brand-accent/90 text-white px-8 py-4 text-lg font-bold"
                size="lg"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                News Analysis
              </Button>
              <Button 
                onClick={() => setActiveSection("price")} 
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 text-lg font-bold"
                size="lg"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Price Analysis
              </Button>
              <Button 
                onClick={() => setActiveSection("ai-investing")} 
                variant="outline"
                className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-8 py-4 text-lg font-bold"
                size="lg"
              >
                <Users className="w-5 h-5 mr-2" />
                AI-Powered Stock Investing
              </Button>
            </div>
          </div>
        </section>

        <GlobalIndices region={selectedRegion} onRegionChange={setSelectedRegion} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">StockInsight Pro</h1>
            </div>
            <div className="flex items-center space-x-8">
              <nav>
                <ul className="flex space-x-8">
                  <li><button onClick={() => setActiveSection("home")} className="text-muted-foreground hover:text-brand-primary transition-colors font-semibold text-base">Home</button></li>
                  <li><button onClick={() => setActiveSection("news")} className="text-muted-foreground hover:text-brand-primary transition-colors font-semibold text-base">News</button></li>
                  <li><button onClick={() => setActiveSection("price")} className="text-muted-foreground hover:text-brand-primary transition-colors font-semibold text-base">Price</button></li>
                  <li><button onClick={() => setActiveSection("ai-investing")} className="text-muted-foreground hover:text-brand-primary transition-colors font-semibold text-base">AI-Powered Stock Investing</button></li>
                </ul>
              </nav>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="border-border hover:bg-accent"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {activeSection === "home" ? (
          <>
            <HomePage />
            <LiveNewsFeedSection />
            <section className="py-20 bg-muted">
              <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-5xl font-black text-foreground mb-4">Platform Features</h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                    <span className="font-bold text-foreground">Enterprise-grade tools</span> designed for professional market analysis and decision making
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Card className="border-border hover:shadow-lg transition-shadow bg-card">
                    <CardHeader>
                      <CardTitle className="text-brand-primary flex items-center text-xl font-bold">
                        <Activity className="w-6 h-6 mr-3" />
                        Real-Time Market Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed font-medium">Live financial news and market updates with <span className="font-bold text-foreground">AI-powered analysis</span> and sentiment scoring.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border hover:shadow-lg transition-shadow bg-card">
                    <CardHeader>
                      <CardTitle className="text-brand-primary flex items-center text-xl font-bold">
                        <MessageSquare className="w-6 h-6 mr-3" />
                        AI Sentiment Engine
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed font-medium">Advanced <span className="font-bold text-foreground">natural language processing</span> for comprehensive sentiment analysis of market news.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border hover:shadow-lg transition-shadow bg-card">
                    <CardHeader>
                      <CardTitle className="text-brand-primary flex items-center text-xl font-bold">
                        <BarChart3 className="w-6 h-6 mr-3" />
                        Technical Indicators
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed font-medium"><span className="font-bold text-foreground">Professional-grade metrics</span> including SMA, RSI, and MACD for informed trading decisions.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border hover:shadow-lg transition-shadow bg-card">
                    <CardHeader>
                      <CardTitle className="text-brand-primary flex items-center text-xl font-bold">
                        <TrendingUp className="w-6 h-6 mr-3" />
                        AI-Powered Investing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed font-medium"><span className="font-bold text-foreground">AI-driven investment signals</span> with stop loss, target, and buy/sell recommendations.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border hover:shadow-lg transition-shadow bg-card">
                    <CardHeader>
                      <CardTitle className="text-brand-primary flex items-center text-xl font-bold">
                        <Users className="w-6 h-6 mr-3" />
                        Professional Interface
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed font-medium">Clean, <span className="font-bold text-foreground">intuitive design</span> optimized for professional workflows and rapid analysis.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border hover:shadow-lg transition-shadow bg-card">
                    <CardHeader>
                      <CardTitle className="text-brand-primary flex items-center text-xl font-bold">
                        <Shield className="w-6 h-6 mr-3" />
                        Enterprise Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed font-medium"><span className="font-bold text-foreground">Bank-grade security protocols</span> ensuring complete protection of sensitive financial data.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </>
        ) : (
          renderActiveSection()
        )}
      </main>

      <footer className="bg-muted border-t border-border mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center text-muted-foreground">
            <p className="font-bold text-lg">© 2025 StockInsight Pro. All rights reserved.</p>
            <p className="mt-2 text-base font-medium">Advanced AI-powered stock analysis platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;