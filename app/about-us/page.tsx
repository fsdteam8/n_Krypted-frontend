"use client";
import ContactUsForm from "@/components/ContactUsFrom";
import OurMission from "./_components/OurMission";
import OurVision from "./_components/OurVision";

import { PageHeader } from "@/Shared/PageHeader";

const page = () => {
  // const session = useSession();
  // const token = session?.data?.user?.accessToken;
  // console.log({token});

  return (
    <div className="">
      <PageHeader title="Was sind Walk Throughz?" imge="/assets/about.png" />
      <div className="mt-18 lg:mt-24 container">
        <div className="text-center mt-8">
          <h1 className="text-[25px] lg:text-[40px] font-semibold text-[#FFFFFF]">
            Walk Throughz ist eine Plattform für echte Stadterlebnisse – lokal,
            lebendig und persönlich.
          </h1>

          <p className="mt-3 text-base lg:text-xl text-[#E0E0E0] leading-[150%]">
            Wir bringen Menschen mit besonderen Orten und spannenden Themen
            zusammen. Ob Rundgänge durch neue Niche Stores, Einblicke in
            Fashion-Labels, kurze Führungen durch kreative Werkstätten, Cafés
            oder Orte, die man sonst übersieht – bei Walk Throughz holen wir für
            euch das Besondere aus jeder Location heraus. Jeder Walk Through
            dauert zwischen 30 und 60 Minuten und wird direkt von den Menschen
            gestaltet, die die Orte mit Leben füllen. So entsteht eine neue Art,
            Stadt zu erleben – spontan, nahbar und inspirierend.
          </p>
        </div>

        <div>
          <OurMission />
        </div>

        <div>
          <OurVision />
        </div>

        {/* <div>
          <TestimonialSection />
        </div> */}
        <div>
          <ContactUsForm />
        </div>
      </div>
    </div>
  );
};

export default page;
