import React from "react";

import "../styles/Header.css";

import Logo from "../images/favicon.png";

const Header = () => {
	const signOut = () => {
		window.location.href = "/";
	};
	return (
		<div className="header">
			<img src={Logo} />
			<div>Reddit User Transfer</div>
			{window.location.href.endsWith("/") ? null : (
				<button onClick={signOut}>Sign out all users</button>
			)}
		</div>
	);
};

export default Header;
