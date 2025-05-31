import { authenticatePage } from "@/auth/server";
import image20250227Dropdown from "@/changelog/assets/2025-02-27-dropdown.png";
import image20250228PenaltyPoints from "@/changelog/assets/2025-02-28-penalty-points.png";
import image20250302SilcDashboard from "@/changelog/assets/2025-03-02-silc-dashboard.png";
import image20250302SilcOverview from "@/changelog/assets/2025-03-02-silc-overview.png";
import image20250302SilcTransactions from "@/changelog/assets/2025-03-02-silc-transactions.png";
import image20250303SilcAuecConversionRate from "@/changelog/assets/2025-03-03-silc-auec-conversion-rate.png";
import image20250303SilcStatistics from "@/changelog/assets/2025-03-03-silc-statistics.png";
import image20250309LineupCreateChild from "@/changelog/assets/2025-03-09-lineup-create-child.png";
import image20250309LineupGroups from "@/changelog/assets/2025-03-09-lineup-groups.png";
import image20250315EventManagers from "@/changelog/assets/2025-03-15-event-managers.png";
import image20250315LineupEnabled from "@/changelog/assets/2025-03-15-lineup-enabled.png";
import image20250322RequiredVariantsEdit from "@/changelog/assets/2025-03-22-required-variants-edit.png";
import image20250322RequiredVariantsTooltip from "@/changelog/assets/2025-03-22-required-variants-tooltip.png";
import image20250323LineupDragNDrop from "@/changelog/assets/2025-03-23-lineup-dragndrop.png";
import image20250329CitizenHandle from "@/changelog/assets/2025-03-29-citizen-handle.png";
import image20250516CornerstoneImageBrowser from "@/changelog/assets/2025-05-16-cornerstone-image-browser.png";
import image20250529LogAnalyzer from "@/changelog/assets/2025-05-29-log-analyzer.png";
import image20250531Overlay from "@/changelog/assets/2025-05-31-overlay.png";
import { Hero } from "@/common/components/Hero";
import { Link } from "@/common/components/Link";
import { random } from "lodash";
import { LoremIpsum } from "lorem-ipsum";
import { type Metadata } from "next";
import Image from "next/image";
import { type ReactNode } from "react";
import { FaCalendar } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Changelog | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/changelog");
  const showLogAnalyzer = await authentication.authorize("logAnalyzer", "read");

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Changelog" withGlitch />
      </div>

      <div className="flex flex-col gap-4 max-w-prose mt-4 lg:mt-8 mx-auto">
        <Day heading="31. Mai 2025">
          {showLogAnalyzer ? (
            <DayItem heading="Log Analyzer">
              <p>
                Es gibt nun ein Overlay, welches über dem Star Citizen Fenster
                positioniert werden kann.
              </p>

              <Image
                quality={100}
                src={image20250531Overlay}
                alt=""
                loading="lazy"
                className="self-center"
              />
            </DayItem>
          ) : (
            <RedactedDayItem />
          )}
        </Day>

        <Day heading="30. Mai 2025">
          {showLogAnalyzer ? (
            <DayItem heading="Log Analyzer">
              <p>
                Die Handles im Log Analyzer verlinken nun zu den Profilen auf
                der Seite von Roberts Space Industries.
              </p>

              <p>
                Es kann nun ein Interval aktiviert werden, durch welchen die
                Logs alle 10 Sekunden aktualisiert werden. Neue Einträge werden
                für 30 Sekunden hervorgehoben.
              </p>
            </DayItem>
          ) : (
            <RedactedDayItem />
          )}
        </Day>

        <Day heading="29. Mai 2025">
          <DayItem heading="Events">
            <p>
              Änderung: Der Eventorganisator wird nun nicht mehr automatisch in
              der Teilnehmerliste mit aufgenommen, wenn er in Discord nicht auf
              Teilnehmen geklickt hat.
            </p>
          </DayItem>

          {showLogAnalyzer ? (
            <DayItem heading="Log Analyzer">
              <p>
                Unter Tools gibt es nun den{" "}
                <Link
                  href="/app/tools/log-analyzer"
                  className="text-interaction-500 hover:text-interaction-300 focus-visible:text-interaction-300"
                >
                  Log Analyzer
                </Link>
                . Dieser wertet die Game Logs von Star Citizen aus um nach Kills
                zu filtern.
              </p>

              <Image
                quality={100}
                src={image20250529LogAnalyzer}
                alt=""
                loading="lazy"
                className="self-center"
              />
            </DayItem>
          ) : (
            <RedactedDayItem />
          )}
        </Day>

        <Day heading="25. Mai 2025">
          <DayItem heading="Tasks">
            <p>
              Für personalisierte und Gruppen-Tasks gibt es nun die Möglichkeit,
              dass diese von den zugewiesenen Citizen selbstständig
              abgeschlossen werden können. Diese Option kann unter dem Reiter
              &ldquo;Zielgruppe&rdquo; beim Erstellen eines Tasks aktiviert
              werden.
            </p>
          </DayItem>
        </Day>

        <Day heading="17. Mai 2025">
          <DayItem heading="Cornerstone Image Browser">
            <p>
              Es stehen nun auch die Bilder für Hüte, Brillen, Handschuhe,
              Jacken, Oberteile, Jumpsuits, Hosen und Schuhe zur Verfügung.
            </p>
          </DayItem>

          <DayItem heading="Tasks: GitHub Flavored Markdown">
            <p>
              Die Beschreibung und der Belohnungstext unterstützen nun{" "}
              <Link
                href="https://github.github.com/gfm/"
                target="_blank"
                className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300"
              >
                GitHub Flavored Markdown
              </Link>
              . Dadurch werden u.a. nun Links automatisch erkannt und
              Zeilenumbrüche können mit einem einfachen Enter gesetzt werden.
            </p>
          </DayItem>

          <DayItem heading="Tasks: Dashboard">
            <p>Angenommene Tasks werden nun zusätzlich im Dashboard gezeigt.</p>
          </DayItem>
        </Day>

        <Day heading="16. Mai 2025">
          <DayItem heading="Cornerstone Image Browser">
            <p>
              Unter dem Navigationspunkt <strong>Tools</strong> gibt es nun den
              <strong>Cornerstone Image Browser</strong>. Hier können die Bilder
              von Cornerstone nebeneinander dargestellt werden, um sie visuell
              einfach vergleichen zu können.
            </p>

            <Image
              quality={100}
              src={image20250516CornerstoneImageBrowser}
              alt=""
              loading="lazy"
              className="self-center"
            />
          </DayItem>

          <DayItem heading="Tasks">
            <p>
              Es wurde ein Fehler behoben, durch den das Teilnehmerlimit nicht
              auf unbegrenzt gestellt werden konnte.
            </p>
            <p>
              Es wurde ein Fehler behoben, durch den eine SILC-Belohnung nicht
              nachträglich verändert werden konnte.
            </p>
            <p>
              Es ist nun möglich eine negative SILC-Belohnung zu erstellen. Dies
              kann u.a. zum Verkauf von Gegenständen genutzt werden.
            </p>
            <p>
              Es wird nun in jedem Fall ein Hinweis angezeigt, wenn das Annehmen
              oder Aufgeben eines Tasks deaktiviert ist.
            </p>
            <p>
              Es wurden ein paar Texte verändert zur besseren Verständlichkeit.
            </p>
            <p>
              Es wurden ein paar visuelle Veränderungen vorgenommen zur besseren
              Verständlichkeit.
            </p>
          </DayItem>
        </Day>

        <Day heading="15. Mai 2025">
          <DayItem heading="Tasks">
            <p>
              Es gibt nun die Möglichkeit sich benachrichtigen zu lassen, wenn
              einem ein Task zugewiesen wird.
            </p>
          </DayItem>
        </Day>

        <Day heading="13. Mai 2025">
          <DayItem heading="Tasks">
            <p>
              Die Beschreibung und der Belohungstext unterstützen nun
              Markdown-Formatierung.
            </p>
          </DayItem>
        </Day>

        <Day heading="12. Mai 2025">
          <DayItem heading="Tasks">
            <p>
              Die Details zu einem Task sind nun auf einer separaten Seiten zu
              finden.
            </p>
            <p>
              Beschreibung und Freitext-Belohnung können nun 2048 Zeichen lang
              sein.
            </p>
          </DayItem>
        </Day>

        <Day heading="2. Mai 2025">
          <DayItem heading="Neu: SILC-Gehälter">
            <p>
              Über SILC-Gehälter können Rollen einen monatlichen SILC-Betrag
              überwiesen werden.
            </p>
          </DayItem>
        </Day>

        <Day heading="23. April 2025">
          <DayItem heading="Tasks">
            <p>Weiterentwicklung des neuen Tasks System</p>

            <p>
              <strong>Sichtbarkeit auf Rollen einschränken</strong>
            </p>
            <p>
              Tasks können nun optional auf Rolle eingeschränkt werden. Hierbei
              gibt es die Möglichkeit den Task vollständig zu verstecken oder
              auf &ldquo;nicht-annehmbar&rdquo; zu schalten.
            </p>
          </DayItem>

          <DayItem heading="Eventbelohnung">
            <p>
              Im Teilnehmer-Reiter der Events gibt es nun eine Möglichkeit eine
              SILC-Transaktion zu starten, welche alle Teilnehmer vorausgefüllt
              hat. Vor dem Speichern können die Empfänger noch bearbeitet
              werden.
            </p>
          </DayItem>
        </Day>

        <Day heading="21. April 2025">
          <DayItem heading="Tasks">
            <p>Weiterentwicklung des neuen Tasks System</p>

            <p>
              <strong>Geschlossene Tasks</strong>
            </p>
            <p>
              Es gibt nun eine separate Ansicht für geschlossene Tasks (erfüllt,
              abgebrochen, abgelaufen).
            </p>

            <p>
              <strong>Tasks verwalten</strong>
            </p>
            <p>
              Citizen mit der Berechtigung <em>Tasks verwalten</em> sehen nun
              auch personalisierte Tasks, welche nicht von ihnen selber erstellt
              wurden.
            </p>
          </DayItem>
        </Day>

        <Day heading="14. April 2025">
          <DayItem heading="Tasks">
            <p>Weiterentwicklung des neuen Tasks System</p>

            <p>
              <strong>Wiederholungen</strong>
            </p>
            <p>
              Für Tasks kann nun eingestellt werden wie häufig dieser wiederholt
              werden kann. Wenn ein wiederholbarer Task abgeschlossen, wird
              dieser automatisiert dupliziert und neu erstellt.
            </p>
          </DayItem>
        </Day>

        <Day heading="13. April 2025">
          <DayItem heading="Tasks">
            <p>Weiterentwicklung des neuen Tasks System</p>

            <p>
              <strong>Gruppen-Tasks</strong>
            </p>
            <p>
              Erstelle eine Aufgabe und weise sie einer Gruppen von Citizen zu.
              Diese Aufgabe kann nur von ihnen gesehen und erfüllt werden.
            </p>

            <p>
              <strong>Task erstellen</strong>
            </p>
            <p>
              Bei Mehrfachauswahl von Citizen kann nun eine Rolle ausgewählt
              werden um direkt alle Citizen mit dieser Rolle hinzuzufügen.
            </p>

            <p>
              <strong>Task abschließen</strong>
            </p>
            <p>
              Im Bestätigungsdialog wird nun zusätzlich abgefragt wer den Task
              erfüllt hat.
            </p>
          </DayItem>
        </Day>

        <Day heading="12. April 2025">
          <DayItem heading="Tasks">
            <p>Die erste Version des Tasks System wurde implementiert.</p>

            <p>
              <strong>Öffentliche Tasks</strong>
            </p>
            <p>
              Erstelle eine Aufgabe, die von jemand beliebigen angenommen und
              erfüllt werden kann.
            </p>

            <p>
              <strong>Personalisierte Tasks</strong>
            </p>
            <p>
              Erstelle eine Aufgabe und weise sie einem bestimmten Citizen zu.
              Diese Aufgabe kann nur von ihm gesehen und erfüllt werden.
            </p>

            <p>
              <strong>Belohnungen</strong>
            </p>
            <p>
              Wähle zwischen SILC vom eigenen Konto, generieren von neuen SILC
              oder einem Freitext als Belohnung für das Erfüllen eines Tasks.
            </p>

            <p>
              <em>
                Das System befindet sich aktuell im Test und wird die nächsten
                Tage weiter ausgerollt.
              </em>
            </p>
          </DayItem>
        </Day>

        <Day heading="8. April 2025">
          <DayItem heading="Bug: Keinem Posten zugeordnet">
            <p>
              Es wurde ein Fehler behoben, welcher dazu führte, dass die Citizen
              in der Liste &ldquo;Keinem Posten zugeordnet&rdquo; nicht korrekt
              berechnet wurden.
            </p>
          </DayItem>
        </Day>

        <Day heading="5. April 2025">
          <DayItem heading="Filter">
            <p>
              In den Filtern für die Spynet-Listen muss nun nicht mehr auf
              Speichern geklickt werden.
            </p>
          </DayItem>
        </Day>

        <Day heading="29. März 2025">
          <DayItem heading="Suche nach Handle anstatt Sinister ID">
            <p>
              In diversen Formularen (Strafpunkteeintrag, Eventmanager, SILC
              Transaktion) kann nun ein Citizen durch seinen Handle gesucht und
              hinzugefügt werden anstatt der Sinister ID.
            </p>

            <Image
              quality={100}
              src={image20250329CitizenHandle}
              alt=""
              loading="lazy"
              className="self-center"
            />
          </DayItem>

          <DayItem heading="Bug: Korrekte Einordnung je nach Voraussetzung">
            <p>
              Es wurde ein Fehler in der Eventaufstellung behoben, welcher dazu
              führte, dass Citizen nicht korrekt eingeordnet wurden je nachdem,
              ob die Voraussetzungen (erforderliches Schiff) eines Posten
              erfüllt wurden oder nicht.
            </p>
          </DayItem>
        </Day>

        <Day heading="23. März 2025">
          <DayItem heading="Drag'n'Drop in der Eventaufstellung">
            <p>
              Die Posten in der Eventaufstellung können nun per
              Drag&apos;n&apos;Drop verschoben werden.
            </p>

            <p>
              Dazu einfach an den 6 Punkten an der linken Seite ziehen und den
              Posten dahin verschieben, wo er hin soll. Ablageflächen werden
              grün hervorgehoben. Wird ein Posten an die obere bzw. untere Kante
              eines anderen Posten gezogen, wird dieser davor bzw. danach
              eingeordnet. Wird ein Posten auf die untere rechte Ecke eines
              anderen Postens gezogen, wird dieser Posten als Kindposten
              eingeordnet.
            </p>

            <Image
              quality={100}
              src={image20250323LineupDragNDrop}
              alt=""
              loading="lazy"
              className="self-center"
            />
          </DayItem>
        </Day>

        <Day heading="22. März 2025">
          <DayItem heading="Alternativen zu erforderlichen Schiffen">
            <p>
              In der Eventaufstellung können nun mehrere Schiffe als
              erforderliches Schiff hinzugefügt werden.
            </p>

            <Image
              quality={100}
              src={image20250322RequiredVariantsTooltip}
              alt=""
              loading="lazy"
              className="self-center"
            />

            <Image
              quality={100}
              src={image20250322RequiredVariantsEdit}
              alt=""
              loading="lazy"
              className="self-center"
            />
          </DayItem>
        </Day>

        <Day heading="16. März 2025">
          <DayItem heading="Organisationen von Citizen">
            <p>
              Für Citizen im Spynet gibt es nun den
              &ldquo;Organisationen&rdquo;-Reiter. Dieser listet alle aktuellen
              Organisationen sowie den Verlauf von Ein- und Austritten (sofern
              eingetragen).
            </p>
          </DayItem>
        </Day>

        <Day heading="15. März 2025">
          <DayItem heading="Zusätzliche Eventmanager">
            <p>
              Events können nun zusätzliche Manager hinzugefügt werden. Diese
              haben die gleichen Berechtigungen wie die Organisatoren.
            </p>

            <Image
              quality={100}
              src={image20250315EventManagers}
              alt=""
              loading="lazy"
              className="self-center"
            />
          </DayItem>

          <DayItem heading="Eventaufstellung de-/aktivieren">
            <p>
              Die Aufstellung eines Events kann nun de-/aktiviert werden. Solang
              die Aufstellung deaktiviert ist, kann sie nur von einem
              Eventorganisator eingesehen und bearbeitet werden.
            </p>

            <Image
              quality={100}
              src={image20250315LineupEnabled}
              alt=""
              loading="lazy"
              className="self-center"
            />

            <p>Bei neuen Events ist die Aufstellung initial deaktiviert.</p>
          </DayItem>

          <DayItem heading="Laufende Events">
            <p>
              Aktuell laufende Events werden nun direkt im Dashboard gezeigt.
            </p>

            <p>
              Hierzu muss das Event ein eingetragenes Enddatum haben. FYI: Dies
              ist in Discord optional.
            </p>
          </DayItem>

          <DayItem heading="Super Hornets">
            <p>
              Die beiden Varianten der F7C-M Super Hornet Mk II wurden zu einer
              zusammengeführt.
            </p>
          </DayItem>
        </Day>

        <Day heading="9. März 2025">
          <DayItem heading="Gruppen in der Eventaufstellung">
            <p>Die Eventaufstellung kann nun in Gruppen unterteilt werden.</p>

            <Image
              quality={100}
              src={image20250309LineupGroups}
              alt=""
              loading="lazy"
              className="self-center"
            />

            <p>
              Es kann bis zu vier Ebenen geben. In jeder Ebene ist eine
              beliebige Kombination aus weiteren Gruppen und Posten möglich.
            </p>

            <p>
              Zum Anlegen einer Kindgruppe, auf folgendes Plus-Icon klicken:
            </p>

            <Image
              quality={100}
              src={image20250309LineupCreateChild}
              alt=""
              loading="lazy"
              className="self-center"
            />
          </DayItem>
        </Day>

        <Day heading="8. März 2025">
          <DayItem heading="Rework: Discord-Synchronisation">
            <p>
              Die Synchronisation mit Discord wurde erneut überarbeitet. Dies
              sollte die Synchronisation zuverlässiger machen.
            </p>
          </DayItem>

          <DayItem heading="Fix: Event-History">
            <p>
              Die Seite mit vergangenen Events wird nun wieder korrekt
              angezeigt.
            </p>
          </DayItem>
        </Day>

        <Day heading="7. März 2025">
          <DayItem heading="Zusagen im Dashboard">
            <p>
              Bei den Events auf dem Dashboard wird nun angezeigt, ob man selber
              zugesagt hat.
            </p>
          </DayItem>

          <DayItem heading="Eigene SILC-Transaktionen">
            <p>
              Ein Klick auf die Kachel mit dem eigenen SILC-Kontostand im
              Dashboard führt nun zu einer Übersicht mit den SILC-Transaktionen
              zum eigenen SILC-Konto.
            </p>
          </DayItem>

          <DayItem heading="Eigene Strafpunkte">
            <p>
              Ein Klick auf die Kachel mit den eigenen aktiven Strafpunkten im
              Dashboard führt nun zu einer Übersicht mit den eigenen
              Strafpunkten inkl. Begründung.
            </p>
          </DayItem>

          <DayItem heading="Eventaufstellung">
            <p>
              Der Name eines Posten kann nun direkt bearbeitet werden ohne das
              Modal öffnen zu müssen. Dazu einfach auf den Namen klicken und im
              Anschluss mit Enter bestätigen.
            </p>
          </DayItem>

          <DayItem heading="SILC-Transaktion erstellen">
            <p>
              Das Eingabefeld für die Sinister IDs ist nun ein Mehrzeilen-Feld
              um die Eingabe zu vereinfachen. Pro Zeile muss eine Sinister ID
              angegeben werden.
            </p>
          </DayItem>

          <DayItem heading="Fix: Eventaufstellung">
            <p>
              Es wurde ein Fehler behoben, wenn ein Eventteilnehmer absagt,
              allerdings einem Posten zugeteilt war.
            </p>
          </DayItem>

          <DayItem heading="Fix: Discord-Synchronisation">
            <p>
              Es wurden Fehler in der Synchronisation mit Discord behoben.
              Teilnehmer an einem Event sollten nun zuverlässiger synchronisiert
              werden.
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
              quality={100}
              src={image20250303SilcAuecConversionRate}
              alt=""
              loading="lazy"
              className="self-center"
            />

            <Image
              quality={100}
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
              quality={100}
              src={image20250302SilcOverview}
              alt=""
              loading="lazy"
              className="self-center"
            />

            <Image
              quality={100}
              src={image20250302SilcTransactions}
              alt=""
              loading="lazy"
              className="self-center"
            />

            <p>
              In der Profilkachel können Citizen ihre eigenen SILC einsehen.
            </p>

            <Image
              quality={100}
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

            <Image
              quality={100}
              src={image20250228PenaltyPoints}
              alt=""
              loading="lazy"
            />
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

            <Image
              quality={100}
              src={image20250227Dropdown}
              alt=""
              loading="lazy"
            />
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
      <h2 className="font-thin text-2xl flex gap-3 items-center">
        <FaCalendar className="text-neutral-500 text-base" />
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

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 3,
    min: 1,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

const RedactedDayItem = () => {
  return (
    <li className="border-l-2 border-neutral-800/80 pl-5 relative py-3 pr-3">
      <strong className="block font-bold">Lorem ipsum</strong>

      <div className="mt-1 flex flex-col gap-2">
        <p>{lorem.generateParagraphs(1)}</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center backdrop-blur">
        <p
          className="text-sinister-red-500 font-bold border-2 border-sinister-red-500 rounded px-2 py-1 text-lg relative"
          style={{
            transform: `rotate(${random(-15, 15)}deg)`,
            left: `${random(-100, 100)}px`,
          }}
        >
          Redacted
        </p>
      </div>
    </li>
  );
};
