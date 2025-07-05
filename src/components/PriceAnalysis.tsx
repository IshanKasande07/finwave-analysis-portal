
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Loader2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// interface PredictionResult {
//   stock: string;
//   current_price: number | string;
//   percentage_change: number | string;
//   trend: string;
//   reason: string;
//   candle_pattern: string;
//   color: string;
// }

// const PriceAnalysis = () => {
//   const [stockSymbol, setStockSymbol] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<PredictionResult | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [timeframe, setTimeframe] = useState("D");
//   const [chartType, setChartType] = useState("candlestick");
//   const { toast } = useToast();

//   const safeToFixed = (value: number | string | undefined, decimals: number = 2): string => {
//     if (value === undefined || value === null) return "0.00";
//     const num = typeof value === 'string' ? parseFloat(value) : value;
//     return isNaN(num) ? "0.00" : num.toFixed(decimals);
//   };

//   const safeNumber = (value: number | string | undefined): number => {
//     if (value === undefined || value === null) return 0;
//     const num = typeof value === 'string' ? parseFloat(value) : value;
//     return isNaN(num) ? 0 : num;
//   };

//   const predictStock = async () => {
//     if (!stockSymbol.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter a stock symbol",
//         variant: "destructive",
//       });
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);
    
//     try {
//       console.log(`Attempting price analysis for: ${stockSymbol}`);
      
//       const response = await fetch('http://localhost:5000/api/price-analysis', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ stock_symbol: stockSymbol }),
//       });

//       console.log(`Response status: ${response.status}`);

//       if (!response.ok) {
//         if (response.status === 500) {
//           throw new Error('Backend server error. Please check if the Flask server is running properly.');
//         }
//         const errorText = await response.text();
//         console.error(`API request failed: ${response.status} - ${errorText}`);
//         throw new Error(`Server error: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('Received API data:', data);
      
//       if (data.error) {
//         throw new Error(data.error);
//       }

//       // Process the data to ensure numeric values
//       const processedData = {
//         ...data,
//         current_price: safeNumber(data.current_price),
//         percentage_change: safeNumber(data.percentage_change)
//       };

//       setResult(processedData);
      
//       toast({
//         title: "Prediction Complete",
//         description: `Successfully analyzed ${stockSymbol.toUpperCase()}`,
//       });
//     } catch (error: any) {
//       console.error('Error analyzing stock:', error);
//       let errorMessage = 'Failed to analyze stock. Please check if the backend server is running.';
      
//       if (error.message.includes('fetch')) {
//         errorMessage = 'Cannot connect to backend server. Please ensure the Flask server is running on http://localhost:5000';
//       } else if (error.message.includes('500')) {
//         errorMessage = 'Backend server error. Please check the Flask server logs for details.';
//       }
      
//       setError(errorMessage);
      
//       toast({
//         title: "Analysis Failed",
//         description: errorMessage,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-6xl mx-auto">
//           <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Stock Price Predictor</h1>
          
