
// import { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Clock, ExternalLink, TrendingUp, Newspaper } from "lucide-react";

// interface NewsItem {
//   title: string;
//   description: string;
//   publishedAt: string;
//   url: string;
//   source: string;
//   sentiment: "positive" | "negative" | "neutral";
// }

// const LiveNewsFeed = () => {
//   const [news, setNews] = useState<NewsItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   const getMockNews = (): NewsItem[] => {
//     return [
//       {
//         title: "Stock Market Reaches New Heights Amid Economic Recovery",
//         description: "Major indices continue to climb as investor confidence grows following positive economic indicators and strong corporate earnings reports.",
//         publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
//         url: "#",
//         source: "Financial News Daily",
//         sentiment: "positive"
//       },
//       {
//         title: "Tech Stocks Lead Market Rally with Innovation Focus",
//         description: "Technology companies see significant gains as investors bet on continued digital transformation and AI advancement across industries.",
//         publishedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
//         url: "#",
//         source: "Tech Market Watch",
//         sentiment: "positive"
//       },
//       {
//         title: "Federal Reserve Maintains Current Interest Rate Policy",
//         description: "The central bank holds rates steady while monitoring inflation trends and economic growth indicators for future policy decisions.",
//         publishedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
//         url: "#",
//         source: "Economic Times",
//         sentiment: "neutral"
//       },
//       {
//         title: "Energy Sector Faces Volatility Amid Global Tensions",
//         description: "Oil and gas stocks experience mixed trading as geopolitical concerns compete with strong demand fundamentals.",
//         publishedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
//         url: "#",
//         source: "Energy Market Report",
//         sentiment: "negative"
//       },
//       {
//         title: "Cryptocurrency Market Shows Signs of Stabilization",
//         description: "Digital assets maintain steady trading ranges as institutional adoption continues to grow despite regulatory uncertainties.",
//         publishedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
//         url: "#",
//         source: "Crypto News Network",
//         sentiment: "neutral"
//       }
//     ];
//   };

//   useEffect(() => {
//     const fetchNews = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/news/live');
//         if (response.ok) {
//           const data = await response.json();
//           setNews(data.articles || []);
//         } else {
//           console.error('Failed to fetch news:', response.status);
//           setNews(getMockNews());
//         }
//       } catch (error) {
//         console.error('Error fetching news:', error);
//         setNews(getMockNews());
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNews();
    
//     const interval = setInterval(fetchNews, 600000);
    
//     return () => clearInterval(interval);
//   }, []);

//   const getSentimentColor = (sentiment: string) => {
//     switch (sentiment) {
//       case 'positive':
//         return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
//       case 'negative':
//         return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
//       default:
//         return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
//     }
//   };

//   const getTimeAgo = (dateString: string) => {
//     const now = new Date();
//     const publishedDate = new Date(dateString);
//     const diffInMinutes = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60));
    
//     if (diffInMinutes < 60) {
//       return `${diffInMinutes}m ago`;
//     } else if (diffInMinutes < 1440) {
//       return `${Math.floor(diffInMinutes / 60)}h ago`;
//     } else {
//       return `${Math.floor(diffInMinutes / 1440)}d ago`;
//     }
//   };

//   return (
//     <Card className="border-border bg-card">
//       <CardHeader className="border-b border-border">
//         <CardTitle className="text-foreground flex items-center text-3xl font-black">
//           <Newspaper className="w-7 h-7 mr-3 text-brand-primary" />
//           Live Market News Feed
//           <div className="ml-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//         </CardTitle>
//         <CardDescription className="text-muted-foreground text-lg font-medium">
//           Real-time financial news with <span className="font-bold text-foreground">AI-powered sentiment analysis</span>
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="p-6">
//         {loading ? (
//           <div className="space-y-6">
//             {[1, 2, 3].map((i) => (
//               <div key={i} className="animate-pulse">
//                 <div className="h-5 bg-muted rounded w-3/4 mb-3"></div>
//                 <div className="h-4 bg-muted rounded w-full mb-2"></div>
//                 <div className="h-4 bg-muted rounded w-1/4"></div>
//               </div>
//             ))}
//           </div>
//         ) : news.length > 0 ? (
//           <div className="space-y-6 max-h-96 overflow-y-auto">
//             {news.map((item, index) => (
//               <div 
//                 key={index} 
//                 className="p-5 bg-muted rounded-lg border-l-4 border-brand-primary hover:bg-muted/80 transition-colors cursor-pointer"
//                 onClick={() => item.url !== "#" && window.open(item.url, '_blank')}
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   <h4 className="text-foreground font-bold text-lg leading-tight pr-4">
//                     {item.title}
//                   </h4>
//                   <div className="flex items-center gap-3 flex-shrink-0">
//                     <Badge className={getSentimentColor(item.sentiment)}>
//                       <span className="font-semibold">{item.sentiment}</span>
//                     </Badge>
//                     {item.url !== "#" && <ExternalLink className="w-4 h-4 text-muted-foreground" />}
//                   </div>
//                 </div>
//                 <p className="text-muted-foreground text-sm mb-4 leading-relaxed font-medium">
//                   {item.description}
//                 </p>
//                 <div className="flex items-center justify-between text-sm text-muted-foreground">
//                   <span className="flex items-center font-bold">
//                     <TrendingUp className="w-4 h-4 mr-2" />
//                     {item.source}
//                   </span>
//                   <span className="flex items-center font-medium">
//                     <Clock className="w-4 h-4 mr-2" />
//                     {getTimeAgo(item.publishedAt)}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground text-lg font-bold">No news available at the moment</p>
//             <p className="text-muted-foreground/70 text-sm mt-2 font-medium">Showing demo data while backend is unavailable</p>
//           </div>
//         )}
//         <div className="mt-6 pt-4 border-t border-border text-center">
//           <p className="text-muted-foreground text-sm font-medium">
//             <span className="font-bold">News updates every 10 minutes</span> • Last updated: <span className="font-semibold">{new Date().toLocaleTimeString()}</span>
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default LiveNewsFeed;


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      const response = await fetch("http://localhost:5000/api/news?symbol=TSLA", {
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
      let errorMessage = "Failed to load news feed.";
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
    const interval = setInterval(fetchNews, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-brand-accent flex items-center">
          <Newspaper className="w-5 h-5 mr-2" />
          Live News Feed
        </CardTitle>
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
