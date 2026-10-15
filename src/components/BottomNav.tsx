import { Link } from "@tanstack/react-router";
import { CalendarRange, Dumbbell, LineChart, Sun, UtensilsCrossed } from "lucide-react";

const items = [
  { to: "/", label: "Hoy", Icon: Sun, exact: true },
  { to: "/entrenar", label: "Entrenar", Icon: Dumbbell },
  { to: "/nutricion", label: "Nutrición", Icon: UtensilsCrossed },
  { to: "/progreso", label: "Progreso", Icon: LineChart },
  { to: "/plan", label: "Plan", Icon: CalendarRange },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 glass border-x-0 border-b-0 pb-safe">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {items.map(({ to, label, Icon, ...rest }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: "exact" in rest }}
              className="flex min-h-14 flex-col items-center justify-center gap-1 text-muted-foreground data-[status=active]:text-primary"
            >
              <Icon className="h-[22px] w-[22px]" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
