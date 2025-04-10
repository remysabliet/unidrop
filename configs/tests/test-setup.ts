import { MockInstance, expect, vi } from 'vitest'
import { FetchParametersWithInit } from './vitest' // Adjust path as needed

expect.extend({
  toHaveBeenCalledWithFetchArgs(
    received: MockInstance<(input: string | URL | Request, init: RequestInit) => Promise<Response>>,
    url: FetchParametersWithInit[0],
    { body, ...options }: FetchParametersWithInit[1],
  ) {
    const [actualUrl, { body: actualBody, ...actualOptions }] = received.mock.calls[0]
    const { isNot, equals } = this
    const parsedBody = JSON.parse(body as string)
    const parsedActualBody = JSON.parse(actualBody as string)
    return {
      pass: url === actualUrl && equals(parsedActualBody, parsedBody) && equals(options, actualOptions),
      message: () => `${actualUrl} with ${body} is${isNot ? ' not' : ''} correct`,
      actual: { url, options: { ...options, body: parsedBody } },
      expected: {
        url: actualUrl,
        options: { ...actualOptions, body: parsedActualBody },
      },
    }
  },
})
