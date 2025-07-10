import ContactForm from "@/components/contactForm";
import { FaqSection } from "@/components/faq-section";
import { PageHeader } from "@/Shared/PageHeader";
import Image from "next/image";

const page = () => {
  return (
    <div>
      <PageHeader
        title="Kontakt"
        imge="/assets/app4.png"
        backgroundSize="contain"
      />
      <div className="my-20 lg:mt-28 container">
        <div className="grid grid-cols-2 items-center">
          <div className="col-span-1 hidden md:hidden lg:block">
            <Image
              src="/assets/app1.jpg"
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
