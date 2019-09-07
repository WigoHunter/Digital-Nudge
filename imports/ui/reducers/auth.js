const initialState = {
  user: {},
  loading: false
};

function auth(state = initialState, action) {
  const { data, type } = action;

  switch (type) {
    case "USER_LOGIN":
      return {
        ...state,
        user: data.user || {},
        userLoaded: data.subscription.ready()
      };

    case "LOADING_DATA":
      return {
        ...state,
        loading: true
      };

    case "DONE_LOADING_DATA":
      return {
        ...state,
        loading: false
      };

    default:
      return {
        ...state
      };
  }
}

export default auth;
