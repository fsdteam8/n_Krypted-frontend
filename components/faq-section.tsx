import { Button } from "@/components/ui/button"
import { MoveRight } from "lucide-react"
import Link from "next/link"
import Faq from "./faq"

export function FaqSection() {
  return (
    <section className="container mt-10 lg:mt-24">
      <div className="grid gap-8 lg:grid-cols-6">

        <div className="col-span-6 lg:col-span-2">
          <div className="flex lg:block justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-7 sm:w-5 sm:h-9 bg-white rounded" />
                <h1
                  className="heading-size font-normal font-benedict text-white leading-[120%] tracking-[0.04em] 
                 [text-shadow:_0_0_1px_#fff,_0_0_15px_#fff,_0_0_15px_#fff]"
                >
                  FAQ
                </h1>
              </div>
              <h2 className="text-white text-[24px] font-semibold tracking-tight md:text-[30px] lg:text-[30px] mt-2 mb-4">Frequently Asked Questions</h2>
            </div>
            <Link href="/faq">
              <Button className="bg-white text-black">
                Alle Fragen anzeigen <MoveRight />
              </Button>
            </Link>
          </div>
        </div>

        <div className="col-span-6 lg:col-span-4">
          <Faq />
        </div>
      </div>
    </section>
  )
}
