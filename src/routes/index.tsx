import { createFileRoute } from "@tanstack/react-router";
import { SoulaApp } from "@/components/soula/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <SoulaApp />;
}
