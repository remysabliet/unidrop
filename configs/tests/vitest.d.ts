import { Assertion, AsymmetricMatchersContaining, MockInstance } from 'vitest'

export type FetchParametersWithInit = [string | URL | Request, RequestInit]

interface CustomMatchers<R = unknown> {
  toHaveBeenCalledWithFetchArgs: (url: FetchParametersWithInit[0], options: FetchParametersWithInit[1]) => R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
