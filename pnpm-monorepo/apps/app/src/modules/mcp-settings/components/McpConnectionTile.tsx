import { CopyToClipboard } from "@/modules/common/components/CopyToClipboard";
import { Tile } from "@/modules/common/components/Tile";
import type { ReactNode } from "react";

interface Props {
  readonly className?: string;
  /** The canonical URL of the MCP endpoint */
  readonly mcpUrl: string;
}

export const McpConnectionTile = ({ className, mcpUrl }: Props) => {
  return (
    <Tile
      className={className}
      heading="Verbinden"
      childrenClassName="flex flex-col gap-6"
    >
      <p className="max-w-prose">
        Über den MCP-Server greifen KI-Clients wie Claude auf SAM zu. Die
        Werkzeuge nutzen deine eigenen Rollen: Ein Client sieht und ändert nur,
        was du in SAM selbst sehen und ändern darfst.
      </p>

      <div>
        <p className="text-sm text-neutral-500">URL des MCP-Servers</p>
        <CopyableCode value={mcpUrl} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ClientSteps title="Claude.ai">
          <li>
            Öffne in Claude.ai &bdquo;Settings&ldquo; &rarr;
            &bdquo;Connectors&ldquo;.
          </li>
          <li>
            Wähle &bdquo;Add custom connector&ldquo; und gib einen Namen (zum
            Beispiel &bdquo;SAM&ldquo;) und die URL ein.
          </li>
          <li>Wähle &bdquo;Connect&ldquo; und erlaube den Zugriff in SAM.</li>
        </ClientSteps>

        <ClientSteps title="Claude Desktop">
          <li>
            Claude Desktop nutzt die Connectors deines Claude-Kontos. Einen
            Connector aus Claude.ai musst du nicht erneut hinzufügen.
          </li>
          <li>
            Sonst füge ihn unter &bdquo;Settings&ldquo; &rarr;
            &bdquo;Connectors&ldquo; wie in Claude.ai hinzu.
          </li>
          <li>Wähle &bdquo;Connect&ldquo; und erlaube den Zugriff in SAM.</li>
        </ClientSteps>

        <ClientSteps title="Claude Code">
          <li>
            Führe diesen Befehl aus:
            <CopyableCode
              value={`claude mcp add --transport http sam ${mcpUrl}`}
            />
          </li>
          <li>
            Gib in Claude Code &bdquo;/mcp&ldquo; ein, wähle &bdquo;sam&ldquo;
            und melde dich an.
          </li>
          <li>Erlaube den Zugriff in SAM.</li>
        </ClientSteps>
      </div>
    </Tile>
  );
};

interface CopyableCodeProps {
  readonly value: string;
}

const CopyableCode = ({ value }: CopyableCodeProps) => {
  return (
    <div className="mt-1 flex items-start gap-2 rounded-secondary bg-neutral-800 px-3 py-2">
      <code className="flex-1 font-mono text-sm wrap-anywhere">{value}</code>
      <CopyToClipboard value={value} className="mt-0.5 flex-none" />
    </div>
  );
};

interface ClientStepsProps {
  readonly title: string;
  /** The `<li>` elements of the steps */
  readonly children: ReactNode;
}

const ClientSteps = ({ title, children }: ClientStepsProps) => {
  return (
    <section className="min-w-0">
      <h3 className="font-bold">{title}</h3>

      <ol className="mt-2 flex list-decimal flex-col gap-2 pl-5 text-sm">
        {children}
      </ol>
    </section>
  );
};
