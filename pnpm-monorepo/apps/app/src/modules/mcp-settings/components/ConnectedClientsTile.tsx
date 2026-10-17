import { TRow } from "@/modules/common/components/Table";
import {
  TableTile,
  type TableColumn,
} from "@/modules/common/components/TableTile";
import { formatDate } from "@/modules/common/utils/formatDate";
import type { OwnGrant } from "@sam-monorepo/application";
import clsx from "clsx";
import { getMyOAuthGrants } from "../queries/getMyOAuthGrants";
import { OAuthGrantAdminModeSwitch } from "./OAuthGrantAdminModeSwitch";
import { RevokeOAuthGrantButton } from "./RevokeOAuthGrantButton";

const BASE_COLUMNS: TableColumn[] = [
  {
    key: "clientHost",
    label: "Client",
    track: "minmax(160px,1fr)",
    minWidth: 160,
  },
  {
    key: "clientName",
    label: "Name",
    track: "minmax(140px,1fr)",
    minWidth: 140,
  },
  {
    key: "redirectHost",
    label: "Weiterleitung",
    track: "minmax(120px,1fr)",
    minWidth: 120,
  },
  { key: "createdAt", label: "Verbunden am", track: "150px", minWidth: 150 },
  {
    key: "lastUsedAt",
    label: "Zuletzt verwendet",
    track: "150px",
    minWidth: 150,
  },
];

const ADMIN_MODE_COLUMN: TableColumn = {
  key: "adminMode",
  label: "Admin-Modus",
  track: "110px",
  minWidth: 110,
};

const ACTIONS_COLUMN: TableColumn = {
  key: "actions",
  label: "Aktionen",
  track: "110px",
  minWidth: 110,
  headerClassName: "sr-only",
};

interface Props {
  readonly className?: string;
  /** True for an admin: only an admin can enable admin mode for a client */
  readonly canManageAdminMode: boolean;
}

export const ConnectedClientsTile = async ({
  className,
  canManageAdminMode,
}: Props) => {
  const grants = await getMyOAuthGrants();

  const columns = canManageAdminMode
    ? [...BASE_COLUMNS, ADMIN_MODE_COLUMN, ACTIONS_COLUMN]
    : [...BASE_COLUMNS, ACTIONS_COLUMN];

  return (
    <TableTile
      className={className}
      heading="Verbundene Clients"
      columns={columns}
      isEmpty={grants.length === 0}
      emptyMessage="Du hast noch keinen Client verbunden."
      bodyClassName="text-sm"
      footer={
        <p className="text-center text-sm text-neutral-500">
          Den Namen gibt der Client selbst an. Prüfe deshalb die Adresse in der
          Spalte &bdquo;Client&ldquo;. &bdquo;Zuletzt verwendet&ldquo; ändert
          sich höchstens einmal pro Stunde.
          {canManageAdminMode &&
            " Der Admin-Modus gibt einem Client alle Berechtigungen, solange du Admin bist."}
        </p>
      }
    >
      {grants.map((grant) => (
        <ConnectedClientRow
          key={grant.id}
          grant={grant}
          canManageAdminMode={canManageAdminMode}
        />
      ))}
    </TableTile>
  );
};

interface ConnectedClientRowProps {
  readonly grant: OwnGrant;
  readonly canManageAdminMode: boolean;
}

const ConnectedClientRow = ({
  grant,
  canManageAdminMode,
}: ConnectedClientRowProps) => {
  return (
    <TRow className="min-h-10">
      <td className="truncate font-bold" title={grant.clientId}>
        {grant.clientHost}
      </td>

      <td className="truncate" title={grant.clientName}>
        {grant.clientName}
      </td>

      <td className="truncate" title={grant.redirectHost}>
        {grant.redirectHost}
      </td>

      <td>{formatDate(grant.createdAt)}</td>

      <td className={clsx({ "text-neutral-500": !grant.lastUsedAt })}>
        {formatDate(grant.lastUsedAt) ?? "Noch nie"}
      </td>

      {canManageAdminMode && (
        <td>
          <OAuthGrantAdminModeSwitch
            grantId={grant.id}
            clientHost={grant.clientHost}
            isEnabled={grant.adminModeEnabledAt !== null}
          />
        </td>
      )}

      <td>
        <RevokeOAuthGrantButton
          grantId={grant.id}
          clientHost={grant.clientHost}
        />
      </td>
    </TRow>
  );
};
