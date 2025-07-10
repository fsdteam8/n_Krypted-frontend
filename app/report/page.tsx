import { PageHeader } from "@/Shared/PageHeader";

export default function TermsAndConditions() {
  return (
    <div>
      <PageHeader title="Geschäftsbedingungen" imge="/assets/ges.jpg" />

      <div className="bg-black min-h-screen py-12">
        {" "}
        {/* Added bg-black for consistent background */}
        <div className="w-full container mt-[80px] pb-[120px] text-white">
          <h1 className="text-2xl md:text-[32px] font-semibold mb-6">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>

          <p className="mb-4 text-sm md:text-base leading-[150%] font-medium">
            Walk Throughz
          </p>
          <p className="mb-4 text-sm md:text-base leading-[150%] font-medium">
            Töngesgasse 39, 60311 Frankfurt am Main
          </p>
          <p className="mb-9 text-sm md:text-base leading-[150%] font-medium">
            Stand: Juni 2025
          </p>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            1. Geltungsbereich
          </h2>
          <p className="mb-9 text-sm md:text-base leading-[150%] font-medium">
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle
            Buchungen, Gutscheinkäufe und Leistungen, die über die Plattform
            Walk Throughz angeboten und Abgeschlossen werden.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            2. Leistungsbeschreibung
          </h2>
          <p className="mb-9 text-sm md:text-base leading-[150%] font-medium">
            Walk Throughz vermittelt kurze geführte Rundgänge („Walk Throughz“)
            durch ausgewählte Locations in der Stadt – etwa Stores, Ateliers,
            Cafés oder andere besondere Orte. Die Durchführung erfolgt durch die
            jeweilige Location oder eine von Walk Throughz beauftragte Person.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            3. Buchung und Vertragsabschluss
          </h2>
          <p className="mb-9 text-sm md:text-base leading-[150%] font-medium">
            Die Buchung eines Walk Throughz erfolgt online über unsere
            Plattform. Mit Abschluss der Buchung kommt ein verbindlicher Vertrag
            zwischen der buchenden Person und Walk Throughz zustande.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            4. Stornierung und Umbuchung
          </h2>
          <p className="mb-4 text-sm md:text-base leading-[150%] font-medium">
            Eine Stornierung nach erfolgter Buchung ist grundsätzlich nicht
            vorgesehen. Wir wissen jedoch, dass manchmal etwas dazwischenkommen
            kann. Daher empfehlen wir, in jedem Fall Kontakt mit uns
            aufzunehmen, wenn du deine Teilnahme nicht wahrnehmen kannst.
          </p>
          <p className="mb-4 text-sm md:text-base leading-[150%] font-medium">
            Wir bemühen uns, gemeinsam mit der betreffenden Location eine Lösung
            zu finden – etwa eine Umbuchung. Ob dies möglich ist, hängt jedoch
            von verschiedenen Faktoren ab, darunter:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-9 text-sm md:text-base leading-[150%] font-medium">
            <li>Die Reaktionsbereitschaft und Flexibilität der Location</li>
            <li>Die verbleibende Zeit bis zum geplanten Termin</li>
            <li>
              Organisatorische und kapazitive Möglichkeiten auf unserer Seite
            </li>
          </ul>
          <p className="mb-9 text-sm md:text-base leading-[150%] font-medium">
            Ein rechtlicher Anspruch auf Umbuchung oder Erstattung besteht
            nicht.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            5. Gutscheine
          </h2>
          <p className="mb-4 text-sm md:text-base leading-[150%] font-medium">
            Gutscheine können online über Walk Throughz erworben und für alle
            verfügbaren Walk Throughz eingelöst werden.
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-9 text-sm md:text-base leading-[150%] font-medium">
            <li>Sie sind ab dem Kaufdatum drei Jahre lang gültig.</li>
            <li>Eine Barauszahlung ist ausgeschlossen.</li>
            <li>
              Gutscheine sind übertragbar, jedoch nicht für gewerbliche Zwecke
              ohne vorherige Zustimmung von Walk Throughz nutzbar.
            </li>
            <li>Bei Verlust übernehmen wir keine Haftung.</li>
            <li>
              Eine Kombination mit Sonderaktionen oder Rabatten kann
              ausgeschlossen sein.
            </li>
          </ul>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            6. Firmenbuchungen / Gruppenbuchungen
          </h2>
          <p className="mb-4 text-sm md:text-base leading-[150%] font-medium">
            Für Unternehmen, Organisationen oder größere Gruppen (i.d.R. ab 6
            Personen) bieten wir individuelle Buchungsoptionen an.
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-9 text-sm md:text-base leading-[150%] font-medium">
            <li>
              Die Buchung erfolgt nach schriftlicher Absprache (z. B. per
              E-Mail).
            </li>
            <li>
              Preise, Ablauf und Inhalte können individuell angepasst werden.
            </li>
            <li>
              Eine verbindliche Buchung entsteht mit schriftlicher Bestätigung
              und ggf. einer Anzahlung.
            </li>
            <li>
              Bei Absage von Gruppenbuchungen gelten gesonderte
              Stornierungsbedingungen, die vorab kommuniziert werden.
            </li>
          </ul>
          <p className="mb-9 text-sm md:text-base leading-[150%] font-medium">
            Wir behalten uns vor, bei kurzfristigen Absagen Stornogebühren zu
            berechnen, insbesondere wenn bereits Vorbereitungen durch Locations
            erfolgt sind.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">7. Haftung</h2>
          <p className="mb-9 text-sm md:text-base leading-[150%] font-medium">
            Walk Throughz haftet nicht für kurzfristige Änderungen, Absagen oder
            qualitative Abweichungen, die von der durchführenden Location zu
            vertreten sind. Für Schäden, die während eines Walk Throughs
            entstehen, haften wir nur im Rahmen der gesetzlichen Vorschriften
            und nur bei grober Fahrlässigkeit oder Vorsatz durch unsere eigene
            Organisation.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            8. Teilnahmebedingungen
          </h2>
          <p className="mb-9 text-sm md:text-base leading-[150%] font-medium">
            Teilnehmerinnen sind verpflichtet, pünktlich am vereinbarten
            Treffpunkt zu erscheinen und die Regeln der jeweiligen Location zu
            respektieren. Walk Throughz behält sich vor, Teilnehmerinnen in
            Ausnahmefällen auszuschließen, wenn der Ablauf gestört wird.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            9. Datenschutz
          </h2>
          <p className="mb-9 text-sm md:text-base leading-[150%] font-medium">
            Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer
            separaten Datenschutzerklärung, die auf der Website einsehbar ist.
          </p>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            10. Schlussbestimmungen
          </h2>
          <p className="mb-4 text-sm md:text-base leading-[150%] font-medium">
            Erfüllungsort ist Frankfurt am Main.
          </p>
          <p className="mb-4 text-sm md:text-base leading-[150%] font-medium">
            Es gilt deutsches Recht.
          </p>
          <p className="mb-9 text-sm md:text-base leading-[150%] font-medium">
            Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die
            Wirksamkeit der übrigen Bestimmungen unberührt.
          </p>
        </div>
      </div>
    </div>
  );
}
