import { unstable_rethrow } from "next/navigation";
import { useActionState } from "react";
import toast from "react-hot-toast";
import type { createAuthenticatedAction } from "./createAction";

export const useAction = (
  action: ReturnType<typeof createAuthenticatedAction>,
  options?: { onSuccess?: () => void },
) => {
  const [state, formAction, isPending] = useActionState(
    async (previousState: unknown, formData: FormData) => {
      try {
        const response = await action(formData);

        if ("error" in response) {
          toast.error(response.error);
          console.error(response);
          return response;
        }

        toast.success(response.success);
        options?.onSuccess?.();
        return response;
      } catch (error) {
        unstable_rethrow(error);
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
        return {
          error:
            "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
          requestPayload: formData,
        };
      }
    },
    null,
  );

  return { state, formAction, isPending };
};
