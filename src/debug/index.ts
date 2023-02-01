import debug from "debug";

/**
 * If you want permanent logging statements then use this function to create a logger.
 *
 * const log = createLog('projects');
 * log('some logging statement');
 *
 * Then to see the log statements in the browser debugger, type this in the debugger:
 *  localStorage.debug = 'app:*';
 * // or localStorage.debug = 'app:projects'; to only see those log statements
 *
 * And then refresh the page.
 */
export const createLog = (namespace: string) => {
  return debug(`app:${namespace}`);
};
