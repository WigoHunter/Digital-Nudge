const initialState = {
  open: false,
  text: ""
};

function modal(state = initialState, action) {
  const { data, type } = action;

  switch (type) {
    case "OPEN_MODAL":
      return {
        ...state,
        open: true,
        text: data.text || ""
      };

    case "CLOSE_MODAL":
      return {
        ...initialState
      };

    default:
      return {
        ...state
      };
  }
}

export default modal;
