export function ExampleBackend() {
  return {
    fetch: (authUid: number, ids: number | string, query: any) => ({
      endpoint: 'entries',
      params: {
        id: ids,
        // other params are passed in here
      },
    }),

    update: (authUid: number, delta: any, original: any) => ({
      endpoint: 'entries',
      payload: {},
    }),

    delete: undefined,

    push: undefined,
  };
}
