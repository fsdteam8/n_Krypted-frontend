import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


const faqs = [
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
    {
        question: "Was genau ist ein Walk Through eigentlich?",
        answer:
            "Ein Walk Through ist eine kurze, geführte Tour durch besondere Orte – zum Beispiel durch kleine Läden, Ateliers, Werkstätten oder Cafés. Die Gastgeber:innen geben direinen persönlichen Einblick hinter die Kulissen – authentisch, nahbar und oft überraschend",
    },
    {
        question: "Muss ich etwas mitbringen?",
        answer:
            "Nur deinen Zugangscode – digital oder ausgedruckt. Ansonsten brauchst du nichts weiter, außer vielleicht bequemen Schuhen und ein bisschen Neugier.",
    },
    {
        question: "Kann ich mit Freund:innen oder Familie teilnehmen?",
        answer:
            "Klar! Du kannst mehrere Plätze auf einmal buchen. Wenn ihr gemeinsam kommt, gebt das gern bei der Buchung an – dann versuchen wir, euch zusammen einzuplanen.",
    },
    {
        question: "Sind Walk Throughz auch für Kinder geeignet?",
        answer:
            "Das kommt auf das Thema an. Manche Formate sind kinderfreundlich, andere richten sich eher an Erwachsene. In der jeweiligen Beschreibung findest du einenHinweis, ob Kinder willkommen sind.",
    },
    {
        question: "Finden Walk Throughz auch bei schlechtem Wetter statt?",
        answer:
            "In der Regel ja. Viele Formate sind wetterunabhängig oder finden zumindest teilweise drinnen statt. Falls es doch einmal zu einer wetterbedingten Absage kommt, wirst du rechtzeitig informiert",
    },
    {
        question: "Kann ich beim Walk Through auch aktiv mitmachen?",
        answer:
            "Sehr gern sogar! Viele Gastgeber:innen freuen sich über Fragen, Austausch oder kleine Mitmach-Aktionen. Du entscheidest selbst, wie aktiv du dabei sein möchtest.",
    }
]

function FaqPage() {
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

export default FaqPage