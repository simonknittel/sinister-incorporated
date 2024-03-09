import { FaListAlt } from "react-icons/fa";

const NotesSkeleton = () => {
  return (
    <section
      className="rounded-2xl p-4 lg:p-8 bg-neutral-900/50 backdrop-blur col-span-2 animate-pulse min-h-[22.5rem] w-full place-self-start"
      style={{
        gridArea: "notes",
      }}
    >
      <h2 className="font-bold flex gap-2 items-center">
        <FaListAlt /> Notizen
      </h2>
    </section>
  );
};

export default NotesSkeleton;
