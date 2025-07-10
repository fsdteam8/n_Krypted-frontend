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
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Langeweile in der Stadt? Nicht mit uns!
            </h1>
            <div className="mb-8">
              <p className="text-white/90 text-sm md:text-base max-w-2md">
                Mit <span className="font-bold ">Walk Throughz</span>{" "}
                erlebst Du Deine Stadt neu – durch kurze, persönliche Einblicke
                direkt von den Menschen, die sie gestalten. Ob Blumenladen,
                Galerie oder Kaffeerösterei: Überall wartet eine eigene kleine
                Welt auf Dich. In kleinen Gruppen entdeckst Du neue
                Perspektiven, spannende Themen – und triffst Leute, die Deine
                Interessen teilen.
              </p>
              <p className="text-white/90 text-sm md:text-base max-w-md">
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
