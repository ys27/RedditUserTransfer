import React from "react";

import "../styles/Description.css";

const Description = () => (
	<div className="description centered-vertical">
		<div>
			Reddit User Transfer allows you to transfer your reddit account
			information to another account.
		</div>
		<div>
			Everything is done within your browser, and no information is sent
			to the server.
		</div>
		<div>
			Due to the rate limit set by the Reddit API, it may take a while to
			transfer the content (60 requests/min).
		</div>
	</div>
);

export default Description;
