import { FaLock } from "react-icons/fa";

const RolesSkeleton = () => {
  return (
    <section
      className="rounded-2xl p-4 lg:p-8 bg-neutral-800/50  flex flex-col animate-pulse min-h-[22.5rem]"
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
