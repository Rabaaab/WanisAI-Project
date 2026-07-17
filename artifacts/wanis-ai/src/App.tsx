import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MotionConfig } from 'framer-motion';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation, Link } from 'wouter';
import { Home as HomeIcon } from 'lucide-react';

import { ModeProvider, useMode } from '@/contexts/ModeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/layout';
import Home from '@/pages/home';
import Onboarding from '@/pages/onboarding';
import CheckIn from '@/pages/check-in';
import CheckInDetail from '@/pages/check-in-detail';
import Family from '@/pages/family';
import Guardian from '@/pages/guardian';
import Memory from '@/pages/memory';
import Companion from '@/pages/companion';
import Duas from '@/pages/duas';
import Recitation from '@/pages/recitation';

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

        <main
          className={
            hideNav
              ? ''
              : isPersonal
                ? 'pb-[64px]'
                : 'pt-14 pb-[64px] md:pt-0 md:pb-0 md:pl-64'
          }
        >
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
        <Route path="/duas" component={Duas} />
        <Route path="/recitation" component={Recitation} />
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
          <LanguageProvider>
            <ModeProvider>
              <Router />
            </ModeProvider>
          </LanguageProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
