import { Ref, ToRef, UnwrapRef } from "vue-demi";

export type StripPath<T> = T extends (path: any, ...args: infer Args) => infer R
  ? (...args: Args) => R
  : never;

export type VoidReturnType<F extends (...args: any[]) => any> = (
  ...args: Parameters<F>
) => void;

type Primitive = string | number | boolean | bigint | symbol | undefined | null;
type UnwrapLeaf =
  | Primitive
  | Function
  | Date
  | Error
  | RegExp
  | Map<any, any>
  | WeakMap<any, any>
  | Set<any>
  | WeakSet<any>;

export type MaybeRef<T> = Ref<T> | T;

export type MaybeRefDeep<T> = MaybeRef<
  T extends Function
    ? T
    : T extends object
    ? {
        [Property in keyof T]: MaybeRefDeep<T[Property]>;
      }
    : T
>;

export type DeepUnwrapRef<T> = T extends UnwrapLeaf
  ? T
  : T extends Ref<infer U>
  ? DeepUnwrapRef<U>
  : T extends {}
  ? {
      [Property in keyof T]: DeepUnwrapRef<T[Property]>;
    }
  : UnwrapRef<T>;

export type ToRefs<T> = {
  [K in keyof T]: T[K] extends Function ? T[K] : ToRef<T[K]>;
};
