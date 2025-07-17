import Image from "next/image";

const OurMission = () => {
  return (
    <section className="mt-12 md:mt-24 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10 justify-between max-w-7xl mx-auto">
        {/* Text Section */}
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-4 h-7 sm:w-5 sm:h-9 bg-white rounded" />
            <h1
              className="text-[40px] font-normal font-benedict text-white leading-[120%] tracking-[0.04em] 
                 [text-shadow:_0_0_1px_#fff,_0_0_15px_#fff,_0_0_15px_#fff]"
              style={{ fontFamily: "cursive" }}
            >
             Unsere Mission  
            </h1>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-[32px] text-white font-semibold mt-4 sm:mt-5">
            Was ist der aktuelle Zweck von Walk Throughz?
          </h3>
          <p className="text-white text-sm sm:text-base lg:text-xl leading-[150%] font-normal mt-4 sm:mt-5 text-justify">
            Unsere Mission ist es, Stadt neu erlebbar zu machen: Wir möchten
            Bürger*innen und Lokationen enger miteinander vernetzen und echte,
            bleibende Bindungen zu Orten schaffen – durch das Teilen von lokalem
            Fachwissen, Leidenschaft und Persönlichkeit. Walk Throughz bringt
            Gleichgesinnte auf eine neue, ungezwungene Art zusammen und fördert
            den Austausch über Themen, die inspirieren. Wir wollen verhindern,
            dass unsere Städte unpersönlich und leblos werden. Stattdessen
            setzen wir Impulse, die sie aktiv, menschlich und dynamisch halten.
          </p>
        </div>

        {/* Image Section */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <Image
            src="/assets/Unsere_Mission.jpg"
            alt="Auction speaker"
            height={1000}
            width={1000}
            className="rounded-xl w-full max-w-[470px] h-auto sm:h-[650px] object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default OurMission;
