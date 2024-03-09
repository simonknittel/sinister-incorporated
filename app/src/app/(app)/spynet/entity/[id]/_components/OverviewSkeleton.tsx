const OverviewSkeleton = () => {
  return (
    <section
      className="rounded p-4 lg:p-8 bg-neutral-900/50 backdrop-blur flex flex-col animate-pulse min-h-[22.5rem]"
      style={{
        gridArea: "overview",
      }}
    >
      <h2 className="font-bold">Übersicht</h2>
    </section>
  );
};

export default OverviewSkeleton;
