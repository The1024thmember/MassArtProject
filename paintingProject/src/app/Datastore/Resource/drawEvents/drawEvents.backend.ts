export function DrawEventsBackend() {
  return {
    fetch: (authUid: number, ids: number | string, query: any) => ({
      endpoint: '/d/drawEvent',
      params: {
        id: ids,
        // other params are passed in here
      },
    }),
  };
}
