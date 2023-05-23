export function ExampleReducer(state = {}, action) {
  switch (action.type) {
    case 'API_FETCH_SUCCESS':
      if (action.payload.type === 'example') {
        const { result, ref, order } = action.payload;
        return { ...state, result };
      }
    default:
      return state;
  }
}
