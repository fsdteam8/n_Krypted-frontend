import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


const faqs = [
     {
        question: "Was genau ist ein Walk Through eigentlich?",
        answer:
            "Ein Walk Through ist eine kurze, geführte Tour zu besonderen Themen – etwa in kleinen Läden, Ateliers, Werkstätten oder Cafés. Die Gastgeber:innen geben dir einen persönlichen Einblick in ihr Fachgebiet oder ihre Leidenschaft; echt, direkt und voller neuer Perspektiven.",
    },
    {
        question: "Wie buche ich einen Walk Through?",
        answer:
            "Wähle einfach deinen gewünschten Walk Through aus und buche ihn online. Nach erfolgreicher Buchung erhältst du deinen Zugangscode per E-Mail oder findest ihn in deinem Nutzerkonto. Zeig den Code einfach beim Walk Through vor – und schon kann’s losgehen!",
    },
    {
        question: "Wie lange dauert ein Walk Through?",
        answer:
            "Die Dauer kann leicht variieren – je nachdem, wie der Walk Through verläuft. Plane am besten etwa 30 bis 60 Minuten ein",
    },
    {
        question: "Muss ich pünktlich erscheinen? ",
        answer:
            "Ja, bitte sei etwa 10 Minuten vor Beginn vor Ort. So startet alles entspannt und du verpasst nichts.",
    },
    {
        question: "Was, wenn ich den Termin nicht wahrnehmen kann?",
        answer:
            "Aktuell ist eine Umbuchung leider noch nicht möglich – aber wir arbeiten bereits an einer Lösung!",
    },
   
]

function Faq() {
    return (
        <div>
            <Accordion type="single" collapsible className="w-full flex flex-col gap-4 ">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="rounded-lg">
                        <AccordionTrigger className="text-left text-base md:text-xl lg:text-xl font-semibold text-white">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-[#E0E0E0]">{faq.answer}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

export default Faq