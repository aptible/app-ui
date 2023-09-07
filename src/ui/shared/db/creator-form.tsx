import { Reducer, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { DbCreatorProps } from "@app/deploy";
import { idCreator } from "@app/id";
import { DeployDatabaseImage } from "@app/types";
import { handleValidator } from "@app/validator";

import { Button } from "../button";
import { FeedbackVariant, FormGroup } from "../form-group";
import { IconPlusCircle } from "../icons";
import { Input } from "../input";
import { Select, SelectOption } from "../select";
import { tokens } from "../tokens";

export type DbCreatorReducer = Reducer<
  { [key: string]: DbCreatorProps },
  DbSelectorAction<DbCreatorProps>
>;

export type DbSelectorAction<P extends { id: string }> =
  | { type: "add"; payload: P }
  | { type: "rm"; payload: string }
  | { type: "reset" };

export interface DbFormProps<P extends { id: string }> {
  dbMap: { [key: string]: P };
  dbDispatch: (p: DbSelectorAction<P>) => void;
}

export interface DbValidatorError {
  message: string;
  item: DbCreatorProps;
}

const createId = idCreator();

export function dbSelectorReducer<P extends { id: string }>(
  state: { [key: string]: P },
  action: DbSelectorAction<P>,
) {
  if (action.type === "add") {
    return { ...state, [action.payload.id]: action.payload };
  }

  if (action.type === "reset") {
    return {};
  }

  if (action.type === "rm") {
    const nextState = { ...state };
    delete nextState[action.payload];
    return nextState;
  }

  return state;
}

export const validateDbName = (item: DbCreatorProps) => {
  const message = handleValidator(item.name);
  if (!message) return;

  return {
    item,
    message,
  };
};

export const DatabaseNameInput = ({
  value,
  onChange,
  feedbackMessage,
  feedbackVariant = "info",
}: {
  value: string;
  onChange: (s: string) => void;
  feedbackMessage?: string | null;
  feedbackVariant?: FeedbackVariant;
}) => {
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  };
  return (
    <FormGroup
      label="Database Handle"
      htmlFor="dbname"
      className="flex-1"
      feedbackVariant={feedbackVariant}
      feedbackMessage={feedbackMessage}
    >
      <Input name="dbname" value={value} onChange={change} />
    </FormGroup>
  );
};

export const DatabaseEnvVarInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) => {
  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  };
  return (
    <FormGroup label="Environment Variable" htmlFor="envvar" className="flex-1">
      <Input name="envvar" value={value} onChange={change} />
    </FormGroup>
  );
};

export const DbCreatorSelector = ({
  db,
  images,
  propChange,
  onDelete,
  namePrefix,
  showEnv = true,
}: {
  db: DbCreatorProps;
  images: DeployDatabaseImage[];
  propChange: (d: DbCreatorProps) => void;
  onDelete: () => void;
  namePrefix: string;
  showEnv?: boolean;
}) => {
  const selectChange = (option: SelectOption) => {
    const imgId = option.value;
    const img = images.find((i) => i.id === imgId);
    const name = `${namePrefix}-${img?.type || ""}`;
    propChange({
      ...db,
      imgId,
      name,
      dbType: img?.type || "",
    });
  };

  const sel = (
    <div className="flex justify-between gap-3 mt-4">
      <DatabaseNameInput
        value={db.name}
        onChange={(value) => propChange({ ...db, name: value })}
      />
      {showEnv ? (
        <DatabaseEnvVarInput
          value={db.env}
          onChange={(value) => propChange({ ...db, env: value })}
        />
      ) : null}
    </div>
  );

  const imgOptions = [
    { value: "", label: "Choose a Database" },
    ...images.map((img) => ({
      label: `${img.type} v${img.version}`,
      value: img.id,
    })),
  ];
  const selectedValue = imgOptions.find((img) => img.value === db.imgId);

  return (
    <div className="mb-4">
      <h4 className={`${tokens.type.h4}`}>New Database</h4>
      <p className="text-black-500 mb-2">
        Choose a database type and handle.{" "}
        {showEnv
          ? "The environment variable here will be injected into your app with the connection URL."
          : ""}
      </p>
      <div className="flex mb-2">
        <Select
          ariaLabel="new-db"
          onSelect={selectChange}
          value={selectedValue?.value}
          options={imgOptions}
          className="flex-1 mr-2"
        />
        <Button variant="delete" onClick={onDelete}>
          Delete
        </Button>
      </div>
      {db.imgId ? sel : null}
      <hr className="my-4" />
    </div>
  );
};

export const DatabaseCreatorForm = ({
  namePrefix,
  dbImages,
  dbMap,
  dbDispatch,
  isLoading,
  showEnv = true,
}: {
  namePrefix: string;
  dbImages: DeployDatabaseImage[];
  isLoading: boolean;
  showEnv: boolean;
} & DbFormProps<DbCreatorProps>) => {
  const [searchParams] = useSearchParams();
  const queryDbsStr = searchParams.get("dbs") || "";
  // prefill databases based on query params
  useEffect(() => {
    if (!queryDbsStr) return;
    if (!namePrefix) return;
    const qdbs = queryDbsStr.split(",");
    if (qdbs.length === 0) return;

    qdbs.forEach((db) => {
      const [env, type, version] = db.split(":");
      const img = dbImages.find(
        (i) => i.type === type && i.version === version,
      );
      if (!img) return;
      dbDispatch({
        type: "add",
        payload: {
          env: env.toLocaleUpperCase(),
          id: `${createId()}`,
          imgId: img.id,
          name: `${namePrefix}-${img.type || ""}`,
          dbType: img.type || "",
          enableBackups: true,
        },
      });
    });
  }, [queryDbsStr, dbImages, namePrefix]);

  const onClick = () => {
    const payload: DbCreatorProps = {
      id: `${createId()}`,
      imgId: "",
      name: namePrefix,
      env: "DATABASE_URL",
      dbType: "",
      enableBackups: true,
    };
    dbDispatch({
      type: "add",
      payload,
    });
  };

  return (
    <div>
      {Object.values(dbMap)
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((db) => {
          return (
            <DbCreatorSelector
              key={db.id}
              images={dbImages}
              db={db}
              propChange={(payload) => {
                dbDispatch({ type: "add", payload });
              }}
              onDelete={() => dbDispatch({ type: "rm", payload: db.id })}
              namePrefix={namePrefix}
              showEnv={showEnv}
            />
          );
        })}
      <Button
        type="button"
        onClick={onClick}
        variant="secondary"
        isLoading={isLoading}
      >
        <IconPlusCircle className="mr-2" color="#fff" variant="sm" /> New
        Database
      </Button>
    </div>
  );
};
