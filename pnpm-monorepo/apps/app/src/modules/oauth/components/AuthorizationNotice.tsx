import Note from "@/modules/common/components/Note";
import { Tile } from "@/modules/common/components/Tile";

interface Props {
  readonly message: string;
}

/**
 * The consent page cannot ask for the consent, for example because the
 * request of the client is not valid. The page does not redirect to the
 * client in this case.
 */
export const AuthorizationNotice = ({ message }: Props) => (
  <Tile heading="Zugriff erlauben" childrenClassName="flex flex-col gap-4">
    <Note type="error" message={message} />

    <p className="text-sm text-neutral-500">
      Du kannst diese Seite schließen und die Verbindung in der Anwendung neu
      starten.
    </p>
  </Tile>
);
