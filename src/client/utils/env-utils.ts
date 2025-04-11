/**
 * Helper function to retrieve an environment variable.
 * Throws an error if the variable is not defined.
 *
 * @param key - The name of the environment variable.
 * @returns The value of the environment variable.
 */
export const checkEnv = (key: string): string => {
  const variable = import.meta.env[key];
  if (typeof variable === 'string' && variable.trim().length > 0) {
    return variable;
  }
  throw new Error(`Missing environment variable: ${key}`);
};

/**
 * Helper function to retrieve an optional environment variable.
 * Returns `undefined` if the variable is not defined.
 *
 * @param key - The name of the environment variable.
 * @returns The value of the environment variable or `undefined`.
 */
export const checkOptionalEnv = (key: string): string | undefined => {
  const variable = import.meta.env[key];
  return typeof variable === 'string' && variable.trim().length > 0 ? variable : undefined;
};

/**
 * Helper function to retrieve and convert an environment variable to a number.
 * Throws an error if the variable is required but missing or invalid.
 *
 * @param key - The name of the environment variable.
 * @param defaultValue - An optional default value to use if the variable is missing or invalid.
 * @returns The numeric value of the environment variable.
 */
export const checkEnvNumber = (key: string, defaultValue?: number): number => {
  const variable = import.meta.env[key];
  const parsed = Number(variable);

  if (!isNaN(parsed)) {
    return parsed;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Missing or invalid numeric environment variable: ${key}`);
};