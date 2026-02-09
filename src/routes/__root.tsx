import { createRootRouteWithContext, Outlet, useLocation } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import type { AuthState } from "@/types";
import type { QueryClient } from "@tanstack/react-query";
import Header from "@/components/shared/Header";
import { DotBackground } from "@/components/ui/DotBackground";

// Extend AuthState to include queryClient
interface RouterContext extends AuthState {
  queryClient: QueryClient;
}

const RootLayout = () => {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isIndexPage = location.pathname === "/";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <div className="min-h-screen flex flex-col">
          {!isIndexPage && <Header />}
          {isIndexPage ? (
            <div className="flex flex-col items-center flex-1">
              <Outlet />
            </div>
          ) : (
            <DotBackground className="flex-1">
              <Outlet />
            </DotBackground>
          )}
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
