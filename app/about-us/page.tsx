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
      <PageHeader
        title="Was wollen wir wirklich?"
        imge="/assets/Über_Uns.jpg"
      />
      <div className="mt-10 lg:mt-10 container">
        <div className="text-center ">
          <h1 className="text-[25px] lg:text-[32px] font-semibold text-[#FFFFFF]">
            Walk Throughz ist eine Plattform für echte Stadterlebnisse{" "}–
            <div> lokal, lebendig und persönlich.</div>
          </h1>

          <div className="mt-5 text-base lg:text-[16px] text-[#E0E0E0] leading-[150%]">
            Wir bringen Menschen mit besonderen Orten und spannenden Themen
            zusammen.{" "}
            <p>
              Ob Rundgänge durch neue Niche Stores, Einblicke in Fashion-Labels,
              kurze Führungen durch kreative Werkstätten, Cafés oder Orte, die
              man sonst übersieht – bei Walk Throughz holen wir für euch das
              Besondere aus jeder Location heraus. Jeder Walk Through dauert
              ungefähr zwischen 30 und 60 Minuten und wird direkt von den
              Menschen gestaltet, die die Orte mit Leben füllen. So entsteht
              eine neue Art, Stadt zu erleben.
            </p>
          </div>
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
        <div className=" lg:pt-[100px]">
          <ContactUsForm />
        </div>
      </div>
    </div>
  );
};

export default page;
