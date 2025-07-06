import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, MessageSquare, Activity, Shield, Users, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import NewsAnalysis from "@/components/NewsAnalysis";
import PriceAnalysis from "@/components/PriceAnalysis";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import LiveNewsFeed from "@/components/LiveNewsFeed";
import Portfolio from "@/components/Portfolio";

const Index = () => {
  const [activeSection, setActiveSection] = useState<string>("home");
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
      case "sentiment":
        return <SentimentAnalysis />;
      case "portfolio":
        return <Portfolio />;
      default:
        return <HomePage setActiveSection={setActiveSection} />;
    }
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
                  <li><button onClick={() => setActiveSection("sentiment")} className="text-muted-foreground hover:text-brand-primary transition-colors font-semibold text-base">Sentiment</button></li>
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

const HomePage = ({ setActiveSection }: { setActiveSection: (section: string) => void }) => {
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
              onClick={() => setActiveSection("sentiment")} 
              variant="outline"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-8 py-4 text-lg font-bold"
              size="lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Sentiment Analysis
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <LiveNewsFeed />
        </div>
      </section>

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
};

export default Index;


