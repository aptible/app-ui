import { useState } from "react";

export type ValidResult = undefined | string;
export type ValidatorFn<M> = (data: M) => ValidResult;

/**
 * Form validation hook which accepts a list of validators and returns
 * a) any errors from validation and b) the validator function.  The
 * errors from this hook can be place directly inside a `<FormGroup />`.
 *
 * @example
 * ```tsx
 * interface FormData {
 *  type: string;
 *  domain: string;
 * }
 *
 * const validators = {
 *   domain: (data: FormData) => {
 *     if (data.type !== "managed") return;
 *     if (data.domain === "") return "Domain is required for managed HTTPS";
 *   },
 *  };
 *
 *  function App() {
 *   const [domain, setDomain] = useState("");
 *   const [errors, validate] = useValidator<FormData, typeof validators>(validators);
 *   const data = { domain };
 *
 *   const onSubmit = () => {
 *     if (!validate(data)) return;
 *     // submit form
 *   }
 *
 *   return (
 *     <FormGroup
 *      feedbackMessage={errors.domain}
 *      feedbackVariant={errors.domain ? "danger" : "info"}
 *     >
 *       <input />
 *     </FormGroup>
 *   );
 *  }
 * ```
 */
export function useValidator<
  Model,
  /** Unfortunately partial type inference is not supported in Typescript
   * so we cannot have `V` inferred from `validators`, `V` must always
   * be passed in to get the proper type out for the first element in the
   * array (e.g. errors object)
   * https://github.com/microsoft/TypeScript/issues/26242
   */
  V extends { [key: string]: ValidatorFn<Model> } = {
    [key: string]: ValidatorFn<Model>;
  },
>(
  validators: V,
): [{ [key in keyof V]: ValidResult }, (data: Model) => boolean] {
  const init = Object.keys(validators).reduce<{
    [key in keyof V]: ValidResult;
  }>((acc, v: keyof V) => {
    acc[v] = undefined;
    return acc;
  }, {} as any);
  const [errors, setErrors] = useState<{ [key in keyof V]: ValidResult }>(init);

  const validate = (curData: Model) => {
    const validationErrors: { [key in keyof V]: ValidResult } = {} as any;
    let valid = true;

    Object.keys(validators).forEach((inputName: keyof V) => {
      const validator = validators[inputName];
      const hasError = validator(curData);
      if (hasError) {
        valid = false;
        validationErrors[inputName] = hasError;
      }
    });

    setErrors(validationErrors);
    return valid;
  };

  return [errors, validate];
}
