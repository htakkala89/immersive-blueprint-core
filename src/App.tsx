import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Game from "@/pages/game";
import SoloLevelingSpatial from "@/pages/solo-leveling-spatial";
import ChapterSelect from "@/pages/chapter-select";
import DailyLifeHub from "@/pages/daily-life-hub";
import Marketplace from "@/pages/marketplace";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SoloLevelingSpatial} />
      <Route path="/chapter-select" component={ChapterSelect} />
      <Route path="/solo-leveling" component={SoloLevelingSpatial} />
      <Route path="/daily-life-hub" component={DailyLifeHub} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/rpg" component={Game} />
      <Route component={SoloLevelingSpatial} />
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
