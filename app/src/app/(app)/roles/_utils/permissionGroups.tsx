import { FaCalendarDay, FaLock, FaSignInAlt } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill, RiSwordFill } from "react-icons/ri";

export const permissionGroups = [
  {
    name: "Login",
    icon: <FaSignInAlt />,
    permissions: [
      {
        name: "Kann sich anmelden",
        key: "login",
      },
    ],
  },
  {
    name: "Admin",
    icon: <FaLock />,
    permissions: [
      {
        name: "Rollen und Berechtigungen bearbeiten",
        key: "edit-roles-and-permissions",
      },
      {
        name: "Logins einsehen",
        key: "view-logins",
      },
    ],
  },
  {
    name: "Spynet",
    icon: <RiSpyFill />,
    permissions: [
      {
        name: "Spynet einsehen",
        key: "view-spynet",
      },
      {
        name: "Neuen Citizen oder Organisation anlegen",
        key: "add-entity",
      },
      {
        name: "Neuen Handle hinzufügen",
        key: "add-handle",
      },
      {
        name: "Neue Discord ID hinzufügen",
        key: "add-discord-id",
      },
      {
        name: "Neue Notiz hinzufügen",
        key: "add-note",
      },
      {
        name: "Handle bestätigen",
        key: "confirm-handle",
      },
      {
        name: "Discord ID bestätigen",
        key: "confirm-discord-id",
      },
      {
        name: "Notiz bestätigen",
        key: "confirm-note",
      },
    ],
  },
  {
    name: "Flotte",
    icon: <MdWorkspaces />,
    permissions: [
      {
        name: "Gesamte Flotte einsehen",
        key: "view-org-fleet",
      },
      {
        name: "Eigene Schiffe hinzufügen",
        key: "add-ship",
      },
      {
        name: "Schiffsmodelle bearbeiten",
        key: "edit-manufacturers-series-and-variants",
      },
    ],
  },
  {
    name: "Events",
    icon: <FaCalendarDay />,
    permissions: [
      {
        name: "Events einsehen",
        key: "view-events",
      },
    ],
  },
  {
    name: "Operationen",
    icon: <RiSwordFill />,
    permissions: [
      {
        name: "Operationen einsehen",
        key: "view-operations",
      },
    ],
  },
];
