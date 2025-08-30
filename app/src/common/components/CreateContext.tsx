"use client";

import Modal from "@/common/components/Modal";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { FaSpinner } from "react-icons/fa";

const CreateCitizenForm = dynamic(() =>
  import("@/citizen/components/CreateCitizen/CreateCitizenForm").then(
    (mod) => mod.CreateCitizenForm,
  ),
);

const CreateOrganizationForm = dynamic(() =>
  import("@/spynet/components/CreateOrganization/CreateOrganizationForm").then(
    (mod) => mod.CreateOrganizationForm,
  ),
);

const CreateRoleForm = dynamic(() =>
  import("@/roles/components/CreateRole/CreateRoleForm").then(
    (mod) => mod.CreateRoleForm,
  ),
);

const CreatePenaltyEntryForm = dynamic(() =>
  import(
    "@/penalty-points/components/CreatePenaltyEntry/CreatePenaltyEntryForm"
  ).then((mod) => mod.CreatePenaltyEntryForm),
);

const CreateTaskForm = dynamic(() =>
  import("@/tasks/components/CreateTask/CreateTaskForm").then(
    (mod) => mod.CreateTaskForm,
  ),
);

export const createForms = {
  citizen: {
    formComponent: CreateCitizenForm,
    modalHeading: "Citizen erstellen",
    modalWidth: "w-[480px]",
  },
  organization: {
    formComponent: CreateOrganizationForm,
    modalHeading: "Organisation erstellen",
    modalWidth: "w-[480px]",
  },
  role: {
    formComponent: CreateRoleForm,
    modalHeading: "Rolle erstellen",
    modalWidth: "w-[480px]",
  },
  penaltyEntry: {
    formComponent: CreatePenaltyEntryForm,
    modalHeading: "Strafpunkte erstellen",
    modalWidth: "w-[480px]",
  },
  task: {
    formComponent: CreateTaskForm,
    modalHeading: "Task erstellen",
    modalWidth: "w-[768px]",
  },
};

interface CreateContext {
  readonly openCreateModal: (modalId: keyof typeof createForms) => void;
}

const CreateContext = createContext<CreateContext | undefined>(undefined);

interface Props {
  readonly children: ReactNode;
}

export const CreateContextProvider = ({ children }: Props) => {
  const [currentlyOpenForm, setCurrentlyOpenForm] = useState<
    keyof typeof createForms | null
  >(null);

  const openCreateModal = useCallback(
    (modalId: keyof typeof createForms) => setCurrentlyOpenForm(modalId),
    [],
  );

  const value = useMemo(
    () => ({
      openCreateModal,
    }),
    [openCreateModal],
  );

  return (
    <CreateContext.Provider value={value}>
      {children}

      {currentlyOpenForm && createForms[currentlyOpenForm] && (
        <ModalWithFormComponent
          form={createForms[currentlyOpenForm]}
          onRequestClose={() => setCurrentlyOpenForm(null)}
        />
      )}
    </CreateContext.Provider>
  );
};

interface ModalWithFormComponentProps {
  readonly form: (typeof createForms)[keyof typeof createForms];
  readonly onRequestClose: () => void;
}

const ModalWithFormComponent = ({
  form,
  onRequestClose,
}: ModalWithFormComponentProps) => {
  return (
    <Modal
      isOpen={true}
      onRequestClose={onRequestClose}
      className={form.modalWidth}
      heading={<h2>{form.modalHeading}</h2>}
    >
      <Suspense
        fallback={
          <div className="flex justify-center items-center p-8">
            <FaSpinner className="animate-spin text-5xl text-neutral-500" />
          </div>
        }
      >
        <form.formComponent onSuccess={onRequestClose} />
      </Suspense>
    </Modal>
  );
};

/**
 * Check for undefined since the defaultValue of the context is undefined. If
 * it's still undefined, the provider component is missing.
 */
export function useCreateContext() {
  const context = useContext(CreateContext);
  if (!context) throw new Error("[CreateContext] Provider is missing!");
  return context;
}
