import { createFileRoute, Link } from "@tanstack/react-router";
import { fmtLong, fromKey } from "@/lib/dates";
import { Page } from "@/components/ui-kit";
import { SessionView } from "@/components/SessionView";

export const Route = createFileRoute("/sesion/$date")({
  head: () => ({ meta: [{ title: "Sesión · OPERATOR" }, { name: "description", content: "Detalle y registro de la sesión." }, { property: "og:title", content: "Sesión · OPERATOR" }, { property: "og:description", content: "Registro por serie." }] }),
  component: Sesion,
});

function Sesion() {
  const { date } = Route.useParams();
  return (
    <Page title="Sesión" subtitle={fmtLong(fromKey(date))} action={<Link to="/" className="text-sm text-primary">Hoy</Link>}>
      <SessionView dateKey={date} />
    </Page>
  );
}
