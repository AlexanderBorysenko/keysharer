/* eslint-disable */

import { AllTypesProps, ReturnTypes, Ops } from './const';
export const HOST = "http://localhost:4000"


export const HEADERS = {}
import { createClient, type Sink } from 'graphql-ws'; // keep

export const apiSubscription = (options: chainOptions) => {
  const client = createClient({
    url: String(options[0]),
    connectionParams: Object.fromEntries(new Headers(options[1]?.headers).entries()),
  });

  const ws = new Proxy(
    {
      close: () => client.dispose(),
    } as WebSocket,
    {
      get(target, key) {
        if (key === 'close') return target.close;
        throw new Error(`Unimplemented property '${String(key)}', only 'close()' is available.`);
      },
    },
  );

  return (query: string) => {
    let onMessage: ((event: any) => void) | undefined;
    let onError: Sink['error'] | undefined;
    let onClose: Sink['complete'] | undefined;

    client.subscribe(
      { query },
      {
        next({ data }) {
          onMessage && onMessage(data);
        },
        error(error) {
          onError && onError(error);
        },
        complete() {
          onClose && onClose();
        },
      },
    );

    return {
      ws,
      on(listener: typeof onMessage) {
        onMessage = listener;
      },
      error(listener: typeof onError) {
        onError = listener;
      },
      open(listener: (socket: unknown) => void) {
        client.on('opened', listener);
      },
      off(listener: typeof onClose) {
        onClose = listener;
      },
    };
  };
};
const handleFetchResponse = (response: Response): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response
        .text()
        .then((text) => {
          try {
            reject(JSON.parse(text));
          } catch (err) {
            reject(text);
          }
        })
        .catch(reject);
    });
  }
  return response.json() as Promise<GraphQLResponse>;
};

export const apiFetch =
  (options: fetchOptions) =>
    (query: string, variables: Record<string, unknown> = {}) => {
      const fetchOptions = options[1] || {};
      if (fetchOptions.method && fetchOptions.method === 'GET') {
        return fetch(`${options[0]}?query=${encodeURIComponent(query)}`, fetchOptions)
          .then(handleFetchResponse)
          .then((response: GraphQLResponse) => {
            if (response.errors) {
              throw new GraphQLError(response);
            }
            return response.data;
          });
      }
      return fetch(`${options[0]}`, {
        body: JSON.stringify({ query, variables }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        ...fetchOptions,
      })
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    };

export const InternalsBuildQuery = ({
  ops,
  props,
  returns,
  options,
  scalars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  options?: OperationOptions;
  scalars?: ScalarDefinition;
}) => {
  const ibb = (
    k: string,
    o: InputValueType | VType,
    p = '',
    root = true,
    vars: Array<{ name: string; graphQLType: string }> = [],
  ): string => {
    const keyForPath = purifyGraphQLKey(k);
    const newPath = [p, keyForPath].join(SEPARATOR);
    if (!o) {
      return '';
    }
    if (typeof o === 'boolean' || typeof o === 'number') {
      return k;
    }
    if (typeof o === 'string') {
      return `${k} ${o}`;
    }
    if (Array.isArray(o)) {
      const args = InternalArgsBuilt({
        props,
        returns,
        ops,
        scalars,
        vars,
      })(o[0], newPath);
      return `${ibb(args ? `${k}(${args})` : k, o[1], p, false, vars)}`;
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(`${alias}:${operationName}`, operation, p, false, vars);
        })
        .join('\n');
    }
    const hasOperationName = root && options?.operationName ? ' ' + options.operationName : '';
    const keyForDirectives = o.__directives ?? '';
    const query = `{${Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map((e) => ibb(...e, [p, `field<>${keyForPath}`].join(SEPARATOR), false, vars))
      .join('\n')}}`;
    if (!root) {
      return `${k} ${keyForDirectives}${hasOperationName} ${query}`;
    }
    const varsString = vars.map((v) => `${v.name}: ${v.graphQLType}`).join(', ');
    return `${k} ${keyForDirectives}${hasOperationName}${varsString ? `(${varsString})` : ''} ${query}`;
  };
  return ibb;
};

type UnionOverrideKeys<T, U> = Omit<T, keyof U> & U;

export const Thunder =
  <SCLR extends ScalarDefinition>(fn: FetchFunction, thunderGraphQLOptions?: ThunderGraphQLOptions<SCLR>) =>
    <O extends keyof typeof Ops, OVERRIDESCLR extends SCLR, R extends keyof ValueTypes = GenericOperation<O>>(
      operation: O,
      graphqlOptions?: ThunderGraphQLOptions<OVERRIDESCLR>,
    ) =>
      <Z extends ValueTypes[R]>(
        o: Z & {
          [P in keyof Z]: P extends keyof ValueTypes[R] ? Z[P] : never;
        },
        ops?: OperationOptions & { variables?: Record<string, unknown> },
      ) => {
        const options = {
          ...thunderGraphQLOptions,
          ...graphqlOptions,
        };
        return fn(
          Zeus(operation, o, {
            operationOptions: ops,
            scalars: options?.scalars,
          }),
          ops?.variables,
        ).then((data) => {
          if (options?.scalars) {
            return decodeScalarsInResponse({
              response: data,
              initialOp: operation,
              initialZeusQuery: o as VType,
              returns: ReturnTypes,
              scalars: options.scalars,
              ops: Ops,
            });
          }
          return data;
        }) as Promise<InputType<GraphQLTypes[R], Z, UnionOverrideKeys<SCLR, OVERRIDESCLR>>>;
      };

export const Chain = (...options: chainOptions) => Thunder(apiFetch(options));

export const SubscriptionThunder =
  <SCLR extends ScalarDefinition>(fn: SubscriptionFunction, thunderGraphQLOptions?: ThunderGraphQLOptions<SCLR>) =>
    <O extends keyof typeof Ops, OVERRIDESCLR extends SCLR, R extends keyof ValueTypes = GenericOperation<O>>(
      operation: O,
      graphqlOptions?: ThunderGraphQLOptions<OVERRIDESCLR>,
    ) =>
      <Z extends ValueTypes[R]>(
        o: Z & {
          [P in keyof Z]: P extends keyof ValueTypes[R] ? Z[P] : never;
        },
        ops?: OperationOptions & { variables?: ExtractVariables<Z> },
      ) => {
        const options = {
          ...thunderGraphQLOptions,
          ...graphqlOptions,
        };
        type CombinedSCLR = UnionOverrideKeys<SCLR, OVERRIDESCLR>;
        const returnedFunction = fn(
          Zeus(operation, o, {
            operationOptions: ops,
            scalars: options?.scalars,
          }),
        ) as SubscriptionToGraphQL<Z, GraphQLTypes[R], CombinedSCLR>;
        if (returnedFunction?.on && options?.scalars) {
          const wrapped = returnedFunction.on;
          returnedFunction.on = (fnToCall: (args: InputType<GraphQLTypes[R], Z, CombinedSCLR>) => void) =>
            wrapped((data: InputType<GraphQLTypes[R], Z, CombinedSCLR>) => {
              if (options?.scalars) {
                return fnToCall(
                  decodeScalarsInResponse({
                    response: data,
                    initialOp: operation,
                    initialZeusQuery: o as VType,
                    returns: ReturnTypes,
                    scalars: options.scalars,
                    ops: Ops,
                  }),
                );
              }
              return fnToCall(data);
            });
        }
        return returnedFunction;
      };

export const Subscription = (...options: chainOptions) => SubscriptionThunder(apiSubscription(options));
export const Zeus = <
  Z extends ValueTypes[R],
  O extends keyof typeof Ops,
  R extends keyof ValueTypes = GenericOperation<O>,
