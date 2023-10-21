import Script from "next/script";
import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";

const PreviewComments = async () => {
  if (!(await getUnleashFlag("EnablePreviewComments"))) return null;

  return (
    <>
      <Script
        src="https://openpreviews.com/widget.js"
        data-repository="simonknittel/sinister-incorporated"
        data-category-id="DIC_kwDOJfGuQc4CaVJr"
        strategy="lazyOnload"
      />
    </>
  );
};

export default PreviewComments;
