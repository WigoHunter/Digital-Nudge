const initialState = {
	user: {}
};

function auth(state = initialState, action) {
	const { data, type } = action;

	switch(type) {

	case "USER_LOGIN":
		return {
			...state,
			user: data.user || {},
		};

	default:
		return {
			...state
		};
	
	}
}

export default auth;