>(
  operation: O,
  o: Z,
  ops?: {
    operationOptions?: OperationOptions;
    scalars?: ScalarDefinition;
  },
) =>
  InternalsBuildQuery({
    props: AllTypesProps,
    returns: ReturnTypes,
    ops: Ops,
    options: ops?.operationOptions,
    scalars: ops?.scalars,
  })(operation, o as VType);

export const ZeusSelect = <T>() => ((t: unknown) => t) as SelectionFunction<T>;

export const Selector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();

export const TypeFromSelector = <T extends keyof ValueTypes>(key: T) => key && ZeusSelect<ValueTypes[T]>();
export const Gql = Chain(HOST, {
  headers: {
    'Content-Type': 'application/json',
    ...HEADERS,
  },
});

export const ZeusScalars = ZeusSelect<ScalarCoders>();

type ScalarsSelector<T> = {
  [X in Required<{
    [P in keyof T]: T[P] extends number | string | undefined | boolean ? P : never;
  }>[keyof T]]: true;
};

export const fields = <T extends keyof ModelTypes>(k: T) => {
  const t = ReturnTypes[k];
  const o = Object.fromEntries(
    Object.entries(t)
      .filter(([, value]) => {
        const isReturnType = ReturnTypes[value as string];
        if (!isReturnType || (typeof isReturnType === 'string' && isReturnType.startsWith('scalar.'))) {
          return true;
        }
      })
      .map(([key]) => [key, true as const]),
  );
  return o as ScalarsSelector<ModelTypes[T]>;
};

export const decodeScalarsInResponse = <O extends Operations>({
  response,
  scalars,
  returns,
  ops,
  initialZeusQuery,
  initialOp,
}: {
  ops: O;
  response: any;
  returns: ReturnTypesType;
  scalars?: Record<string, ScalarResolver | undefined>;
  initialOp: keyof O;
  initialZeusQuery: InputValueType | VType;
}) => {
  if (!scalars) {
    return response;
  }
  const builder = PrepareScalarPaths({
    ops,
    returns,
  });

  const scalarPaths = builder(initialOp as string, ops[initialOp], initialZeusQuery);
  if (scalarPaths) {
    const r = traverseResponse({ scalarPaths, resolvers: scalars })(initialOp as string, response, [ops[initialOp]]);
    return r;
  }
  return response;
};

export const traverseResponse = ({
  resolvers,
  scalarPaths,
}: {
  scalarPaths: { [x: string]: `scalar.${string}` };
  resolvers: {
    [x: string]: ScalarResolver | undefined;
  };
}) => {
  const ibb = (k: string, o: InputValueType | VType, p: string[] = []): unknown => {
    if (Array.isArray(o)) {
      return o.map((eachO) => ibb(k, eachO, p));
    }
    if (o == null) {
      return o;
    }
    const scalarPathString = p.join(SEPARATOR);
    const currentScalarString = scalarPaths[scalarPathString];
    if (currentScalarString) {
      const currentDecoder = resolvers[currentScalarString.split('.')[1]]?.decode;
      if (currentDecoder) {
        return currentDecoder(o);
      }
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string' || !o) {
      return o;
    }
    const entries = Object.entries(o).map(([k, v]) => [k, ibb(k, v, [...p, purifyGraphQLKey(k)])] as const);
    const objectFromEntries = entries.reduce<Record<string, unknown>>((a, [k, v]) => {
      a[k] = v;
      return a;
    }, {});
    return objectFromEntries;
  };
  return ibb;
};

export type AllTypesPropsType = {
  [x: string]:
  | undefined
  | `scalar.${string}`
  | 'enum'
  | {
    [x: string]:
    | undefined
    | string
    | {
      [x: string]: string | undefined;
    };
  };
};

export type ReturnTypesType = {
  [x: string]:
  | {
    [x: string]: string | undefined;
  }
  | `scalar.${string}`
  | undefined;
};
export type InputValueType = {
  [x: string]: undefined | boolean | string | number | [any, undefined | boolean | InputValueType] | InputValueType;
};
export type VType =
  | undefined
  | boolean
  | string
  | number
  | [any, undefined | boolean | InputValueType]
  | InputValueType;

export type PlainType = boolean | number | string | null | undefined;
export type ZeusArgsType =
  | PlainType
  | {
    [x: string]: ZeusArgsType;
  }
  | Array<ZeusArgsType>;

export type Operations = Record<string, string>;

export type VariableDefinition = {
  [x: string]: unknown;
};

export const SEPARATOR = '|';

export type fetchOptions = Parameters<typeof fetch>;
type websocketOptions = typeof WebSocket extends new (...args: infer R) => WebSocket ? R : never;
export type chainOptions = [fetchOptions[0], fetchOptions[1] & { websocket?: websocketOptions }] | [fetchOptions[0]];
export type FetchFunction = (query: string, variables?: Record<string, unknown>) => Promise<any>;
export type SubscriptionFunction = (query: string) => any;
type NotUndefined<T> = T extends undefined ? never : T;
export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type OperationOptions = {
  operationName?: string;
};

export type ScalarCoder = Record<string, (s: unknown) => string>;

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}
export class GraphQLError extends Error {
  constructor(public response: GraphQLResponse) {
    super('');
    console.error(response);
  }
  toString() {
    return 'GraphQL Response Error';
  }
}
export type GenericOperation<O> = O extends keyof typeof Ops ? typeof Ops[O] : never;
export type ThunderGraphQLOptions<SCLR extends ScalarDefinition> = {
  scalars?: SCLR | ScalarCoders;
};

const ExtractScalar = (mappedParts: string[], returns: ReturnTypesType): `scalar.${string}` | undefined => {
  if (mappedParts.length === 0) {
    return;
  }
  const oKey = mappedParts[0];
  const returnP1 = returns[oKey];
  if (typeof returnP1 === 'object') {
    const returnP2 = returnP1[mappedParts[1]];
    if (returnP2) {
      return ExtractScalar([returnP2, ...mappedParts.slice(2)], returns);
    }
    return undefined;
  }
  return returnP1 as `scalar.${string}` | undefined;
};

export const PrepareScalarPaths = ({ ops, returns }: { returns: ReturnTypesType; ops: Operations }) => {
  const ibb = (
    k: string,
    originalKey: string,
    o: InputValueType | VType,
    p: string[] = [],
    pOriginals: string[] = [],
    root = true,
  ): { [x: string]: `scalar.${string}` } | undefined => {
    if (!o) {
      return;
    }
    if (typeof o === 'boolean' || typeof o === 'number' || typeof o === 'string') {
      const extractionArray = [...pOriginals, originalKey];
      const isScalar = ExtractScalar(extractionArray, returns);
      if (isScalar?.startsWith('scalar')) {
        const partOfTree = {
          [[...p, k].join(SEPARATOR)]: isScalar,
        };
        return partOfTree;
      }
      return {};
    }
    if (Array.isArray(o)) {
      return ibb(k, k, o[1], p, pOriginals, false);
    }
    if (k === '__alias') {
      return Object.entries(o)
        .map(([alias, objectUnderAlias]) => {
          if (typeof objectUnderAlias !== 'object' || Array.isArray(objectUnderAlias)) {
            throw new Error(
              'Invalid alias it should be __alias:{ YOUR_ALIAS_NAME: { OPERATION_NAME: { ...selectors }}}',
            );
          }
          const operationName = Object.keys(objectUnderAlias)[0];
          const operation = objectUnderAlias[operationName];
          return ibb(alias, operationName, operation, p, pOriginals, false);
        })
        .reduce((a, b) => ({
          ...a,
          ...b,
        }));
    }
    const keyName = root ? ops[k] : k;
    return Object.entries(o)
      .filter(([k]) => k !== '__directives')
      .map(([k, v]) => {
        // Inline fragments shouldn't be added to the path as they aren't a field
        const isInlineFragment = originalKey.match(/^...\s*on/) != null;
        return ibb(
          k,
          k,
          v,
          isInlineFragment ? p : [...p, purifyGraphQLKey(keyName || k)],
          isInlineFragment ? pOriginals : [...pOriginals, purifyGraphQLKey(originalKey)],
          false,
        );
      })
      .reduce((a, b) => ({
        ...a,
        ...b,
      }));
  };
  return ibb;
};

