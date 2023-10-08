import { isRef, unref } from "vue-demi";
import { MaybeRefDeep } from "./typeUtils.ts";

export function cloneDeep<T>(
  value: MaybeRefDeep<T>,
  customizer?: (val: MaybeRefDeep<T>) => T | undefined,
): T {
  if (customizer) {
    const result = customizer(value);
    // If it's a ref of undefined, return undefined
    if (result === undefined && isRef(value)) {
      return result as T;
    }
    if (result !== undefined) {
      return result;
    }
  }

  if (Array.isArray(value)) {
    return value.map((val) => cloneDeep(val, customizer)) as unknown as T;
  }

  if (typeof value === "object" && isPlainObject(value)) {
    const entries = Object.entries(value).map(([key, val]) => [
      key,
      cloneDeep(val, customizer),
    ]);
    return Object.fromEntries(entries);
  }

  return value as T;
}

export function cloneDeepUnref<T>(obj: MaybeRefDeep<T>): T {
  return cloneDeep(obj, (val) => {
    if (isRef(val)) {
      return cloneDeepUnref(unref(val));
    }

    return undefined;
  });
}

function isPlainObject(value: unknown): value is Object {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}
