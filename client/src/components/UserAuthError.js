import React from "react";

const UserAuthError = () => {
	const uri = window.location.href;
	const errorMsg = new URL(uri).searchParams.get("error");
	if (errorMsg === "access_denied") {
		return (
			<div>
				You have denied the authentication. Refresh and try again.
			</div>
		);
	} else {
		return (
			<div>
				There was an error with the authentication uri created by the
				creator. Please contact anandrew1995@gmail.com and include this
				uri: {uri}
			</div>
		);
	}
};

export default UserAuthError;
