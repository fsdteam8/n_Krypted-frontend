"use client"


import { PageHeader } from "@/Shared/PageHeader"
import ContactForm from "@/components/contactForm"



export default function SupportPage() {

    return (
        <div>
            <PageHeader
                title="Support"
                imge="/assets/herobg.png"
             
            />

        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                  
            <div className="w-full container">
                <h1 className="text-[32px] font-semibold mb-5">Support</h1>
                <p className="mb-8 text-base text-[#FFFFFF] font-normal leading-[150%]">
                    We&apos;re here to help! Whether you have a question about your Deals, need help with a Deal, or just want to
                    say hi, our support team is ready to assist you.
                </p>

                <div>
                    <ContactForm /> 
                </div>
            </div>
            </div>
        </div>
    )
}
