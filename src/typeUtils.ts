import type { TRPCClientErrorLike, TRPCRequestOptions } from "@trpc/client";
import type {
  AnyProcedure,
  DeepPartial,
  inferProcedureInput,
  inferProcedureOutput,
} from "@trpc/server";
import type { Ref, ToRef, UnwrapRef } from "vue-demi";

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

export type UnionToIntersection<U> = (
  U extends any ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

export type FunctionOverloadToUnion<TOverload extends (...args: any[]) => any> =
  Exclude<
    _OverloadUnion<
      // The "() => never" signature must be hoisted to the "front" of the
      // intersection, for two reasons: a) because recursion stops when it is
      // encountered, and b) it seems to prevent the collapse of subsequent
      // "compatible" signatures (eg. "() => void" into "(a?: 1) => void"),
      // which gives a direct conversion to a union.
      (() => never) & TOverload
    >,
    TOverload extends () => never ? never : () => never
  >;

type _OverloadUnion<TOverload, TPartialOverload = unknown> = TPartialOverload &
  TOverload extends (...args: infer TArgs) => infer TReturn
  ? // Prevent infinite recursion by stopping recursion when TPartialOverload
    // has accumulated all of the TOverload signatures.
    TPartialOverload extends TOverload
    ? never
    :
        | _OverloadUnion<
            TOverload,
            Pick<TOverload, keyof TOverload> &
              TPartialOverload &
              ((...args: TArgs) => TReturn)
          >
        | ((...args: TArgs) => TReturn)
  : never;

export type DistributiveOmit<T, TKeyOfAny extends keyof any> = T extends any
  ? Omit<T, TKeyOfAny>
  : never;

export type TrpcRequestOptions = {
  trpc?: TRPCRequestOptions;
};

export type TrpcError<TProcedure extends AnyProcedure> =
  TRPCClientErrorLike<TProcedure>;

export type Input<TProcedure extends AnyProcedure> =
  inferProcedureInput<TProcedure> extends void | undefined
    ? void | undefined
    : MaybeRefDeep<inferProcedureInput<TProcedure>>;

export type DeepPartialInput<TProcedure extends AnyProcedure> =
  inferProcedureInput<TProcedure> extends void | undefined
    ? void | undefined
    : MaybeRefDeep<DeepPartial<inferProcedureInput<TProcedure>>>;

export type Output<TProcedure extends AnyProcedure> =
  inferProcedureOutput<TProcedure>;

export type KeysOfUnion<T> = T extends T ? keyof T : never;
