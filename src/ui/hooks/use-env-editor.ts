import { TextVal, ValidatorError, parseText } from "@app/string-utils";
import { useState } from "react";

export const validateEnvs = (items: TextVal[]): ValidatorError[] => {
  const errors: ValidatorError[] = [];
  const keys = new Set<string>();

  const validate = (item: TextVal) => {
    if (keys.has(item.key)) {
      errors.push({
        item,
        message: `${item.key} found multiple times, must be unique`,
      });
    } else {
      keys.add(item.key);
    }

    // https://stackoverflow.com/a/2821201
    if (!/[a-zA-Z_]+[a-zA-Z0-9_]*/.test(item.key)) {
      errors.push({
        item,
        message: `${item.key} does not match regex: /[a-zA-Z_]+[a-zA-Z0-9_]*/`,
      });
    }

    if (item.value === "") {
      errors.push({
        item,
        message: `${item.key} is blank, either provide a value or remove the environment variable`,
      });
    }
  };

  items.forEach(validate);
  return errors;
};

export function useEnvEditor(envStr: string) {
  const [errors, setErrors] = useState<ValidatorError[]>([]);
  const [envs, setEnvs] = useState(envStr);
  const envList = parseText(envs, () => ({}));
  const validate = () => {
    const enverr = validateEnvs(envList);
    if (enverr.length > 0) {
      setErrors(enverr);
      return false;
    }
    setErrors([]);
    return true;
  };

  return { envs, envList, errors, setEnvs, validate };
}
