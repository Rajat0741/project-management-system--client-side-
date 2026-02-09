import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_notprotected/_message")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
