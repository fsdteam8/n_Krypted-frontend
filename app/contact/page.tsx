import ContactForm from "@/components/contactForm";
import { FaqSection } from "@/components/faq-section";
import { PageHeader } from "@/Shared/PageHeader";
import Image from "next/image";

const page = () => {
  return (
    <div>
      <PageHeader title="Kontakt" imge="/assets/contact-banner.jpg" />

      <div className="my-20 lg:mt-28 container">
        <h2
          className="heading-size font-normal font-benedict text-white leading-[120%] tracking-[0.04em] 
                 [text-shadow:_0_0_1px_#fff,_0_0_15px_#fff,_0_0_15px_#fff] text-center mb-10"
        >
          Gib gerne deine Nachricht an uns hier ein!{" "}
        </h2>
        <div className="grid grid-cols-2 items-center">
          <div className="col-span-1 hidden md:hidden lg:block">
            <Image
              src="/assets/kontact.jpg"
              alt="Auction speaker"
              height={472}
              width={370}
              className="rounded-xl  w-full max-w-[470px] h-auto object-fill"
              priority
            />
          </div>
          <div className="col-span-2 lg:col-span-1">
            <ContactForm />
          </div>
        </div>
        <div className="mt-[120px] lg:mt-[120px] mb-[120px]">
          <FaqSection />
        </div>
      </div>
    </div>
  );
};

export default page;
