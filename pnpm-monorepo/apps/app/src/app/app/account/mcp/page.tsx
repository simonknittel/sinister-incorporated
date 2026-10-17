import { getApplicationContext } from "@/modules/application";
import { requireAuthenticationPage } from "@/modules/auth/server";
import Note from "@/modules/common/components/Note";
import { SuspenseWithErrorBoundaryTile } from "@/modules/common/components/SuspenseWithErrorBoundaryTile";
import { ConnectedClientsTile } from "@/modules/mcp-settings/components/ConnectedClientsTile";
import { McpConnectionTile } from "@/modules/mcp-settings/components/McpConnectionTile";
import { McpToolSettingsTile } from "@/modules/mcp-settings/components/McpToolSettingsTile";
import { isMcpServerDisabled } from "@/modules/oauth/utils/isMcpServerDisabled";
import { UserRole } from "@sam-monorepo/database/browser";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP",
};

/**
 * The page stays available while the kill switch is on: it only manages
 * the settings
 */
export default async function Page() {
  const { session } = await requireAuthenticationPage("/app/account/mcp");

  return (
    <div className="flex flex-col gap-4">
      {(await isMcpServerDisabled()) && (
        <Note
          type="warning"
          message="Der MCP-Server ist zurzeit abgeschaltet. Verbundene Clients können SAM nicht nutzen, und neue Clients können sich nicht verbinden. Deine Einstellungen bleiben erhalten."
        />
      )}

      <McpConnectionTile
        mcpUrl={getApplicationContext().urls.mcpResourceUrl.href}
      />

      <SuspenseWithErrorBoundaryTile>
        <ConnectedClientsTile
          canManageAdminMode={session.user.role === UserRole.ADMIN}
        />
      </SuspenseWithErrorBoundaryTile>

      <SuspenseWithErrorBoundaryTile>
        <McpToolSettingsTile />
      </SuspenseWithErrorBoundaryTile>
    </div>
  );
}
