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
      <div>
        <p>Das SAM stellt einen remote (HTTP Transport) MCP-Server zur Verfügung.</p>
        <p className="text-sm text-neutral-500 mt-2">URL</p>
        <CopyableCode value={mcpUrl} />
      </div>

      <details className="group">
        <summary className="cursor-pointer list-none rounded-secondary px-2 py-1 font-bold hover:bg-neutral-800 focus-visible:bg-neutral-800 focus-visible:outline-none active:bg-neutral-700">
          <span className="mr-2 inline-block transition-transform group-open:rotate-90 motion-reduce:transition-none">
            &rsaquo;
          </span>
          Anleitung
        </summary>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <ClientSteps title="Claude.ai und Claude Desktop">
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

        <ClientSteps title="ChatGPT">
          <li>
            Öffne in ChatGPT &bdquo;Settings&ldquo; &rarr;
            &bdquo;Connectors&ldquo; und schalte unter &bdquo;Advanced&ldquo;
            den &bdquo;Developer mode&ldquo; ein.
          </li>
          <li>
            Wähle &bdquo;Create&ldquo;, gib einen Namen (zum Beispiel
            &bdquo;SAM&ldquo;) und die URL ein und wähle als Authentifizierung
            &bdquo;OAuth&ldquo;.
          </li>
          <li>Wähle &bdquo;Create&ldquo; und erlaube den Zugriff in SAM.</li>
        </ClientSteps>

        <ClientSteps title="Codex">
          <li>
            Führe diesen Befehl aus:
            <CopyableCode value={`codex mcp add sam --url ${mcpUrl}`} />
          </li>
          <li>
            Melde dich mit diesem Befehl an:
            <CopyableCode value="codex mcp login sam" />
          </li>
          <li>Erlaube den Zugriff in SAM.</li>
        </ClientSteps>
        </div>
      </details>
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
