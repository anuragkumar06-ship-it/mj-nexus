import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Marquee } from "@/components/landing/marquee";
import { Modules } from "@/components/landing/modules";
import { AiShowcase } from "@/components/landing/ai-showcase";
import { Lifecycle } from "@/components/landing/lifecycle";
import { Roles } from "@/components/landing/roles";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { ScrollProgress } from "@/components/shared/scroll-progress";

export default function Home() {
  return (
    <main className="relative overflow-x-hidden bg-offwhite">
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Stats />
      <Marquee />
      <Modules />
      <AiShowcase />
      <Lifecycle />
      <Roles />
      <Cta />
      <Footer />
    </main>
  );
}
