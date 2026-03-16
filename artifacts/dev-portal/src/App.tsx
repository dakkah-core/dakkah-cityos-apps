import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Login />;
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route>
        {/* Simple 404 Fallback that still utilizes Layout if logged in */}
        <ProtectedRoute component={() => (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
            <h1 className="text-6xl font-bold text-primary font-mono mb-4">404</h1>
            <p className="text-xl text-muted-foreground mb-6">Page not found or route not implemented.</p>
            <a href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-mono hover:bg-primary/90 transition-colors">
              Return Home
            </a>
          </div>
        )} />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
