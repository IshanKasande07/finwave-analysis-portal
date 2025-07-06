import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  description: string;
  url: string;
}

const LiveNewsFeed = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/news", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch news: ${response.status} - ${errorText}`);
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      console.log("Received news data:", data);
      if (data.error) throw new Error(data.error);
      setNews(data.news || []);
    } catch (error: unknown) {
      console.error("Error fetching news:", error);
      let errorMessage = "Failed to load financial news feed.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 1800000); // 30 minutes (within 100 requests/day limit)
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-brand-accent flex items-center">
          <Newspaper className="w-5 h-5 mr-2" />
          Global Financial News
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Latest updates from financial markets
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          </div>
        )}
        {error && (
          <p className="text-red-400 text-center py-4">{error}</p>
        )}
        {!loading && !error && news.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No news available.</p>
        )}
        {!loading && !error && news.length > 0 && (
          <div className="space-y-4">
            {news.map((item, index) => (
              <div key={index} className="border-l-4 border-brand-accent/30 pl-4 py-2 bg-muted rounded-r-lg">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">
                  <p className="font-semibold">{item.title}</p>
                </a>
                <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveNewsFeed;

