import { Tile } from "@/modules/common/components/Tile";
import {
  getMyMcpToolSettings,
  type McpToolSettingsGroup,
  type McpToolWithSetting,
} from "../queries/getMyMcpToolSettings";
import { McpToolSwitch } from "./McpToolSwitch";

interface Props {
  readonly className?: string;
}

export const McpToolSettingsTile = async ({ className }: Props) => {
  const groups = await getMyMcpToolSettings();

  return (
    <Tile
      className={className}
      heading="Tools"
      childrenClassName="flex flex-col gap-6"
    >
      {groups.map((group) => (
        <ToolGroupSettings key={group.group} group={group} />
      ))}
    </Tile>
  );
};

interface ToolGroupSettingsProps {
  readonly group: McpToolSettingsGroup;
}

const ToolGroupSettings = ({ group }: ToolGroupSettingsProps) => {
  return (
    <section>
      <h3 className="border-b border-white/5 pb-2 font-mono font-bold uppercase">
        {group.title}
      </h3>

      <ul className="flex flex-col divide-y divide-white/5">
        {group.tools.map((tool) => (
          <ToolSettingRow key={tool.name} tool={tool} />
        ))}
      </ul>
    </section>
  );
};

interface ToolSettingRowProps {
  readonly tool: McpToolWithSetting;
}

const ToolSettingRow = ({ tool }: ToolSettingRowProps) => {
  return (
    <li className="flex items-center gap-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h4 className="font-bold">{tool.title}</h4>
          <code className="font-mono text-xs break-all text-neutral-500">
            {tool.name}
          </code>
        </div>

        <p className="mt-1 max-w-prose text-sm text-neutral-500">
          {tool.description}
        </p>
      </div>

      <McpToolSwitch
        className="flex-none"
        toolName={tool.name}
        toolTitle={tool.title}
        isEnabled={tool.isEnabled}
      />
    </li>
  );
};
