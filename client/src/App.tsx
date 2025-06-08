import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Game from "@/pages/game";
import SoloLeveling from "@/pages/solo-leveling";
import ChapterSelect from "@/pages/chapter-select";
import DailyLifeHub from "@/pages/daily-life-hub";
import Home from "@/pages/home";
import Marketplace from "@/pages/marketplace";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/chapter-select" component={ChapterSelect} />
      <Route path="/solo-leveling" component={SoloLeveling} />
      <Route path="/daily-life-hub" component={DailyLifeHub} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/rpg" component={Game} />
      <Route component={Home} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
