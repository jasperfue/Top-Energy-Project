import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
