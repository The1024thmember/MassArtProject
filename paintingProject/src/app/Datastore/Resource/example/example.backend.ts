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

    delete: (authUid: number, id: number | string, originalDocument: any) => ({
      endpoint: 'entries',
      method: 'DELETE',
      isGaf: true,
      payload: { id },
    }),

    push: (authUid: number, document: any, extra: any) => ({
      endpoint: 'entries',
      payload: {},
    }),
  };
}
