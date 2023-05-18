import Link from "next/link";
import { type CitizenHit } from "./Search";

interface Props {
  hit: CitizenHit;
}

const Citizen = ({ hit }: Props) => {
  return (
    <Link href={`/spynet/entity/${hit.objectID}`} className="aa-ItemLink">
      <div className="aa-ItemContent">
        <div className="aa-ItemTitle">
          <p className="aa-ItemTitleHighlight">{hit.handles[0]}</p>

          <span className="text-sm">
            {hit.handles.length > 1 && (
              <>
                <p className="text-neutral-500">Ehemalige Handles:</p>
                <p>{hit.handles.splice(0, 1).join(", ")}</p>
              </>
            )}

            <p className="text-neutral-500">Sinister ID: {hit.objectID}</p>
            <p className="text-neutral-500">Spectrum ID: {hit.spectrumId}</p>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Citizen;
