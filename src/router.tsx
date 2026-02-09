import { createRouter } from '@tanstack/react-router'
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { axiosErrorHandler } from '@/utils/axiosApiHandler'

// Create QueryClient with global error handling
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: axiosErrorHandler,
  }),
  mutationCache: new MutationCache({
    onError: axiosErrorHandler,
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

// Create router instance with context
export const router = createRouter({
  routeTree,
  context: {
    isAuthenticated: undefined as unknown as boolean,
    queryClient,
  },
})

// Register router type
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