//           <Card className="bg-card border-border mb-8">
//             <CardHeader>
//               <CardTitle className="text-brand-accent flex items-center">
//                 <BarChart3 className="w-5 h-5 mr-2" />
//                 Stock Price Analysis & Prediction
//               </CardTitle>
//               <CardDescription className="text-muted-foreground">
//                 Enter a stock symbol to get AI-powered price predictions and technical analysis
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-wrap gap-4">
//                 <div className="flex-1 min-w-[200px]">
//                   <Input
//                     placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
//                     value={stockSymbol}
//                     onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
//                     className="bg-background border-border text-foreground"
//                     onKeyPress={(e) => e.key === 'Enter' && predictStock()}
//                   />
//                 </div>
//                 <Button 
//                   onClick={predictStock} 
//                   disabled={loading}
//                   className="bg-brand-accent hover:bg-brand-accent/90 text-white"
//                 >
//                   {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
//                   Predict
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {loading && (
//             <Card className="bg-card border-border mb-8">
//               <CardContent className="flex items-center justify-center py-8">
//                 <div className="flex flex-col items-center space-y-4">
//                   <div className="flex space-x-2">
//                     <div className="w-3 h-3 bg-brand-primary rounded-full animate-bounce"></div>
//                     <div className="w-3 h-3 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                     <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                   </div>
//                   <p className="text-muted-foreground">Analyzing market data and generating predictions...</p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {error && (
//             <Card className="bg-card border-border mb-8">
//               <CardContent className="flex items-center justify-center py-8">
//                 <div className="text-center">
//                   <p className="text-red-400 text-lg font-semibold mb-2">Prediction Failed</p>
//                   <p className="text-muted-foreground">{error}</p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {result && (
//             <div className="space-y-6">
//               <Card className="bg-card border-border">
//                 <CardHeader>
//                   <CardTitle className="text-foreground flex items-center justify-between">
//                     {result.stock} Prediction
//                     <Badge className={`${result.trend === 'Bullish' ? 'bg-green-500/10 text-green-400 border-green-500/20' : result.trend === 'Bearish' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
//                       {result.trend}
//                     </Badge>
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     <div className="text-center p-4 bg-muted rounded-lg">
//                       <p className="text-muted-foreground text-sm mb-1">Current Price</p>
//                       <p className="text-3xl font-bold text-foreground">${safeToFixed(result.current_price)}</p>
//                     </div>
//                     <div className="text-center p-4 bg-muted rounded-lg">
//                       <p className="text-muted-foreground text-sm mb-1">Change</p>
//                       <div className="flex items-center justify-center">
//                         {safeNumber(result.percentage_change) >= 0 ? 
//                           <TrendingUp className="w-5 h-5 text-green-400 mr-1" /> : 
//                           <TrendingDown className="w-5 h-5 text-red-400 mr-1" />
//                         }
//                         <p className={`text-2xl font-bold ${safeNumber(result.percentage_change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                           {safeNumber(result.percentage_change) >= 0 ? '+' : ''}{safeToFixed(result.percentage_change)}%
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-center p-4 bg-muted rounded-lg">
//                       <p className="text-muted-foreground text-sm mb-1">Trend</p>
//                       <p className="text-xl font-semibold text-foreground">{result.trend}</p>
//                     </div>
//                     <div className="text-center p-4 bg-muted rounded-lg">
//                       <p className="text-muted-foreground text-sm mb-1">Pattern</p>
//                       <p className="text-xl font-semibold text-brand-primary">{result.candle_pattern}</p>
//                     </div>
//                   </div>
//                   <div className="mt-6 p-4 bg-muted rounded-lg">
//                     <p className="text-muted-foreground text-sm mb-2">Analysis Reason</p>
//                     <p className="text-foreground">{result.reason}</p>
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card className="bg-card border-border">
//                 <CardHeader>
//                   <CardTitle className="text-foreground">Live TradingView Chart</CardTitle>
//                   <CardDescription className="text-muted-foreground">
//                     Interactive chart with real-time data and technical indicators
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="flex gap-4 mb-4">
//                     <Select value={timeframe} onValueChange={setTimeframe}>
//                       <SelectTrigger className="w-32 bg-background border-border">
//                         <SelectValue placeholder="Timeframe" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="1">1m</SelectItem>
//                         <SelectItem value="5">5m</SelectItem>
//                         <SelectItem value="15">15m</SelectItem>
//                         <SelectItem value="60">1h</SelectItem>
//                         <SelectItem value="D">1D</SelectItem>
//                         <SelectItem value="W">1W</SelectItem>
//                       </SelectContent>
//                     </Select>
                    
//                     <Select value={chartType} onValueChange={setChartType}>
//                       <SelectTrigger className="w-40 bg-background border-border">
//                         <SelectValue placeholder="Chart Type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="candlestick">Candlestick</SelectItem>
//                         <SelectItem value="line">Line</SelectItem>
//                         <SelectItem value="bar">Bar</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
                  
//                   <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
//                     <iframe
//                       src={`https://s.tradingview.com/widgetembed/?symbol=${result.stock}&interval=${timeframe}&theme=dark&style=${chartType === 'candlestick' ? '1' : chartType === 'line' ? '2' : '3'}&toolbarbg=2B2B2B&timezone=exchange&withdateranges=1`}
//                       className="w-full h-full rounded-lg"
//                       frameBorder="0"
//                       scrolling="no"
//                       allowTransparency={true}
//                     />
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PriceAnalysis;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PriceResult {
  stock_symbol: string;
  current_price: number | null;
  change_percent: number | null;
  volatility: number | null;
  timestamp: string | null;
}

const PriceAnalysis = () => {
  const [stockSymbol, setStockSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("D");
  const [chartType, setChartType] = useState("candlestick");
  const { toast } = useToast();

  const safeToFixed = (num: number | null, digits = 2) =>
    num !== null ? num.toFixed(digits) : "N/A";

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
    setError(null);
    setResult(null);

    try {
      console.log(`Attempting price analysis for: ${stockSymbol}`);
      const response = await fetch("http://localhost:5000/api/price-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_symbol: stockSymbol }),
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
        description: `Successfully analyzed price for ${stockSymbol}`,
      });
    } catch (error: unknown) {
      console.error("Error analyzing stock:", error);
      let errorMessage = "Failed to analyze stock. Please check if the backend server is running or try again later.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
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
                <TrendingUp className="w-5 h-5 mr-2" />
                Analyze Stock Price
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Predict stock trends using historical data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Enter stock symbol (e.g., TSLA, AAPL)"
                    value={stockSymbol}
                    onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                    className="bg-background border-border text-foreground"
                    onKeyPress={(e) => e.key === "Enter" && predictStock()}
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
                    <div className="w-3 h-3 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <p className="text-muted-foreground">Analyzing market data and generating predictions...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="bg-card border-border mb-8">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-400 text-lg font-semibold mb-2">Prediction Failed</p>
                  <p className="text-muted-foreground">{error.includes("404") ? "No data available for this symbol. Try again later or check the symbol." : error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">{result.stock_symbol} Price Analysis</CardTitle>
                  <CardDescription className="text-muted-foreground">Overview based on historical data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                      <p className="text-3xl font-bold text-foreground">
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
                    <div className="text-center p-4 bg-muted rounded-lg">
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
                      src={`https://s.tradingview.com/widgetembed/?symbol=${result.stock_symbol}&interval=${timeframe}&theme=dark&style=${chartType === 'candlestick' ? '1' : chartType === 'line' ? '2' : '3'}&toolbarbg=2B2B2B&timezone=exchange&withdateranges=1`}
                      className="w-full h-full rounded-lg"
                      frameBorder="0"
                      scrolling="no"
                      allowTransparency={true}
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