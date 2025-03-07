import { authenticatePage } from "@/auth/server";
import image20250227Dropdown from "@/changelog/assets/2025-02-27-dropdown.png";
import image20250228PenaltyPoints from "@/changelog/assets/2025-02-28-penalty-points.png";
import image20250302SilcDashboard from "@/changelog/assets/2025-03-02-silc-dashboard.png";
import image20250302SilcOverview from "@/changelog/assets/2025-03-02-silc-overview.png";
import image20250302SilcTransactions from "@/changelog/assets/2025-03-02-silc-transactions.png";
import image20250303SilcAuecConversionRate from "@/changelog/assets/2025-03-03-silc-auec-conversion-rate.png";
import image20250303SilcStatistics from "@/changelog/assets/2025-03-03-silc-statistics.png";
import { Hero } from "@/common/components/Hero";
import { type Metadata } from "next";
import Image from "next/image";
import { type ReactNode } from "react";
import { FaCalendar } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Changelog | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await authenticatePage("/app/changelog");

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Changelog" withGlitch />
      </div>

      <div className="flex flex-col gap-4 max-w-prose mt-4 lg:mt-8 mx-auto">
        <Day heading="7. März 2025">
          <DayItem heading="Fix: Eventaufstellung">
            <p>
              Es wurde ein Fehler behoben, wenn ein Eventteilnehmer absagt,
              allerdings einem Posten zugeteilt war.
            </p>
          </DayItem>
        </Day>

        <Day heading="5. März 2025">
          <DayItem heading="Eventaufstellung">
            <p>
              Es gibt nun einen Button um alle Positionen auf- oder zuzuklappen.
            </p>
          </DayItem>

          <DayItem heading="SILC">
            <p>
              In der SILC-Übersicht gibt es nun eine neue Spalte, welche die
              gesamt verdienten SILC pro Citizen anzeigt.
            </p>
          </DayItem>

          <DayItem heading="Visuelle Optimierungen">
            <p>Es wurden diverse visuelle Optimierungen vorgenommen.</p>
          </DayItem>
        </Day>

        <Day heading="3. März 2025">
          <DayItem heading="SILC: aUEC Umrechnungskurs">
            <p>
              Im SILC-System kann nun ein Umrechnungskurs zu aUEC konfiguriert
              werden. Hierzu gibt es auch eine neue Berechtigung.
            </p>

            <p>
              Zudem wird in der Übersicht nun angezeigt wie viel SILC im Umlauf
              ist.
            </p>

            <Image
              src={image20250303SilcAuecConversionRate}
              alt=""
              loading="lazy"
              className="self-center"
            />

            <Image
              src={image20250303SilcStatistics}
              alt=""
              loading="lazy"
              className="self-center"
            />
          </DayItem>

          <DayItem heading="Bug: SILC-Kontostände">
            <p>
              Es wurde ein Fehler behoben, welcher verhinderte, dass der
              SILC-Kontostand eines Citizen korrekt berechnet wird, wenn alle
              seine Transaktionen gelöscht wurden.
            </p>
          </DayItem>
        </Day>

        <Day heading="2. März 2025">
          <DayItem heading="SILC MVP">
            <p>Die erste Version des SILC-System ist nun implementiert.</p>

            <p>
              Citizen mit entsprechenden Berechtigungen können SILC an andere
              Citizen verteilen und die aktuellen Kontostände einsehen.
            </p>

            <p>
              Hierzu gibt es zwei neue Seiten: Übersicht und Transaktionen. In
              der Übersicht werden die aktuellen Kontostände aller Citizen
              aufgelistet. In den Transaktionen können chronologisch die
              einzelnen Transaktionen eingesehen werden.
            </p>

            <Image
              src={image20250302SilcOverview}
              alt=""
              loading="lazy"
              className="self-center"
            />

            <Image
              src={image20250302SilcTransactions}
              alt=""
              loading="lazy"
              className="self-center"
            />

            <p>
              In der Profilkachel können Citizen ihre eigenen SILC einsehen.
            </p>

            <Image
              src={image20250302SilcDashboard}
              alt=""
              loading="lazy"
              className="self-center"
            />

            <p>
              Die Berechtigungen, um auf die einzelnen Funktionen zugreifen zu
              können, werden zeitnahe verteilt.
            </p>
          </DayItem>
        </Day>

        <Day heading="28. Februar 2025">
          <DayItem heading="Eigene Strafpunkte im Dashboard">
            <p>
              Im Profil auf dem Dashboard können nun die eigenen aktiven
              Strafpunkte eingesehen werden.
            </p>

            <p>
              Diese Funktion muss von der Leitung freigeschaltet werden, bevor
              sie sichtbar wird.
            </p>

            <Image src={image20250228PenaltyPoints} alt="" loading="lazy" />
          </DayItem>

          <DayItem heading="Fix: Eventaufstellung">
            <p>
              Wenn ein Posten kein Schiff vorraussetzt, werden die Teilnehmer
              nun auch hier korrekt im Dropdown einsortiert.
            </p>
          </DayItem>
        </Day>

        <Day heading="27. Februar 2025">
          <DayItem heading="Eventaufstellung">
            <p>
              Teilnehmer im Dropdown zur Zuordnung von Teilnehmern zu einem
              Posten, werden nun in den richtigen Abschnitt sortiert - je
              nachdem, ob sie die Anforderungen erfüllen oder nicht.
            </p>

            <Image src={image20250227Dropdown} alt="" loading="lazy" />
          </DayItem>

          <DayItem heading="Fix: Discord-Verlinkung">
            <p>
              Die Discord-Verlinkungen von Events im Dashboard führen nun wieder
              korrekt zu Discord.
            </p>
          </DayItem>
        </Day>

        <Day heading="25. Februar 2025">
          <DayItem heading="Abgesagte Events">
            <p>
              Wenn in Discord ein Event abgesagt wird, wird dieses nun auch ins
              S.A.M. synchronisiert. Hier gibt es nun die Möglichkeit sich vom
              S.A.M. eine Benachrichtigung zuschicken zu lassen. Hierzu einfach
              auf die rote Glocke im Dashboard klicken.
            </p>
          </DayItem>

          <DayItem heading="Vergangene Events">
            <p>
              Unter der Auflistung der anstehenden Events im Dashboard gibt es
              nun einen Link um sich vergangene Events anzeigen zu lassen.
            </p>

            <p>
              Diese Events sind nur bearbeitebar (z.B. Aufstellung) während
              diese noch nicht beendet sind. Hat das Event keine Endzeit
              eingetragen, gilt: Startzeit + vier Stunden.
            </p>

            <p>
              Es werden nur Events seit gestern angezeigt. Ältere Events werden
              nicht nachgetragen.
            </p>
          </DayItem>

          <DayItem heading="Changelog">
            <p>
              Es wurde ein Changelog implementiert. Hier werden zukünftig alle
              großen und kleinen Änderungen vom S.A.M. kommuniziert.
            </p>
          </DayItem>
        </Day>

        <Day heading="24. Februar 2025">
          <DayItem heading="Discord-Synchronisierung">
            <p>
              Die Synchronisation der Events zwischen Discord und S.A.M. wurde
              überarbeitet. Die Synchronisierung läuft alle zwei Minuten. Es
              werden nur noch Teilnehmer angezeigt, welche einen Spynet-Eintrag
              haben. Die Überarbeitung behebt Probleme mit dem Rate Limiting von
              Discord. Zudem ist sie für zukünftige Features notwendig.
            </p>
          </DayItem>

          <DayItem heading="Dokumente">
            <p>
              Das Akkordion auf der Dokumente-Seite wurde entfernt. Damit sind
              nun alle Dokumente direkt sichtbar.
            </p>
          </DayItem>

          <DayItem heading="Bilder">
            <p>
              Alle Bilder werden nun lazy geladen. Dies verbessert die Ladezeit
              der Seite.
            </p>
          </DayItem>

          <DayItem heading="Fix: Hersteller-Logos">
            <p>
              Es wurde ein Fehler mit den Hersteller-Logos behoben. Diese werden
              nun wieder angezeigt.
            </p>
          </DayItem>
        </Day>

        <Day heading="23. Februar 2025">
          <DayItem heading="Neue Dokumente">
            <p>
              Es wurden neue Dokumente für diverse Zertifikate hinzugefügt.
              Diese werden freigeschaltet, sobald diese vollständig sind.
            </p>
          </DayItem>

          <DayItem heading="Bilder">
            <p>
              Das Caching von Bildern wurde angepasst. Dies verbessert die
              Ladezeit der Seite.
            </p>
          </DayItem>

          <DayItem heading="Styling">
            <p>Es wurden kleinere visuelle Optimierungen vorgenommen.</p>
          </DayItem>
        </Day>

        <Day heading="22. Februar 2025">
          <DayItem heading="Teilnehmer ohne Posten">
            <p>
              Die Eventaufstellung hat nun einen neuen Abschnitt, welche
              Teilnehmer auflistet, die noch keinem Posten zugeordnet sind.
              Diese Liste ist alphabetisch sortiert.
            </p>
          </DayItem>

          <DayItem heading="Dashboard-Events">
            <p>
              Die Events auf dem Dashboard haben nun einen Link, welcher direkt
              zur Aufstellung führt. Dazu wurden kleinere visuelle Optimierungen
              vorgenommen.
            </p>
          </DayItem>

          <DayItem heading="Bilder">
            <p>
              Die Einbindung von SVG-Bildern wurde überarbeitet. Dies verbessert
              die Ladezeit der Seite.
            </p>
          </DayItem>

          <DayItem heading="noreferrer">
            <p>
              Alle externen Links haben nun das Attribut{" "}
              <code>rel=&quot;noreferrer&quot;</code>. Dies verbessert den
              Datenschutz der Seite.
            </p>
          </DayItem>
        </Day>

        <Day heading="20. Februar 2025">
          <DayItem heading="Eventaufstellung">
            <p>
              In dem Dropdown zur Zuordnung von Teilnehmer zu einem Posten
              werden nun alle Eventteilnehmer aufgelistet.
            </p>

            <p>
              Der Hinweis, dass der Teilnehmer nicht alle Anforderungen erfüllt,
              wird nun als Tooltip anstatt einem Modal dargestellt. Dies
              verbessert die Usability der Seite.
            </p>
          </DayItem>
        </Day>

        <Day heading="19. Februar 2025">
          <DayItem heading="Eventaufstellung">
            <p>
              Es wird nun ein Hinweis angezeigt, wenn der Teilnehmer nicht alle
              Anforderungen erfüllt.
            </p>

            <p>
              Es wurden diverse Tooltips hinzugefügt, welche das Anlegen von
              Posten erklären.
            </p>

            <p>
              Wenn ein Posten aufgeklappt wurde, wird dieses nun für den
              aktuellen Browser gespeichert.
            </p>

            <p>
              Beim Anlegen eines Postens gibt es nun einen Button
              &quot;Speichern und weiteren Posten erstellen&quot;. Dies
              erleichtert das Anlegen von vielen Posten.
            </p>
          </DayItem>
        </Day>

        <Day heading="18. Februar 2025">
          <DayItem heading="Eventaufstellung">
            <p>
              Einem Event kann nun eine Aufstellung hinzugefügt werden. Die
              Aufstellung besteht aus Posten und Teilnehmern. Ein Teilnehmer
              kann sich für mehrere Posten bewerben. Vor Eventbeginn ordnet der
              Organisator die Teilnehmer den Posten zu.
            </p>

            <p>
              Die Aufstellung kann vom Eventorganisator (Discord) und Rängen mit
              der jeweiligen Berechtigung bearbeitet werden.
            </p>

            <p>
              Zukünftig können an die Posten Bedingungen (Schiff, Rang) geknüpft
              werden.
            </p>
          </DayItem>
        </Day>

        <Day heading="16. Februar 2025">
          <DayItem heading="Strafpunktesystem">
            <p>
              Die erste Version des Strafpunktesystems wurde implementiert.
              Benutzer mit entsprechender Berechtigung können Strafpunkte
              vergeben und haben eine Übersicht über alle aktiven Strafpunkte.
            </p>

            <p>
              Einem Strafpunkteeintrag kann eine Begründung und ein Ablaufdatum
              gegeben werden.
            </p>

            <p>
              Zukünftig sollen Benutzer ihre eigenen Strafpunkte einsehen
              können.
            </p>
          </DayItem>

          <DayItem heading="prefers-reduced-motion">
            <p>
              Die flackernden Überschriften werden nun deaktiviert, wenn der
              Browser die prefers-reduced-motion-Einstellung aktiviert hat.
            </p>
          </DayItem>

          <DayItem heading="Eventstandort">
            <p>
              In den Eventdetails wird nun der eingetragene Standort aus Discord
              angezeigt.
            </p>
          </DayItem>

          <DayItem heading="Flotte">
            <p>
              Unter der Überschrift wird nun angezeigt wie viele Benutzer mind.
              ein Schiff eingetragen haben.
            </p>
          </DayItem>
        </Day>

        <small className="self-center italic">
          Ältere Einträge werden nicht nachgetragen
        </small>
      </div>
    </main>
  );
}

type DayProps = Readonly<{
  heading: ReactNode;
  children: ReactNode;
}>;

const Day = ({ heading, children }: DayProps) => {
  return (
    <article className="bg-neutral-800/50 rounded-2xl p-4 lg:p-8">
      <h2 className="font-bold text-xl flex gap-3 items-center">
        <FaCalendar className="text-neutral-500" />
        {heading}
      </h2>

      <ul className="flex flex-col gap-6 mt-4 pl-2">{children}</ul>
    </article>
  );
};

type DayItemProps = Readonly<{
  heading: ReactNode;
  children: ReactNode;
}>;

const DayItem = ({ heading, children }: DayItemProps) => {
  return (
    <li className="border-l-2 border-neutral-800/80 pl-5">
      <strong className="block font-bold">{heading}</strong>

      <div className="mt-1 flex flex-col gap-2">{children}</div>
    </li>
  );
};
