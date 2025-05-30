import { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { ChatOverlay } from "@/components/chat-overlay";
import { LandingPage } from "@/pages/landing";
import { MainChatPage } from "@/pages/main-chat";
import { BouncerChatPage } from "@/pages/bouncer-chat";
import NotFound from "@/pages/not-found";

function Router() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Close chat overlay when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen]);

  return (
    <div className="min-h-screen">
      <Navigation onToggleChat={toggleChat} />
      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      <Switch>
        <Route path="/" component={() => <LandingPage onToggleChat={toggleChat} />} />
        <Route path="/main-chat" component={MainChatPage} />
        <Route path="/bouncer-chat" component={BouncerChatPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
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
