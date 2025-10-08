import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroBanner() {
  return (
    <section
      className="relative w-full h-[500px] md:h-[600px] lg:h-[720px] overflow-hidden mb-[80px]"
      style={{
        backgroundImage: "url('/assets/banner.png')",
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container">
          <div className="max-w-2xl ">
            <div className="text-3xl md:text-4xl lg:text-[37px] font-bold text-white mb-4">
              Entdecke, was deine Stadt
              <div className="mt-3">wirklich ausmacht</div>
            </div>
            <div className="mb-8">
              <div className="text-white/90 text-sm md:text-base max-w-2md">
                Mit <span className="font-bold ">Walk Throughz</span> erlebst du
                deine Stadt neu – durch kurze, persönliche Einblicke direkt von
                den Menschen, die sie gestalten. Ob Blumenladen, Galerie oder
                Kaffeerösterei: Überall wartet eine eigene kleine Welt auf dich.
                <div className="text-white">
                  In kleinen Gruppen entdeckst du neue Perspektiven, spannende
                  Themen
                  <div>– und triffst Leute, die deine Interessen teilen.</div>
                </div>
              </div>
              <p className="text-white/90 text-sm md:text-base max-w-md mt-5">
                Kompakt, lokal, verbindend - let’s go!
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="bg-white text-black hover:bg-white/90 border-none group"
            >
              <Link href="/deals" className="flex items-center">
                Jetzt Platz sichern!
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
