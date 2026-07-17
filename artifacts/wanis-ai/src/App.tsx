import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MotionConfig } from 'framer-motion';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation, Link } from 'wouter';
import { Home as HomeIcon } from 'lucide-react';

import { ModeProvider, useMode } from '@/contexts/ModeContext';
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
  const { mode } = useMode();
  const hideNav = location === '/onboarding';
  const isPersonal = mode === 'personal';

  return (
    <MotionConfig reducedMotion={isPersonal ? 'always' : 'never'}>
      <div className={`min-h-[100dvh] bg-background w-full${isPersonal ? ' personal-mode' : ''}`}>
        {!hideNav && <Navigation />}

        {/* Persistent Home button for personal mode — always in the same corner */}
        {isPersonal && !hideNav && location !== '/' && (
          <Link href="/">
            <button
              aria-label="Go Home"
              className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-background border border-border rounded-2xl px-4 py-3 shadow-md min-h-[52px] text-foreground hover:bg-card transition-colors"
              style={{ fontFamily: 'var(--app-font-sans)' }}
            >
              <HomeIcon className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm font-semibold">Home</span>
            </button>
          </Link>
        )}

        <main className={!hideNav ? (isPersonal ? 'pb-[90px]' : 'md:pl-64') : ''}>
          {children}
        </main>
      </div>
    </MotionConfig>
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
          <ModeProvider>
            <Router />
          </ModeProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
