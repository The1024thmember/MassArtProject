export function ExampleReducer(state = { inital: true }, action: any) {
  switch (action.type) {
    case 'API_FETCH_RESULT':
      console.log('action:', action);
      if (action.payload.collection === 'example') {
        const { result, id } = action.payload;
        console.log('state:', { ...state, [id]: { result } });
        // here we need to decide how to merge the state results,
        // we can merge it based on userId and document (draw object)
        // ResourceState -> userId -> draw object Id
        // we need to make sure the endpoint also reflects the structure
        return { ...state, [id]: { result } };
      }
      return state;
    case 'API_PUSH_SUCCESS':
      console.log('action:', action);
      if (action.payload.collection === 'example') {
        const { result, id } = action.payload;
        console.log('state:', { ...state, [id]: { result } });
        // here we need to decide how to merge the state results,
        // we can merge it based on userId and document (draw object)
        // ResourceState -> userId -> draw object Id
        // we need to make sure the endpoint also reflects the structure
        return { ...state, [id]: { result } };
      }
      return state;
    case 'API_UPDATE_SUCCESS':
      console.log('action:', action);
      if (action.payload.collection === 'example') {
        const { result, id } = action.payload;

        console.log('state:', { ...state, [id]: { result } });
        // here we need to decide how to merge the state results,
        // we can merge it based on userId and document (draw object)
        // ResourceState -> userId -> draw object Id
        // we need to make sure the endpoint also reflects the structure
        return { ...state, [id]: { result } };
      }
      return state;
    case 'API_DELETE_SUCCESS':
      console.log('action:', action);
      if (action.payload.collection === 'example') {
        const { result, id } = action.payload;

        console.log('state:', { ...state, [id]: result });
        // here we need to decide how to merge the state results,
        // we can merge it based on userId and document (draw object)
        // ResourceState -> userId -> draw object Id
        // we need to make sure the endpoint also reflects the structure
        return { ...state, [id]: result };
      }
      return state;
    case 'WS_MESSAGE': {
      if (action.payload.collection === 'example') {
        console.warn('processing ws event');
        const { result, id } = action.payload;

        console.log('state:', { ...state, [id]: result });
        // here we need to decide how to merge the state results,
        // we can merge it based on userId and document (draw object)
        // ResourceState -> userId -> draw object Id
        // we need to make sure the endpoint also reflects the structure
        return { ...state, [id]: result };
      }
      return;
    }
    default:
      return state;
  }
}
