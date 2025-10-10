import { Facebook, Instagram, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NewsletterSubscription from "./Subscribe";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Footer() {
  return (
    <footer className="bg-white text-white pt-[50px] pb-8">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-sm">
        <div className="lg:col-span-3 xl:col-span-3">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center">
              <div className="text-center">
                <div className="flex justify-center">
                  <Image
                    src="/assets/footerlogo1.png"
                    alt="Logo"
                    width={100}
                    height={100}
                    className="h-[30px] w-[80px] lg:h-[37px] lg:w-[95px]"
                  />
                </div>
                <h1 className="font-benedict text-[32px] font-medium mb-2 text-[#212121] mt-[7px] leading-[120%] logo-size">
                  Walk Throughz
                </h1>
              </div>
            </Link>
          </div>
          <div className="text-[#4E4E4E] pb-4">
            Folge uns in den sozialen Medien für exklusive Updates und
            Sonderangebote!
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4 -mb-[35px] md:mb-0">
            <Link
              href=""
              aria-label="Facebook"
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[#4E4E4E] hover:bg-gray-100 transition-colors"
            >
              <Facebook size={18} />
            </Link>
            <Link
              href=""
              aria-label="Instagram"
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[#4E4E4E] hover:bg-gray-100 transition-colors"
            >
              <Instagram size={18} />
            </Link>
            <Link
              href=""
              aria-label="Instagram"
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[#4E4E4E] hover:bg-gray-100 transition-colors"
            >
              <Image
                src="/assets/tiktok.png"
                alt="Linkedin"
                width={20}
                height={20}
              />
            </Link>
            {/* <Link
              href=""
              aria-label="Twitter"
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-[#4E4E4E] hover:bg-gray-100 transition-colors"
            >
              <Image
                src="/assets/xlogo.jpg"
                alt="Linkedin"
                width={20}
                height={20}
                className="h-[14px] w-[14px]"
              />
            </Link> */}
          </div>
        </div>

        <div className="lg:col-span-2 xl:col-span-3">
          <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
          <ul className="space-y-2 text-[#4E4E4E]">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/about-us">Über uns</Link>
            </li>
            <li>
              <Link href="/deals">Walk Throughz</Link>
            </li>
            <li>
              <Link href="/blog">Blogs</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>

            <li>
              <Link href="/contact">Kontakt</Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3 xl:col-span-3">
          <h3 className="font-semibold text-lg mb-3 text-[#212121]">
            Walk Throughz Sites
          </h3>
          <Select defaultValue="usa">
            <SelectTrigger className="w-[200px] rounded-full bg-white text-[#4E4E4E] border border-gray-300 px-4 py-2 flex items-center gap-2">
              <Globe size={18} />
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent className="bg-white text-[#4E4E4E]">
              <SelectItem value="usa">Deutschland</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-4 xl:col-span-3">
          <NewsletterSubscription />
        </div>
      </div>

      <div className="container">
        <div className="my-6 border-b border-gray-600" />
      </div>

      <div className="container">
        {/* Payment Methods */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          {/* <p className="text-xs text-[#595959] mb-2 md:mb-0">Accepted payment methods”</p> */}
          <div className="flex space-x-4">
            <div className="flex items-center justify-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
              <Image
                src="/assets/Paypal.png"
                alt="PayPal"
                width={60}
                height={30}
                className="h-6 w-auto"
              />
            </div>
            <div className="flex items-center justify-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
              <Image
                src="/assets/amex.png"
                alt="American Express"
                width={60}
                height={30}
                className="h-6 w-auto"
              />
            </div>
            <div className="flex items-center justify-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
              <Image
                src="/assets/maestro.png"
                alt="Maestro"
                width={60}
                height={30}
                className="h-6 w-auto"
              />
            </div>
            <div className="flex items-center justify-center bg-white rounded-md p-1 shadow-sm border border-gray-200">
              <Image
                src="/assets/visa.png"
                alt="Maestro"
                width={60}
                height={30}
                className="h-6 w-auto"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between text-xs text-[#595959]">
          <p>© 2025 Agentur. Alle Rechte vorbehalten.</p>
          <div className="space-x-4 pt-2 md:pt-0 lg:pt-0">
            <Link href="/suport">Support</Link>
            <Link href="/report">Geschäftsbedingungen</Link>
            <Link href="/refund-policies">Datenschutzerklärung</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
