import { Gauge, type LucideIcon, MessagesSquare, Mail, Calendar, ListCheck, Settings, BrainCircuit } from "lucide-react";

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
    href: "/",
  },
  {
    icon: Mail,
    name: "Email",
    href: "/email",
  },
  {
    icon: Calendar,
    name: "Calendar",
    href: "/calendar",
  },
  {
    icon: BrainCircuit,
    name: "Voice Agent",
    href: "/voice-agent",
  },
  {
    icon: ListCheck,
    name: "Commands",
    href: "/commands",
  },
  {
    icon: Settings,
    name: "Settings",
    href: "/settings",
  },
];
