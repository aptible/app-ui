const COMPLEXITY_RULES: [string, RegExp][] = [
  ['must be at least 10 characters', /^.{0,9}$/],
  ['must be shorter than 128 characters', /^.{128,}$/],
  ['must contain at least one uppercase letter', /^[^A-Z]+$/],
  ['must contain at least one lowercase letter', /^[^a-z]+$/],
  ['must contain at least one digit or special character', /^[^0-9!@#$%^&*()]+$/],
];

export function validatePasswordComplexity(password: string): string[] {
  const errors: string[] = [];

  COMPLEXITY_RULES.forEach((rule) => {
    const [message, regex] = rule;

    if (password.match(regex)) {
      errors.push(message);
    }
  });

  return errors;
}
