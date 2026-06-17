import {
  BrainCircuit,
  Calendar,
  Gauge,
  ListCheck,
  type LucideIcon,
  Mail,
  MessagesSquare,
  Settings,
} from "lucide-react";

export type SiteConfig = typeof siteConfig;
export type Navigation = {
  icon: LucideIcon;
  name: string;
  href: string;
};

export const siteConfig = {
  title: "VisActor Next Template",
  description: "Template for VisActor and Next.js",
};

export const navigations: Navigation[] = [
  {
    icon: Gauge,
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Mail,
    name: "Email",
    href: "/dashboard/email",
  },
  {
    icon: Calendar,
    name: "Calendar",
    href: "/dashboard/calendar",
  },
  {
    icon: BrainCircuit,
    name: "Voice Agent",
    href: "/dashboard/voice-agent",
  },
  {
    icon: ListCheck,
    name: "Commands",
    href: "/dashboard/commands",
  },
  {
    icon: Settings,
    name: "Settings",
    href: "/dashboard/settings",
  },
];
