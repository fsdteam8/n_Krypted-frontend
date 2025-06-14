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
                  className="font-benedict text-[35px] font-normal mb-2 text-white "
                >
                  „FAQs“
                </h1>
              </div>
              <h2 className="text-white text-[20px] font-semibold tracking-tight md:text-[30px] lg:text-[40px] mt-2 mb-4">Frequently Asked Questions</h2>
            </div>
            <Link href="/faq">
              <Button className="bg-white text-black">
                Explore All <MoveRight />
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
