/**
 * cookie.d
 * 
 * @module ./server/_core/types/cookie.d
 */
declare module "cookie" {
  export function parse(
    str: string,
    options?: Record<string, unknown>
  ): Record<string, string>;
}