export const purifyGraphQLKey = (k: string) => k.replace(/\([^)]*\)/g, '').replace(/^[^:]*\:/g, '');

const mapPart = (p: string) => {
  const [isArg, isField] = p.split('<>');
  if (isField) {
    return {
      v: isField,
      __type: 'field',
    } as const;
  }
  return {
    v: isArg,
    __type: 'arg',
  } as const;
};

type Part = ReturnType<typeof mapPart>;

export const ResolveFromPath = (props: AllTypesPropsType, returns: ReturnTypesType, ops: Operations) => {
  const ResolvePropsType = (mappedParts: Part[]) => {
    const oKey = ops[mappedParts[0].v];
    const propsP1 = oKey ? props[oKey] : props[mappedParts[0].v];
    if (propsP1 === 'enum' && mappedParts.length === 1) {
      return 'enum';
    }
    if (typeof propsP1 === 'string' && propsP1.startsWith('scalar.') && mappedParts.length === 1) {
      return propsP1;
    }
    if (typeof propsP1 === 'object') {
      if (mappedParts.length < 2) {
        return 'not';
      }
      const propsP2 = propsP1[mappedParts[1].v];
      if (typeof propsP2 === 'string') {
        return rpp(
          `${propsP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
      if (typeof propsP2 === 'object') {
        if (mappedParts.length < 3) {
          return 'not';
        }
        const propsP3 = propsP2[mappedParts[2].v];
        if (propsP3 && mappedParts[2].__type === 'arg') {
          return rpp(
            `${propsP3}${SEPARATOR}${mappedParts
              .slice(3)
              .map((mp) => mp.v)
              .join(SEPARATOR)}`,
          );
        }
      }
    }
  };
  const ResolveReturnType = (mappedParts: Part[]) => {
    if (mappedParts.length === 0) {
      return 'not';
    }
    const oKey = ops[mappedParts[0].v];
    const returnP1 = oKey ? returns[oKey] : returns[mappedParts[0].v];
    if (typeof returnP1 === 'object') {
      if (mappedParts.length < 2) return 'not';
      const returnP2 = returnP1[mappedParts[1].v];
      if (returnP2) {
        return rpp(
          `${returnP2}${SEPARATOR}${mappedParts
            .slice(2)
            .map((mp) => mp.v)
            .join(SEPARATOR)}`,
        );
      }
    }
  };
  const rpp = (path: string): 'enum' | 'not' | `scalar.${string}` => {
    const parts = path.split(SEPARATOR).filter((l) => l.length > 0);
    const mappedParts = parts.map(mapPart);
    const propsP1 = ResolvePropsType(mappedParts);
    if (propsP1) {
      return propsP1;
    }
    const returnP1 = ResolveReturnType(mappedParts);
    if (returnP1) {
      return returnP1;
    }
    return 'not';
  };
  return rpp;
};

export const InternalArgsBuilt = ({
  props,
  ops,
  returns,
  scalars,
  vars,
}: {
  props: AllTypesPropsType;
  returns: ReturnTypesType;
  ops: Operations;
  scalars?: ScalarDefinition;
  vars: Array<{ name: string; graphQLType: string }>;
}) => {
  const arb = (a: ZeusArgsType, p = '', root = true): string => {
    if (typeof a === 'string') {
      if (a.startsWith(START_VAR_NAME)) {
        const [varName, graphQLType] = a.replace(START_VAR_NAME, '$').split(GRAPHQL_TYPE_SEPARATOR);
        const v = vars.find((v) => v.name === varName);
        if (!v) {
          vars.push({
            name: varName,
            graphQLType,
          });
        } else {
          if (v.graphQLType !== graphQLType) {
            throw new Error(
              `Invalid variable exists with two different GraphQL Types, "${v.graphQLType}" and ${graphQLType}`,
            );
          }
        }
        return varName;
      }
    }
    const checkType = ResolveFromPath(props, returns, ops)(p);
    if (checkType.startsWith('scalar.')) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, ...splittedScalar] = checkType.split('.');
      const scalarKey = splittedScalar.join('.');
      return (scalars?.[scalarKey]?.encode?.(a) as string) || JSON.stringify(a);
    }
    if (Array.isArray(a)) {
      return `[${a.map((arr) => arb(arr, p, false)).join(', ')}]`;
    }
    if (typeof a === 'string') {
      if (checkType === 'enum') {
        return a;
      }
      return `${JSON.stringify(a)}`;
    }
    if (typeof a === 'object') {
      if (a === null) {
        return `null`;
      }
      const returnedObjectString = Object.entries(a)
        .filter(([, v]) => typeof v !== 'undefined')
        .map(([k, v]) => `${k}: ${arb(v, [p, k].join(SEPARATOR), false)}`)
        .join(',\n');
      if (!root) {
        return `{${returnedObjectString}}`;
      }
      return returnedObjectString;
    }
    return `${a}`;
  };
  return arb;
};

export const resolverFor = <X, T extends keyof ResolverInputTypes, Z extends keyof ResolverInputTypes[T]>(
  type: T,
  field: Z,
  fn: (
    args: Required<ResolverInputTypes[T]>[Z] extends [infer Input, any] ? Input : any,
    source: any,
  ) => Z extends keyof ModelTypes[T] ? ModelTypes[T][Z] | Promise<ModelTypes[T][Z]> | X : never,
) => fn as (args?: any, source?: any) => ReturnType<typeof fn>;

export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<UnwrapPromise<ReturnType<T>>>;
export type ZeusHook<
  T extends (...args: any[]) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>,
> = ZeusState<ReturnType<T>[N]>;

export type WithTypeNameValue<T> = T & {
  __typename?: boolean;
  __directives?: string;
};
export type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};
type DeepAnify<T> = {
  [P in keyof T]?: any;
};
type IsPayLoad<T> = T extends [any, infer PayLoad] ? PayLoad : T;
export type ScalarDefinition = Record<string, ScalarResolver>;

type IsScalar<S, SCLR extends ScalarDefinition> = S extends 'scalar' & { name: infer T }
  ? T extends keyof SCLR
  ? SCLR[T]['decode'] extends (s: unknown) => unknown
  ? ReturnType<SCLR[T]['decode']>
  : unknown
  : unknown
  : S;
type IsArray<T, U, SCLR extends ScalarDefinition> = T extends Array<infer R>
  ? InputType<R, U, SCLR>[]
  : InputType<T, U, SCLR>;
type FlattenArray<T> = T extends Array<infer R> ? R : T;
type BaseZeusResolver = boolean | 1 | string | Variable<any, string>;

type IsInterfaced<SRC extends DeepAnify<DST>, DST, SCLR extends ScalarDefinition> = FlattenArray<SRC> extends
  | ZEUS_INTERFACES
  | ZEUS_UNIONS
  ? {
    [P in keyof SRC]: SRC[P] extends '__union' & infer R
    ? P extends keyof DST
    ? IsArray<R, '__typename' extends keyof DST ? DST[P] & { __typename: true } : DST[P], SCLR>
    : IsArray<R, '__typename' extends keyof DST ? { __typename: true } : Record<string, never>, SCLR>
    : never;
  }[keyof SRC] & {
    [P in keyof Omit<
      Pick<
        SRC,
        {
          [P in keyof DST]: SRC[P] extends '__union' & infer R ? never : P;
        }[keyof DST]
      >,
      '__typename'
    >]: IsPayLoad<DST[P]> extends BaseZeusResolver ? IsScalar<SRC[P], SCLR> : IsArray<SRC[P], DST[P], SCLR>;
  }
  : {
    [P in keyof Pick<SRC, keyof DST>]: IsPayLoad<DST[P]> extends BaseZeusResolver
    ? IsScalar<SRC[P], SCLR>
    : IsArray<SRC[P], DST[P], SCLR>;
  };

export type MapType<SRC, DST, SCLR extends ScalarDefinition> = SRC extends DeepAnify<DST>
  ? IsInterfaced<SRC, DST, SCLR>
  : never;
// eslint-disable-next-line @typescript-eslint/ban-types
export type InputType<SRC, DST, SCLR extends ScalarDefinition = {}> = IsPayLoad<DST> extends { __alias: infer R }
  ? {
    [P in keyof R]: MapType<SRC, R[P], SCLR>[keyof MapType<SRC, R[P], SCLR>];
  } & MapType<SRC, Omit<IsPayLoad<DST>, '__alias'>, SCLR>
  : MapType<SRC, IsPayLoad<DST>, SCLR>;
export type SubscriptionToGraphQL<Z, T, SCLR extends ScalarDefinition> = {
  ws: WebSocket;
  on: (fn: (args: InputType<T, Z, SCLR>) => void) => void;
  off: (fn: (e: { data?: InputType<T, Z, SCLR>; code?: number; reason?: string; message?: string }) => void) => void;
  error: (fn: (e: { data?: InputType<T, Z, SCLR>; errors?: string[] }) => void) => void;
  open: () => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type FromSelector<SELECTOR, NAME extends keyof GraphQLTypes, SCLR extends ScalarDefinition = {}> = InputType<
  GraphQLTypes[NAME],
  SELECTOR,
  SCLR
>;

export type ScalarResolver = {
  encode?: (s: unknown) => string;
  decode?: (s: unknown) => unknown;
};

export type SelectionFunction<V> = <Z extends V>(
  t: Z & {
    [P in keyof Z]: P extends keyof V ? Z[P] : never;
  },
) => Z;

type BuiltInVariableTypes = {
  ['String']: string;
  ['Int']: number;
  ['Float']: number;
  ['ID']: unknown;
  ['Boolean']: boolean;
};
type AllVariableTypes = keyof BuiltInVariableTypes | keyof ZEUS_VARIABLES;
type VariableRequired<T extends string> = `${T}!` | T | `[${T}]` | `[${T}]!` | `[${T}!]` | `[${T}!]!`;
type VR<T extends string> = VariableRequired<VariableRequired<T>>;

export type GraphQLVariableType = VR<AllVariableTypes>;

type ExtractVariableTypeString<T extends string> = T extends VR<infer R1>
  ? R1 extends VR<infer R2>
  ? R2 extends VR<infer R3>
  ? R3 extends VR<infer R4>
  ? R4 extends VR<infer R5>
  ? R5
  : R4
  : R3
  : R2
  : R1
  : T;

type DecomposeType<T, Type> = T extends `[${infer R}]`
  ? Array<DecomposeType<R, Type>> | undefined
  : T extends `${infer R}!`
  ? NonNullable<DecomposeType<R, Type>>
  : Type | undefined;

type ExtractTypeFromGraphQLType<T extends string> = T extends keyof ZEUS_VARIABLES
  ? ZEUS_VARIABLES[T]
  : T extends keyof BuiltInVariableTypes
  ? BuiltInVariableTypes[T]
  : any;

export type GetVariableType<T extends string> = DecomposeType<
  T,
  ExtractTypeFromGraphQLType<ExtractVariableTypeString<T>>
>;

type UndefinedKeys<T> = {
  [K in keyof T]-?: T[K] extends NonNullable<T[K]> ? never : K;
}[keyof T];

type WithNullableKeys<T> = Pick<T, UndefinedKeys<T>>;
type WithNonNullableKeys<T> = Omit<T, UndefinedKeys<T>>;

type OptionalKeys<T> = {
  [P in keyof T]?: T[P];
};

export type WithOptionalNullables<T> = OptionalKeys<WithNullableKeys<T>> & WithNonNullableKeys<T>;

export type Variable<T extends GraphQLVariableType, Name extends string> = {
  ' __zeus_name': Name;
  ' __zeus_type': T;
};

export type ExtractVariablesDeep<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends string | number | boolean | Array<string | number | boolean>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
  {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariablesDeep<Query[K]>> }[keyof Query]>;

export type ExtractVariables<Query> = Query extends Variable<infer VType, infer VName>
  ? { [key in VName]: GetVariableType<VType> }
  : Query extends [infer Inputs, infer Outputs]
  ? ExtractVariablesDeep<Inputs> & ExtractVariables<Outputs>
  : Query extends string | number | boolean | Array<string | number | boolean>
  ? // eslint-disable-next-line @typescript-eslint/ban-types
  {}
  : UnionToIntersection<{ [K in keyof Query]: WithOptionalNullables<ExtractVariables<Query[K]>> }[keyof Query]>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export const START_VAR_NAME = `$ZEUS_VAR`;
export const GRAPHQL_TYPE_SEPARATOR = `__$GRAPHQL__`;

export const $ = <Type extends GraphQLVariableType, Name extends string>(name: Name, graphqlType: Type) => {
  return (START_VAR_NAME + name + GRAPHQL_TYPE_SEPARATOR + graphqlType) as unknown as Variable<Type, Name>;
};
type ZEUS_INTERFACES = never
export type ScalarCoders = {
  File?: ScalarResolver;
  DateTime?: ScalarResolver;
}
type ZEUS_UNIONS = never

export type ValueTypes = {
  ["Subscription"]: AliasType<{
    wsConnectionInitial?: boolean | `@${string}`,
    typingStatusUpdated?: ValueTypes["UserTypingStatus"],
    onlineStatusChanged?: [{ userId: string | Variable<any, string> }, boolean | `@${string}`],
    userUpdated?: ValueTypes["User"],
    chatUpdated?: ValueTypes["Chat"],
    chatCreated?: ValueTypes["Chat"],
    chatDeleted?: boolean | `@${string}`,
    newMessage?: ValueTypes["Message"],
    messageUpdated?: ValueTypes["Message"],
    unreadMessagesCountChange?: ValueTypes["UnreadMessagesCount"],
    onIncomingKeySharingTransaction?: ValueTypes["IncomingKeySharingTransaction"],
    onReceivedKeySharingTransactionPublicKey?: [{ transactionId: string | Variable<any, string> }, boolean | `@${string}`],
    onReceivedKeySharingTransactionEncryptedKey?: [{ transactionId: string | Variable<any, string> }, boolean | `@${string}`],
    onKeySharingTransactionSuccess?: [{ transactionId: string | Variable<any, string> }, boolean | `@${string}`],
    __typename?: boolean | `@${string}`
  }>;
  ["AuthPayload"]: AliasType<{
    token?: boolean | `@${string}`,
    user?: ValueTypes["User"],
    __typename?: boolean | `@${string}`
  }>;
  ["Role"]: Role;
  ["User"]: AliasType<{
    id?: boolean | `@${string}`,
    username?: boolean | `@${string}`,
    displayName?: boolean | `@${string}`,
    avatar?: boolean | `@${string}`,
    email?: boolean | `@${string}`,
    emailVerified?: boolean | `@${string}`,
    role?: boolean | `@${string}`,
    chats?: ValueTypes["Chat"],
    isOnline?: boolean | `@${string}`,
    __typename?: boolean | `@${string}`
  }>;
  ["UserQueryInput"]: {
    search?: string | undefined | null | Variable<any, string>
  };
  ["Query"]: AliasType<{
    users?: [{ input?: ValueTypes["UserQueryInput"] | undefined | null | Variable<any, string> }, ValueTypes["User"]],
    me?: ValueTypes["User"],
    myChats?: ValueTypes["Chat"],
    myChat?: [{ chatId: string | Variable<any, string> }, ValueTypes["Chat"]],
    __typename?: boolean | `@${string}`
  }>;
  ["CreateUserInput"]: {
    username: string | Variable<any, string>,
    email: string | Variable<any, string>,
    password: string | Variable<any, string>,
    confirm_password: string | Variable<any, string>
  };
  ["Mutation"]: AliasType<{
    createUser?: [{ input: ValueTypes["CreateUserInput"] | Variable<any, string> }, ValueTypes["User"]],
    createGuestUser?: ValueTypes["AuthPayload"],
    loginUser?: [{ input: ValueTypes["LoginUserInput"] | Variable<any, string> }, ValueTypes["AuthPayload"]],
    refreshToken?: ValueTypes["AuthPayload"],
    updateTypingStatus?: [{ chatId: string | Variable<any, string>, isTyping: boolean | Variable<any, string> }, boolean | `@${string}`],
    sendEmailVerification?: boolean | `@${string}`,
    verifyEmail?: [{ input: ValueTypes["VerifyEmailInput"] | Variable<any, string> }, boolean | `@${string}`],
    updateUser?: [{ input: ValueTypes["UpdateUserInput"] | Variable<any, string> }, boolean | `@${string}`],
    logoutUser?: boolean | `@${string}`,
    createUserChat?: [{ input: ValueTypes["CreateChatInput"] | Variable<any, string> }, ValueTypes["Chat"]],
    deleteUserChat?: [{ input: ValueTypes["DeleteUserChatInput"] | Variable<any, string> }, boolean | `@${string}`],
    updateChat?: [{ input: ValueTypes["UpdateChatInput"] | Variable<any, string> }, boolean | `@${string}`],
    addUserToChat?: [{ input: ValueTypes["AddUserToChatInput"] | Variable<any, string> }, boolean | `@${string}`],
    sendMessage?: [{ input: ValueTypes["SendMessageInput"] | Variable<any, string> }, boolean | `@${string}`],
    readMessage?: [{ messageId: string | Variable<any, string> }, boolean | `@${string}`],
    sendKeySharingTransaction?: [{ input: ValueTypes["SendKeySharingTransactionInput"] | Variable<any, string> }, boolean | `@${string}`],
    sendKeySharingTransactionPublicKey?: [{ input: ValueTypes["SendKeySharingTransactionPublicKeyInput"] | Variable<any, string> }, boolean | `@${string}`],
    sendKeySharingTransactionEncryptedKey?: [{ input: ValueTypes["SendKeySharingTransactionEncryptedKeyInput"] | Variable<any, string> }, boolean | `@${string}`],
    sendKeySharingTransactionSuccess?: [{ input: ValueTypes["SendKeySharingTransactionSuccessInput"] | Variable<any, string> }, boolean | `@${string}`],
    __typename?: boolean | `@${string}`
  }>;
  ["LoginUserInput"]: {
    username: string | Variable<any, string>,
    password: string | Variable<any, string>
  };
  ["VerifyEmailInput"]: {
    code: string | Variable<any, string>
  };
  ["File"]: unknown;
  ["UpdateUserInput"]: {
    displayName?: string | undefined | null | Variable<any, string>,
    avatar?: ValueTypes["File"] | undefined | null | Variable<any, string>
  };
  ["UserTypingStatus"]: AliasType<{
    userId?: boolean | `@${string}`,
    chatId?: boolean | `@${string}`,
    isTyping?: boolean | `@${string}`,
    __typename?: boolean | `@${string}`
  }>;
  ["DateTime"]: unknown;
  ["Chat"]: AliasType<{
    id?: boolean | `@${string}`,
    name?: boolean | `@${string}`,
    avatar?: boolean | `@${string}`,
    owner_id?: boolean | `@${string}`,
    updated_at?: boolean | `@${string}`,
    unread_messages_count?: boolean | `@${string}`,
    users?: ValueTypes["User"],
    messages?: [{ lastMessageId?: string | undefined | null | Variable<any, string> }, ValueTypes["Message"]],
    __typename?: boolean | `@${string}`
  }>;
  ["CreateChatInput"]: {
    name?: string | undefined | null | Variable<any, string>,
    avatar?: string | undefined | null | Variable<any, string>,
    userIds: Array<string> | Variable<any, string>
  };
  ["DeleteUserChatInput"]: {
    chatId: string | Variable<any, string>,
    userId?: string | undefined | null | Variable<any, string>
  };
  ["UpdateChatInput"]: {
    id: string | Variable<any, string>,
    name?: string | undefined | null | Variable<any, string>,
    avatar?: ValueTypes["File"] | undefined | null | Variable<any, string>
  };
  ["AddUserToChatInput"]: {
    chatId: string | Variable<any, string>,
    userId: string | Variable<any, string>
  };
  ["MessageFile"]: AliasType<{
    id?: boolean | `@${string}`,
    message_id?: boolean | `@${string}`,
    chat_id?: boolean | `@${string}`,
    file_name?: boolean | `@${string}`,
    file_size?: boolean | `@${string}`,
    file_type?: boolean | `@${string}`,
    file_url?: boolean | `@${string}`,
    upload_timestamp?: boolean | `@${string}`,
    __typename?: boolean | `@${string}`
  }>;
  ["Message"]: AliasType<{
    id?: boolean | `@${string}`,
    chat_id?: boolean | `@${string}`,
    user_id?: boolean | `@${string}`,
    type?: boolean | `@${string}`,
    is_read?: boolean | `@${string}`,
    content?: boolean | `@${string}`,
    timestamp?: boolean | `@${string}`,
    disable_encryption?: boolean | `@${string}`,
    files?: ValueTypes["MessageFile"],
    __typename?: boolean | `@${string}`
  }>;
  ["UploadedEncryptedFileInput"]: {
    filename: string | Variable<any, string>,
    mimeType: string | Variable<any, string>,
    content: string | Variable<any, string>,
    isEncrypted: boolean | Variable<any, string>
  };
  ["SendMessageInput"]: {
    chatId: string | Variable<any, string>,
    content: string | Variable<any, string>,
    disableEncryption: boolean | Variable<any, string>,
    files?: Array<ValueTypes["UploadedEncryptedFileInput"]> | undefined | null | Variable<any, string>
  };
  ["UnreadMessagesCount"]: AliasType<{
    chatId?: boolean | `@${string}`,
    unreadCount?: boolean | `@${string}`,
    __typename?: boolean | `@${string}`
  }>;
  ["SendKeySharingTransactionInput"]: {
    chatId: string | Variable<any, string>,
    userId: string | Variable<any, string>
  };
  ["IncomingKeySharingTransaction"]: AliasType<{
    chatId?: boolean | `@${string}`,
    senderId?: boolean | `@${string}`,
    transactionId?: boolean | `@${string}`,
    __typename?: boolean | `@${string}`
  }>;
  ["SendKeySharingTransactionPublicKeyInput"]: {
    transactionId: string | Variable<any, string>,
    publicKey: string | Variable<any, string>
  };
  ["SendKeySharingTransactionEncryptedKeyInput"]: {
    transactionId: string | Variable<any, string>,
    encryptedKey: string | Variable<any, string>
  };
  ["SendKeySharingTransactionSuccessInput"]: {
    transactionId: string | Variable<any, string>,
    success: boolean | Variable<any, string>
  }
}

export type ResolverInputTypes = {
  ["Subscription"]: AliasType<{
    wsConnectionInitial?: boolean | `@${string}`,
    typingStatusUpdated?: ResolverInputTypes["UserTypingStatus"],
    onlineStatusChanged?: [{ userId: string }, boolean | `@${string}`],
    userUpdated?: ResolverInputTypes["User"],
    chatUpdated?: ResolverInputTypes["Chat"],
    chatCreated?: ResolverInputTypes["Chat"],
    chatDeleted?: boolean | `@${string}`,
    newMessage?: ResolverInputTypes["Message"],
    messageUpdated?: ResolverInputTypes["Message"],
    unreadMessagesCountChange?: ResolverInputTypes["UnreadMessagesCount"],
    onIncomingKeySharingTransaction?: ResolverInputTypes["IncomingKeySharingTransaction"],
    onReceivedKeySharingTransactionPublicKey?: [{ transactionId: string }, boolean | `@${string}`],
    onReceivedKeySharingTransactionEncryptedKey?: [{ transactionId: string }, boolean | `@${string}`],
    onKeySharingTransactionSuccess?: [{ transactionId: string }, boolean | `@${string}`],
    __typename?: boolean | `@${string}`
  }>;
  ["AuthPayload"]: AliasType<{
    token?: boolean | `@${string}`,
    user?: ResolverInputTypes["User"],
    __typename?: boolean | `@${string}`
  }>;
  ["Role"]: Role;
  ["User"]: AliasType<{
    id?: boolean | `@${string}`,
    username?: boolean | `@${string}`,
    displayName?: boolean | `@${string}`,
    avatar?: boolean | `@${string}`,
    email?: boolean | `@${string}`,
    emailVerified?: boolean | `@${string}`,
    role?: boolean | `@${string}`,
    chats?: ResolverInputTypes["Chat"],
    isOnline?: boolean | `@${string}`,
    __typename?: boolean | `@${string}`
  }>;
  ["UserQueryInput"]: {
    search?: string | undefined | null
  };
  ["Query"]: AliasType<{
    users?: [{ input?: ResolverInputTypes["UserQueryInput"] | undefined | null }, ResolverInputTypes["User"]],
    me?: ResolverInputTypes["User"],
    myChats?: ResolverInputTypes["Chat"],
    myChat?: [{ chatId: string }, ResolverInputTypes["Chat"]],
    __typename?: boolean | `@${string}`
  }>;
  ["CreateUserInput"]: {
    username: string,
    email: string,
    password: string,
    confirm_password: string
  };
  ["Mutation"]: AliasType<{
    createUser?: [{ input: ResolverInputTypes["CreateUserInput"] }, ResolverInputTypes["User"]],
    createGuestUser?: ResolverInputTypes["AuthPayload"],
    loginUser?: [{ input: ResolverInputTypes["LoginUserInput"] }, ResolverInputTypes["AuthPayload"]],
    refreshToken?: ResolverInputTypes["AuthPayload"],
    updateTypingStatus?: [{ chatId: string, isTyping: boolean }, boolean | `@${string}`],
    sendEmailVerification?: boolean | `@${string}`,
    verifyEmail?: [{ input: ResolverInputTypes["VerifyEmailInput"] }, boolean | `@${string}`],
    updateUser?: [{ input: ResolverInputTypes["UpdateUserInput"] }, boolean | `@${string}`],
    logoutUser?: boolean | `@${string}`,
    createUserChat?: [{ input: ResolverInputTypes["CreateChatInput"] }, ResolverInputTypes["Chat"]],
    deleteUserChat?: [{ input: ResolverInputTypes["DeleteUserChatInput"] }, boolean | `@${string}`],
    updateChat?: [{ input: ResolverInputTypes["UpdateChatInput"] }, boolean | `@${string}`],
    addUserToChat?: [{ input: ResolverInputTypes["AddUserToChatInput"] }, boolean | `@${string}`],
    sendMessage?: [{ input: ResolverInputTypes["SendMessageInput"] }, boolean | `@${string}`],
    readMessage?: [{ messageId: string }, boolean | `@${string}`],
    sendKeySharingTransaction?: [{ input: ResolverInputTypes["SendKeySharingTransactionInput"] }, boolean | `@${string}`],
    sendKeySharingTransactionPublicKey?: [{ input: ResolverInputTypes["SendKeySharingTransactionPublicKeyInput"] }, boolean | `@${string}`],
    sendKeySharingTransactionEncryptedKey?: [{ input: ResolverInputTypes["SendKeySharingTransactionEncryptedKeyInput"] }, boolean | `@${string}`],
    sendKeySharingTransactionSuccess?: [{ input: ResolverInputTypes["SendKeySharingTransactionSuccessInput"] }, boolean | `@${string}`],
    __typename?: boolean | `@${string}`
  }>;
  ["LoginUserInput"]: {
    username: string,
    password: string
  };
  ["VerifyEmailInput"]: {
    code: string
  };
  ["File"]: unknown;
  ["UpdateUserInput"]: {
    displayName?: string | undefined | null,
    avatar?: ResolverInputTypes["File"] | undefined | null
  };
  ["UserTypingStatus"]: AliasType<{
    userId?: boolean | `@${string}`,
    chatId?: boolean | `@${string}`,
    isTyping?: boolean | `@${string}`,
    __typename?: boolean | `@${string}`
  }>;
  ["DateTime"]: unknown;
  ["Chat"]: AliasType<{
    id?: boolean | `@${string}`,
    name?: boolean | `@${string}`,
    avatar?: boolean | `@${string}`,
    owner_id?: boolean | `@${string}`,
    updated_at?: boolean | `@${string}`,
    unread_messages_count?: boolean | `@${string}`,
    users?: ResolverInputTypes["User"],
    messages?: [{ lastMessageId?: string | undefined | null }, ResolverInputTypes["Message"]],
    __typename?: boolean | `@${string}`
  }>;
  ["CreateChatInput"]: {
    name?: string | undefined | null,
    avatar?: string | undefined | null,
    userIds: Array<string>
  };
  ["DeleteUserChatInput"]: {
    chatId: string,
    userId?: string | undefined | null
  };
  ["UpdateChatInput"]: {
    id: string,
    name?: string | undefined | null,
    avatar?: ResolverInputTypes["File"] | undefined | null
  };
  ["AddUserToChatInput"]: {
    chatId: string,
    userId: string
  };
  ["MessageFile"]: AliasType<{
    id?: boolean | `@${string}`,
    message_id?: boolean | `@${string}`,
    chat_id?: boolean | `@${string}`,
    file_name?: boolean | `@${string}`,
    file_size?: boolean | `@${string}`,
    file_type?: boolean | `@${string}`,
    file_url?: boolean | `@${string}`,
    upload_timestamp?: boolean | `@${string}`,
    __typename?: boolean | `@${string}`
  }>;
  ["Message"]: AliasType<{
    id?: boolean | `@${string}`,
    chat_id?: boolean | `@${string}`,
    user_id?: boolean | `@${string}`,
    type?: boolean | `@${string}`,
    is_read?: boolean | `@${string}`,
    content?: boolean | `@${string}`,
    timestamp?: boolean | `@${string}`,
    disable_encryption?: boolean | `@${string}`,
    files?: ResolverInputTypes["MessageFile"],
    __typename?: boolean | `@${string}`
  }>;
  ["UploadedEncryptedFileInput"]: {
    filename: string,
    mimeType: string,
    content: string,
    isEncrypted: boolean
  };
  ["SendMessageInput"]: {
    chatId: string,
    content: string,
    disableEncryption: boolean,
    files?: Array<ResolverInputTypes["UploadedEncryptedFileInput"]> | undefined | null
  };
  ["UnreadMessagesCount"]: AliasType<{
    chatId?: boolean | `@${string}`,
    unreadCount?: boolean | `@${string}`,
    __typename?: boolean | `@${string}`
  }>;
  ["SendKeySharingTransactionInput"]: {
    chatId: string,
    userId: string
  };
  ["IncomingKeySharingTransaction"]: AliasType<{
    chatId?: boolean | `@${string}`,
    senderId?: boolean | `@${string}`,
    transactionId?: boolean | `@${string}`,
    __typename?: boolean | `@${string}`
  }>;
  ["SendKeySharingTransactionPublicKeyInput"]: {
    transactionId: string,
    publicKey: string
  };
  ["SendKeySharingTransactionEncryptedKeyInput"]: {
    transactionId: string,
    encryptedKey: string
  };
  ["SendKeySharingTransactionSuccessInput"]: {
    transactionId: string,
    success: boolean
  };
  ["schema"]: AliasType<{
    query?: ResolverInputTypes["Query"],
    mutation?: ResolverInputTypes["Mutation"],
    subscription?: ResolverInputTypes["Subscription"],
    __typename?: boolean | `@${string}`
  }>
}

export type ModelTypes = {
  ["Subscription"]: {
    wsConnectionInitial: boolean,
    typingStatusUpdated: ModelTypes["UserTypingStatus"],
    onlineStatusChanged: boolean,
    userUpdated: ModelTypes["User"],
    chatUpdated: ModelTypes["Chat"],
    chatCreated: ModelTypes["Chat"],
    chatDeleted: string,
    newMessage: ModelTypes["Message"],
    messageUpdated: ModelTypes["Message"],
    unreadMessagesCountChange: ModelTypes["UnreadMessagesCount"],
    onIncomingKeySharingTransaction: ModelTypes["IncomingKeySharingTransaction"],
    onReceivedKeySharingTransactionPublicKey: string,
    onReceivedKeySharingTransactionEncryptedKey: string,
    onKeySharingTransactionSuccess: boolean
  };
  ["AuthPayload"]: {
    token: string,
    user: ModelTypes["User"]
  };
  ["Role"]: Role;
  ["User"]: {
    id: string,
    username: string,
    displayName?: string | undefined | null,
    avatar?: string | undefined | null,
    email?: string | undefined | null,
    emailVerified?: boolean | undefined | null,
    role?: ModelTypes["Role"] | undefined | null,
    chats?: Array<ModelTypes["Chat"]> | undefined | null,
    isOnline?: boolean | undefined | null
  };
  ["UserQueryInput"]: {
    search?: string | undefined | null
  };
  ["Query"]: {
    users: Array<ModelTypes["User"]>,
    me: ModelTypes["User"],
    myChats: Array<ModelTypes["Chat"]>,
    myChat: ModelTypes["Chat"]
  };
  ["CreateUserInput"]: {
    username: string,
    email: string,
    password: string,
    confirm_password: string
  };
  ["Mutation"]: {
    createUser: ModelTypes["User"],
    createGuestUser: ModelTypes["AuthPayload"],
    loginUser: ModelTypes["AuthPayload"],
    refreshToken: ModelTypes["AuthPayload"],
    updateTypingStatus: boolean,
    sendEmailVerification: boolean,
    verifyEmail: boolean,
    updateUser: boolean,
    logoutUser: boolean,
    createUserChat: ModelTypes["Chat"],
    deleteUserChat: boolean,
    updateChat: boolean,
    addUserToChat: boolean,
    sendMessage: boolean,
    readMessage: boolean,
    sendKeySharingTransaction: string,
    sendKeySharingTransactionPublicKey: boolean,
    sendKeySharingTransactionEncryptedKey: boolean,
    sendKeySharingTransactionSuccess: boolean
  };
  ["LoginUserInput"]: {
    username: string,
    password: string
  };
  ["VerifyEmailInput"]: {
    code: string
  };
  ["File"]: any;
  ["UpdateUserInput"]: {
    displayName?: string | undefined | null,
    avatar?: ModelTypes["File"] | undefined | null
  };
  ["UserTypingStatus"]: {
    userId: string,
    chatId: string,
    isTyping: boolean
  };
  ["DateTime"]: any;
  ["Chat"]: {
    id: string,
    name: string,
    avatar?: string | undefined | null,
    owner_id: string,
    updated_at: ModelTypes["DateTime"],
    unread_messages_count?: number | undefined | null,
    users?: Array<ModelTypes["User"]> | undefined | null,
    messages?: Array<ModelTypes["Message"]> | undefined | null
  };
  ["CreateChatInput"]: {
    name?: string | undefined | null,
    avatar?: string | undefined | null,
    userIds: Array<string>
  };
  ["DeleteUserChatInput"]: {
    chatId: string,
    userId?: string | undefined | null
  };
  ["UpdateChatInput"]: {
    id: string,
    name?: string | undefined | null,
    avatar?: ModelTypes["File"] | undefined | null
  };
  ["AddUserToChatInput"]: {
    chatId: string,
    userId: string
  };
  ["MessageFile"]: {
    id?: string | undefined | null,
    message_id?: string | undefined | null,
    chat_id?: string | undefined | null,
    file_name: string,
    file_size: number,
    file_type: string,
    file_url?: string | undefined | null,
    upload_timestamp?: string | undefined | null
  };
  ["Message"]: {
    id: string,
    chat_id: string,
    user_id: string,
    type: string,
    is_read?: boolean | undefined | null,
    content: string,
    timestamp: string,
    disable_encryption: boolean,
    files?: Array<ModelTypes["MessageFile"]> | undefined | null
  };
  ["UploadedEncryptedFileInput"]: {
    filename: string,
    mimeType: string,
    content: string,
    isEncrypted: boolean
  };
  ["SendMessageInput"]: {
    chatId: string,
    content: string,
    disableEncryption: boolean,
    files?: Array<ModelTypes["UploadedEncryptedFileInput"]> | undefined | null
  };
  ["UnreadMessagesCount"]: {
    chatId: string,
    unreadCount: number
  };
  ["SendKeySharingTransactionInput"]: {
    chatId: string,
    userId: string
  };
  ["IncomingKeySharingTransaction"]: {
    chatId: string,
    senderId: string,
    transactionId: string
  };
  ["SendKeySharingTransactionPublicKeyInput"]: {
    transactionId: string,
    publicKey: string
  };
  ["SendKeySharingTransactionEncryptedKeyInput"]: {
    transactionId: string,
    encryptedKey: string
  };
  ["SendKeySharingTransactionSuccessInput"]: {
    transactionId: string,
    success: boolean
  };
  ["schema"]: {
    query?: ModelTypes["Query"] | undefined | null,
    mutation?: ModelTypes["Mutation"] | undefined | null,
    subscription?: ModelTypes["Subscription"] | undefined | null
  }
}

export type GraphQLTypes = {
  ["Subscription"]: {
    __typename: "Subscription",
    wsConnectionInitial: boolean,
    typingStatusUpdated: GraphQLTypes["UserTypingStatus"],
    onlineStatusChanged: boolean,
    userUpdated: GraphQLTypes["User"],
    chatUpdated: GraphQLTypes["Chat"],
    chatCreated: GraphQLTypes["Chat"],
    chatDeleted: string,
    newMessage: GraphQLTypes["Message"],
    messageUpdated: GraphQLTypes["Message"],
    unreadMessagesCountChange: GraphQLTypes["UnreadMessagesCount"],
    onIncomingKeySharingTransaction: GraphQLTypes["IncomingKeySharingTransaction"],
    onReceivedKeySharingTransactionPublicKey: string,
    onReceivedKeySharingTransactionEncryptedKey: string,
    onKeySharingTransactionSuccess: boolean
  };
  ["AuthPayload"]: {
    __typename: "AuthPayload",
    token: string,
    user: GraphQLTypes["User"]
  };
  ["Role"]: Role;
  ["User"]: {
    __typename: "User",
    id: string,
    username: string,
    displayName?: string | undefined | null,
    avatar?: string | undefined | null,
    email?: string | undefined | null,
    emailVerified?: boolean | undefined | null,
    role?: GraphQLTypes["Role"] | undefined | null,
    chats?: Array<GraphQLTypes["Chat"]> | undefined | null,
    isOnline?: boolean | undefined | null
  };
  ["UserQueryInput"]: {
    search?: string | undefined | null
  };
  ["Query"]: {
    __typename: "Query",
    users: Array<GraphQLTypes["User"]>,
    me: GraphQLTypes["User"],
    myChats: Array<GraphQLTypes["Chat"]>,
    myChat: GraphQLTypes["Chat"]
  };
  ["CreateUserInput"]: {
    username: string,
    email: string,
    password: string,
    confirm_password: string
  };
  ["Mutation"]: {
    __typename: "Mutation",
    createUser: GraphQLTypes["User"],
    createGuestUser: GraphQLTypes["AuthPayload"],
    loginUser: GraphQLTypes["AuthPayload"],
    refreshToken: GraphQLTypes["AuthPayload"],
    updateTypingStatus: boolean,
    sendEmailVerification: boolean,
    verifyEmail: boolean,
    updateUser: boolean,
    logoutUser: boolean,
    createUserChat: GraphQLTypes["Chat"],
    deleteUserChat: boolean,
    updateChat: boolean,
    addUserToChat: boolean,
    sendMessage: boolean,
    readMessage: boolean,
    sendKeySharingTransaction: string,
    sendKeySharingTransactionPublicKey: boolean,
    sendKeySharingTransactionEncryptedKey: boolean,
    sendKeySharingTransactionSuccess: boolean
  };
  ["LoginUserInput"]: {
    username: string,
    password: string
  };
  ["VerifyEmailInput"]: {
    code: string
  };
  ["File"]: "scalar" & { name: "File" };
  ["UpdateUserInput"]: {
    displayName?: string | undefined | null,
    avatar?: GraphQLTypes["File"] | undefined | null
  };
  ["UserTypingStatus"]: {
    __typename: "UserTypingStatus",
    userId: string,
    chatId: string,
    isTyping: boolean
  };
  ["DateTime"]: "scalar" & { name: "DateTime" };
  ["Chat"]: {
    __typename: "Chat",
    id: string,
    name: string,
    avatar?: string | undefined | null,
    owner_id: string,
    updated_at: GraphQLTypes["DateTime"],
    unread_messages_count?: number | undefined | null,
    users?: Array<GraphQLTypes["User"]> | undefined | null,
    messages?: Array<GraphQLTypes["Message"]> | undefined | null
  };
  ["CreateChatInput"]: {
    name?: string | undefined | null,
    avatar?: string | undefined | null,
    userIds: Array<string>
  };
  ["DeleteUserChatInput"]: {
    chatId: string,
    userId?: string | undefined | null
  };
  ["UpdateChatInput"]: {
    id: string,
    name?: string | undefined | null,
    avatar?: GraphQLTypes["File"] | undefined | null
  };
  ["AddUserToChatInput"]: {
    chatId: string,
    userId: string
  };
  ["MessageFile"]: {
    __typename: "MessageFile",
    id?: string | undefined | null,
    message_id?: string | undefined | null,
    chat_id?: string | undefined | null,
    file_name: string,
    file_size: number,
    file_type: string,
    file_url?: string | undefined | null,
    upload_timestamp?: string | undefined | null
  };
  ["Message"]: {
    __typename: "Message",
    id: string,
    chat_id: string,
    user_id: string,
    type: string,
    is_read?: boolean | undefined | null,
    content: string,
    timestamp: string,
    disable_encryption: boolean,
    files?: Array<GraphQLTypes["MessageFile"]> | undefined | null
  };
  ["UploadedEncryptedFileInput"]: {
    filename: string,
    mimeType: string,
    content: string,
    isEncrypted: boolean
  };
  ["SendMessageInput"]: {
    chatId: string,
    content: string,
    disableEncryption: boolean,
    files?: Array<GraphQLTypes["UploadedEncryptedFileInput"]> | undefined | null
  };
  ["UnreadMessagesCount"]: {
    __typename: "UnreadMessagesCount",
    chatId: string,
    unreadCount: number
  };
  ["SendKeySharingTransactionInput"]: {
    chatId: string,
    userId: string
  };
  ["IncomingKeySharingTransaction"]: {
    __typename: "IncomingKeySharingTransaction",
    chatId: string,
    senderId: string,
    transactionId: string
  };
  ["SendKeySharingTransactionPublicKeyInput"]: {
    transactionId: string,
    publicKey: string
  };
  ["SendKeySharingTransactionEncryptedKeyInput"]: {
    transactionId: string,
    encryptedKey: string
  };
  ["SendKeySharingTransactionSuccessInput"]: {
    transactionId: string,
    success: boolean
  }
}
export enum Role {
  USER = "USER",
  GUEST = "GUEST"
}

type ZEUS_VARIABLES = {
  ["Role"]: ValueTypes["Role"];
  ["UserQueryInput"]: ValueTypes["UserQueryInput"];
  ["CreateUserInput"]: ValueTypes["CreateUserInput"];
  ["LoginUserInput"]: ValueTypes["LoginUserInput"];
  ["VerifyEmailInput"]: ValueTypes["VerifyEmailInput"];
  ["File"]: ValueTypes["File"];
  ["UpdateUserInput"]: ValueTypes["UpdateUserInput"];
  ["DateTime"]: ValueTypes["DateTime"];
  ["CreateChatInput"]: ValueTypes["CreateChatInput"];
  ["DeleteUserChatInput"]: ValueTypes["DeleteUserChatInput"];
  ["UpdateChatInput"]: ValueTypes["UpdateChatInput"];
  ["AddUserToChatInput"]: ValueTypes["AddUserToChatInput"];
  ["UploadedEncryptedFileInput"]: ValueTypes["UploadedEncryptedFileInput"];
  ["SendMessageInput"]: ValueTypes["SendMessageInput"];
  ["SendKeySharingTransactionInput"]: ValueTypes["SendKeySharingTransactionInput"];
  ["SendKeySharingTransactionPublicKeyInput"]: ValueTypes["SendKeySharingTransactionPublicKeyInput"];
  ["SendKeySharingTransactionEncryptedKeyInput"]: ValueTypes["SendKeySharingTransactionEncryptedKeyInput"];
  ["SendKeySharingTransactionSuccessInput"]: ValueTypes["SendKeySharingTransactionSuccessInput"];
}