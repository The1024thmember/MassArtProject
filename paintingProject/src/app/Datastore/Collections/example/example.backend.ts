export function exampleBackend() {
  return {
    fetch: (authUid, id, query) => {
      return {
        endpoint: 'example/',
        method: 'GET',
        params: {},
      };
    },
    push: (authUid) => {
      return {
        endpoint: 'example/',
        method: 'POST',
        payload: {},
      };
    },
    set: (authUid) => {
      return {
        endpoint: 'example/',
        method: 'POST',
        payload: {},
      };
    },
    update: (authUid, delta) => {
      return {
        endpoint: 'example/',
        method: 'PUT', // or POST
        payload: {},
      };
    },
    remove: (authUid, id) => {
      return {
        endpoint: 'example/',
        method: 'DELETE',
        payload: {},
      };
    },
  };
}
