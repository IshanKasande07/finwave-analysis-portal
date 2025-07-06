
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, MessageSquare, Activity, Shield, Users, Moon, Sun, Search, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import NewsAnalysis from "@/components/NewsAnalysis";
import PriceAnalysis from "@/components/PriceAnalysis";
import LiveNewsFeed from "@/components/LiveNewsFeed";
import Portfolio from "@/components/Portfolio";

interface IndexData {
  symbol: string;
  current_value: number;
  change_percent: number;
  trend: number[];
}

interface MoverData {
  symbol: string;
  name: string;
  change_percent: number;
  current_value: number;
}

interface MarketMovers {
  gainers: MoverData[];
  losers: MoverData[];
}

const Index = () => {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [indices, setIndices] = useState<Record<string, IndexData>>({});
  const [marketMovers, setMarketMovers] = useState<MarketMovers>({ gainers: [], losers: [] });
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedMoverRegion, setSelectedMoverRegion] = useState<string>("USA");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingIndices, setLoadingIndices] = useState(true);
  const [loadingMovers, setLoadingMovers] = useState(true);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const fetchGlobalIndices = async (region: string = "All") => {
    setLoadingIndices(true);
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
      setLoadingIndices(false);
    }
  };

  const fetchMarketMovers = async (region: string = "USA") => {
    setLoadingMovers(true);
    try {
      const response = await fetch(`http://localhost:5000/api/market-movers?region=${region}`);
      if (!response.ok) throw new Error(`Failed to fetch market movers: ${response.status}`);
      const data = await response.json();
      setMarketMovers(data);
    } catch (error) {
      console.error("Error fetching market movers:", error);
      toast({
        title: "Error",
        description: "Failed to load market movers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingMovers(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Check if it's a stock symbol (contains ^ or is all caps) or company name
    if (searchQuery.includes("^") || searchQuery === searchQuery.toUpperCase()) {
      setActiveSection("price");
    } else {
      setActiveSection("news");
    }
  };

  const getSearchSuggestions = () => {
    const suggestions = ["TSLA", "MSFT", "AAPL", "GOOGL", "^GSPC", "^NSEI", "Tesla", "Microsoft", "Apple"];
    return suggestions.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  };

  const renderSparkline = (trend: number[]) => {
    if (!trend.length) return null;
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    
    return (
      <div className="flex items-end h-8 w-16 gap-0.5">
        {trend.map((value, index) => (
          <div
            key={index}
            className="bg-brand-accent/60 w-2 min-h-[2px]"
            style={{ height: `${((value - min) / range) * 100}%` }}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchGlobalIndices(selectedRegion);
  }, [selectedRegion]);

  useEffect(() => {
    fetchMarketMovers(selectedMoverRegion);
  }, [selectedMoverRegion]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "news":
        return <NewsAnalysis />;
      case "price":
        return <PriceAnalysis />;
      case "portfolio":
        return <Portfolio />;
      default:
        return <HomePage />;
    }
  };

  const HomePage = () => (
    <>
      {/* Hero Section with Search */}
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
          
          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stocks (TSLA, MSFT) or companies (Tesla, Microsoft)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-brand-primary/30 rounded-xl bg-card focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              {searchQuery && getSearchSuggestions().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10">
                  {getSearchSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSearchQuery(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-accent text-foreground first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

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
              onClick={() => setActiveSection("portfolio")} 
              variant="outline"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-8 py-4 text-lg font-bold"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Portfolio Management
            </Button>
          </div>
        </div>
      </section>

      {/* Global Market Indices Dashboard */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-black text-foreground">Global Market Indices</h2>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="All">All Regions</option>
              <option value="USA">USA</option>
              <option value="Europe/UK">Europe/UK</option>
              <option value="India">India</option>
              <option value="World">World</option>
            </select>
          </div>
          
          {loadingIndices ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(indices).map(([name, data]) => (
                <Card key={name} className="border-border hover:shadow-lg transition-shadow bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-foreground flex justify-between items-center">
                      {name}
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
                        <p className="text-sm text-muted-foreground">{data.symbol}</p>
                      </div>
                      {renderSparkline(data.trend)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Market Movers Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-black text-foreground">Market Movers</h2>
            <select
              value={selectedMoverRegion}
              onChange={(e) => setSelectedMoverRegion(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="USA">USA</option>
              <option value="INDIA">India</option>
              <option value="EUROPE">Europe</option>
            </select>
          </div>
          
          {loadingMovers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Top Gainers */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center">
                    <ArrowUp className="w-5 h-5 mr-2" />
                    Top Gainers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketMovers.gainers.map((stock, index) => (
                      <div key={stock.symbol} className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div>
                          <p className="font-semibold text-foreground">{stock.symbol}</p>
                          <p className="text-sm text-muted-foreground">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">${stock.current_value?.toFixed(2)}</p>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                            +{stock.change_percent?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Losers */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <ArrowDown className="w-5 h-5 mr-2" />
                    Top Losers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketMovers.losers.map((stock, index) => (
                      <div key={stock.symbol} className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <div>
                          <p className="font-semibold text-foreground">{stock.symbol}</p>
                          <p className="text-sm text-muted-foreground">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">${stock.current_value?.toFixed(2)}</p>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                            {stock.change_percent?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Live News Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-black text-foreground">Latest Financial News</h2>
            <Button 
              onClick={() => setActiveSection("news")} 
              variant="outline"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
            >
              View More News
            </Button>
          </div>
          <LiveNewsFeed />
        </div>
      </section>

      {/* Features Section */}
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
                  Portfolio Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed font-medium"><span className="font-bold text-foreground">AI-driven portfolio optimization</span> tools tailored for professional investment strategies.</p>
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

      {/* CTA Section */}
      <section className="py-20 bg-brand-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-black text-white mb-6">Portfolio Analytics Suite</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
            Comprehensive <span className="font-bold text-white">AI-powered tools</span> for professional portfolio management and market analysis.
          </p>
          <Button 
            onClick={() => setActiveSection("portfolio")} 
            className="bg-brand-accent hover:bg-brand-accent/90 text-white px-10 py-4 text-lg font-bold"
            size="lg"
          >
            Access Portfolio Tools
          </Button>
        </div>
      </section>
    </>
  );

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
                  <li><button onClick={() => setActiveSection("portfolio")} className="text-muted-foreground hover:text-brand-primary transition-colors font-semibold text-base">Portfolio</button></li>
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
        {renderActiveSection()}
      </main>

      <footer className="bg-muted border-t border-border mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center text-muted-foreground">
            <p className="font-bold text-lg">&copy; 2025 StockInsight Pro. All rights reserved.</p>
            <p className="mt-2 text-base font-medium">Advanced AI-powered stock analysis platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
