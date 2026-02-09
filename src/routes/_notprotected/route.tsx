import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useColdStartToast } from "@/hooks/useColdStartToast";

export const Route = createFileRoute("/_notprotected")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
});

function RouteComponent() {
  useColdStartToast();

  return (
    <div className="flex w-full h-full items-center justify-center min-h-screen">
      <Outlet />
    </div>
  );
}
