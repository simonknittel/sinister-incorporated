import { FaLock } from "react-icons/fa";

const RolesSkeleton = () => {
  return (
    <section
      className="rounded p-4 lg:p-8 bg-neutral-900/50 backdrop-blur flex flex-col animate-pulse min-h-[22.5rem]"
      style={{
        gridArea: "roles",
      }}
    >
      <h2 className="font-bold flex gap-2 items-center">
        <FaLock /> Rollen
      </h2>
    </section>
  );
};

export default RolesSkeleton;
