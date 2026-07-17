import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

import { Navigation } from '@/components/layout';
import Home from '@/pages/home';
import Onboarding from '@/pages/onboarding';
import CheckIn from '@/pages/check-in';
import CheckInDetail from '@/pages/check-in-detail';
import Family from '@/pages/family';
import Guardian from '@/pages/guardian';
import Memory from '@/pages/memory';
import Companion from '@/pages/companion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const hideNav = location === '/onboarding';

  return (
    <div className="min-h-[100dvh] bg-background w-full">
      {!hideNav && <Navigation />}
      <main className={!hideNav ? "md:pl-64" : ""}>
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/check-in" component={CheckIn} />
        <Route path="/check-in/:id" component={CheckInDetail} />
        <Route path="/family" component={Family} />
        <Route path="/memory" component={Memory} />
        <Route path="/guardian" component={Guardian} />
        <Route path="/companion" component={Companion} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
