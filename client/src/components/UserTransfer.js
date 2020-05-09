import React, { useState, useEffect } from "react";
import axios from "axios";
import qs from "qs";

import Loader from "./Loader";
import UsersFunctions from "./UsersFunctions";

import "../styles/UserTransfers.css";

import config from "../config";

const apiInterval = 100;

const UserTransfer = () => {
	const [oldUser, setOldUser] = useState({
		prefs: {
			ready: false,
			data: {},
			transferred: "",
			transferEnabled: true,
		},
		savedContent: {
			ready: false,
			data: [],
			removed: "",
			transferred: "",
			transferEnabled: true,
		},
		subscriptions: {
			ready: false,
			data: [],
			removed: "",
			transferred: "",
			transferEnabled: true,
		},
	});
	const [newUser, setNewUser] = useState({
		savedContent: {
			ready: false,
			data: [],
		},
		subscriptions: {
			ready: false,
			data: [],
		},
	});

	const [transferStarted, setTransferStarted] = useState(false);
	const [accountTypeToRemove, setaccountTypeToRemove] = useState("");

	useEffect(() => {
		getAccessToken("OLD", () => {
			getOldUserInfo();
		});
		getAccessToken("NEW", () => {
			getNewUserInfo();
		});
	}, []);

	const getAccessToken = async (accountType, callback) => {
		const accessToken = sessionStorage.getItem(
			`RUT::${accountType}_USER_ACCESS_TOKEN`
		);
		if (accessToken) {
			getUserInfo(accessToken, accountType, callback);
		} else {
			const authCode = sessionStorage.getItem(
				`RUT::${accountType}_USER_ACCESS_CODE`
			);
			const tokenResponse = await axios.post(
				"https://www.reddit.com/api/v1/access_token",
				qs.stringify({
					grant_type: "authorization_code",
					code: authCode,
					redirect_uri: config.redirectURI,
					// raw_json: 1,
					// api_type: 'json'
				}),
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						Authorization: `Basic ${btoa(
							`${config.clientId}:${config.clientSecret}`
						)}`,
					},
				}
			);
			const accessToken = tokenResponse.data.access_token;
			if (!accessToken) {
				window.location.href = "/";
			} else {
				getUserInfo(accessToken, accountType, callback);
			}
		}
	};
	const getUserInfo = async (accessToken, accountType, callback) => {
		sessionStorage.setItem(
			`RUT::${accountType}_USER_ACCESS_TOKEN`,
			accessToken
		);
		const userInfo = await redditOAuthTransmitter(
			"get",
			accountType,
			"/api/v1/me"
		).catch((err) => {
			console.log(err);
			console.log("Access Token timed out.");
			window.location.href = "/";
		});
		sessionStorage.setItem(`RUT::${accountType}_USER_NAME`, userInfo.name);
		callback();
	};
	const getOldUserInfo = () => {
		const accountType = "OLD";
		getPreferences();
		getUserTransferrableInfo(
			`/user/${sessionStorage.getItem("RUT::OLD_USER_NAME")}/saved`,
			accountType,
			oldUser.savedContent.data,
			(data) =>
				setOldUser({
					...oldUser,
					savedContent: {
						...oldUser.savedContent,
						data,
					},
				}),
			(ready) =>
				setOldUser({
					...oldUser,
					savedContent: {
						...oldUser.savedContent,
						ready,
					},
				})
		);
		getUserTransferrableInfo(
			"/subreddits/mine/subscriber",
			accountType,
			oldUser.subscriptions.data,
			(data) =>
				setOldUser({
					...oldUser,
					subscriptions: {
						...oldUser.subscriptions,
						data,
					},
				}),
			(ready) =>
				setOldUser({
					...oldUser,
					subscriptions: {
						...oldUser.subscriptions,
						ready,
					},
				})
		);
	};
	const getNewUserInfo = () => {
		const accountType = "NEW";
		getUserTransferrableInfo(
			`/user/${sessionStorage.getItem("RUT::NEW_USER_NAME")}/saved`,
			accountType,
			newUser.savedContent.data,
			(data) =>
				setNewUser({
					...newUser,
					savedContent: {
						...oldUser.savedContent,
						data,
					},
				}),
			(ready) =>
				setNewUser({
					...newUser,
					savedContent: {
						...newUser.savedContent,
						ready,
					},
				})
		);
		getUserTransferrableInfo(
			"/subreddits/mine/subscriber",
			accountType,
			newUser.subscriptions.data,
			(data) =>
				setNewUser({
					...newUser,
					subscriptions: {
						...newUser.subscriptions,
						data,
					},
				}),
			(ready) =>
				setNewUser({
					...newUser,
					subscriptions: {
						...newUser.subscriptions,
						ready,
					},
				})
		);
	};
	const getPreferences = async () => {
		const response = await redditOAuthTransmitter(
			"get",
			"OLD",
			`/api/v1/me/prefs`
		);
		setOldUser({
			...oldUser,
			prefs: {
				...oldUser.prefs,
				ready: true,
				data: response,
			},
		});
	};
	const getUserTransferrableInfo = async (
		uri,
		accountType,
		stateObject,
		setStateObject,
		setFlag,
		after = ""
	) => {
		const response = await redditOAuthTransmitter(
			"get",
			accountType,
			`${uri}?after=${after}`
		);
		const responseData = response.data;
		let redditItems = [];
		for (let item of responseData.children) {
			redditItems.push({
				name: item.data.name,
				title: item.data.title,
				permalink: `https://reddit.com${item.data.permalink}`,
				url: `https://reddit.com${item.data.url}`,
			});
		}
		setStateObject([...stateObject, ...redditItems]);
		const nextPage = responseData.after;
		if (nextPage) {
			getUserTransferrableInfo(
				uri,
				accountType,
				stateObject,
				setStateObject,
				setFlag,
				nextPage
			);
		} else {
			setStateObject(stateObject.reverse());
			setFlag(true);
			console.log(stateObject);
		}
	};

	const transferUserInfo = () => {
		setOldUser({
			...oldUser,
			prefs: {
				...oldUser.prefs,
				transferred: "Transferring preferences...",
			},
			savedContent: {
				...oldUser.savedContent,
				transferred: "Transferring saved content...",
			},
			subscriptions: {
				...oldUser.subscriptions,
				transferred: "Transferring subscriptions...",
			},
		});
		setTransferStarted(true);
		const accountType = "NEW";
		if (oldUser.prefs.transferEnabled) {
			patchUserPreferences(accountType);
		}
		if (oldUser.savedContent.transferEnabled) {
			saveOldSavedContent(accountType);
		}
		if (oldUser.subscriptions.transferEnabled) {
			subscribeOldSubreddits(accountType);
		}
	};
	const patchUserPreferences = async (accountType) => {
		await redditOAuthTransmitter(
			"patch",
			accountType,
			"/api/v1/me/prefs",
			oldUser.prefs.data
		);
		setOldUser({
			...oldUser,
			prefs: {
				...oldUser.prefs,
				transferred: "Transferring preferences complete!",
			},
		});
	};
	const saveOldSavedContent = async (accountType, index = 0) => {
		if (oldUser.savedContent.data.length <= index) {
			setOldUser({
				...oldUser,
				savedContent: {
					...oldUser.savedContent,
					transferred: "Transferring saved content complete!",
				},
			});
		} else {
			await redditOAuthTransmitter(
				"post",
				accountType,
				"/api/save",
				qs.stringify({
					id: oldUser.savedContent.data[index].name,
				})
			);
			setTimeout(() => {
				saveOldSavedContent(accountType, index + 1);
			}, apiInterval);
		}
	};
	const subscribeOldSubreddits = async (accountType) => {
		let subreddits = [];
		for (let subreddit of oldUser.subscriptions.data) {
			subreddits.push(subreddit.name);
		}
		const sr = subreddits.join(",");
		const body = {
			action: "sub",
			sr,
		};
		await redditOAuthTransmitter(
			"post",
			accountType,
			"/api/subscribe",
			qs.stringify(body)
		);
		setOldUser({
			...oldUser,
			subscriptions: {
				...oldUser.subscriptions,
				transferred: "Transferring subscriptions complete!",
			},
		});
	};

	const reallyRemoveAllSavedContent = async (accountType, index = 0) => {
		const savedContent =
			accountType === "OLD"
				? oldUser.savedContent.data
				: newUser.savedContent.data;
		if (savedContent.length <= index) {
			setOldUser({
				...oldUser,
				savedContent: {
					...oldUser.savedContent,
					removed: "Removing saved content complete!",
				},
			});
		} else {
			if (index === 0) {
				setaccountTypeToRemove(accountType);
				setOldUser({
					...oldUser,
					savedContent: {
						...oldUser.savedContent,
						removed: "Removing saved content...",
					},
				});
			}
			await redditOAuthTransmitter(
				"post",
				accountType,
				"/api/unsave",
				qs.stringify({
					id: savedContent[index].name,
				})
			);
			setTimeout(() => {
				reallyRemoveAllSavedContent(accountType, index + 1);
			}, apiInterval);
		}
	};
	const reallyUnsubscribeAll = async (accountType) => {
		setaccountTypeToRemove(accountType);
		setOldUser({
			...oldUser,
			subscriptions: {
				...oldUser.subscriptions,
				removed: "Unsubscribing from all subreddits...",
			},
		});
		const subscriptions =
			accountType === "OLD"
				? oldUser.subscriptions.data
				: newUser.subscriptions.data;
		let subreddits = [];
		for (let subreddit of subscriptions) {
			subreddits.push(subreddit.name);
		}
		if (subreddits.length === 0) {
			setOldUser({
				...oldUser,
				subscriptions: {
					...oldUser.subscriptions,
					removed: "Unsubscribing subreddits complete!",
				},
			});
		} else {
			await redditOAuthTransmitter(
				"post",
				accountType,
				"/api/subscribe",
				qs.stringify({
					action: "unsub",
					sr: subreddits.join(","),
				})
			);
			setOldUser({
				...oldUser,
				subscriptions: {
					...oldUser.subscriptions,
					removed: "Unsubscribing subreddits complete!",
				},
			});
		}
	};

	const redditOAuthTransmitter = async (
		method,
		accountType,
		endpoint,
		data = {}
	) => {
		const response = await axios({
			method,
			url: `https://oauth.reddit.com${endpoint}`,
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem(
					`RUT::${accountType}_USER_ACCESS_TOKEN`
				)}`,
			},
			data,
		});
		console.log(response.data);
		return response.data;
	};

	const toggleTransfer = (evt) => {
		const set = evt.target.setFunction;
		const currentState = evt.target.checked;
		set(!currentState);
	};

	return (
		<div className="userTransfer centered-vertical">
			{oldUser.savedContent.ready &&
			oldUser.subscriptions.ready &&
			oldUser.prefs.ready ? (
				<div>
					{newUser.savedContent.ready &&
					newUser.subscriptions.ready ? (
						<div>
							<UsersFunctions
								reallyRemoveAllSavedContent={
									reallyRemoveAllSavedContent
								}
								reallyUnsubscribeAll={reallyUnsubscribeAll}
								accountTypeToRemove={accountTypeToRemove}
								savedContentRemoved={
									oldUser.savedContent.removed
								}
								unsubscribed={oldUser.subscriptions.removed}
							/>
						</div>
					) : null}
					<div className="centered-vertical">
						{oldUser.savedContent.data.length > 0 ? (
							<div className="centered-vertical">
								<h3>
									You have {oldUser.savedContent.data.length}{" "}
									saved content.
								</h3>
								{oldUser.savedContent.data.length === 1000 ? (
									<h4>
										Wondering why you have exactly 1000
										saved content? It's Reddit's fault.
										Reddit will only store 1000 saves.
									</h4>
								) : null}
								<div className="centered-vertical">
									<h4>First Saved Content</h4>
									<a
										href={
											oldUser.savedContent.data[0]
												.permalink
										}
									>
										{oldUser.savedContent.data[0].title}
									</a>
									<h4>Most Recently Saved Content</h4>
									<a
										href={
											oldUser.savedContent.data[0]
												.permalink
										}
									>
										{
											oldUser.savedContent.data[
												oldUser.savedContent.data
													.length - 1
											].title
										}
									</a>
								</div>
							</div>
						) : (
							<h3>You have no saved content.</h3>
						)}
						{oldUser.subscriptions.data.length > 0 ? (
							<div className="centered-vertical">
								<h3>
									You are subscribed to{" "}
									{oldUser.subscriptions.data.length}{" "}
									subreddits, such as...
								</h3>
								<div className="centered-vertical">
									<a href={oldUser.subscriptions.data[0].url}>
										{oldUser.subscriptions.data[0].title}
									</a>
									<a href={oldUser.subscriptions.data[1].url}>
										{oldUser.subscriptions.data[1].title}
									</a>
								</div>
							</div>
						) : (
							<h3>You are not subscribed to any subreddits.</h3>
						)}
						{transferStarted ||
						(oldUser.savedContent.data.length === 0 &&
							oldUser.subscriptions.data.length === 0) ? null : (
							<div className="transfers centered-vertical">
								<label>
									<input
										type="checkbox"
										setFunction={(transferEnabled) =>
											setOldUser({
												...oldUser,
												prefs: {
													...oldUser.prefs,
													transferEnabled,
												},
											})
										}
										onChange={toggleTransfer}
										checked={oldUser.prefs.transferEnabled}
									/>
									Transfer Preferences
								</label>
								<label>
									<input
										type="checkbox"
										setFunction={(transferEnabled) =>
											setOldUser({
												...oldUser,
												savedContent: {
													...oldUser.savedContent,
													transferEnabled,
												},
											})
										}
										onChange={toggleTransfer}
										checked={
											oldUser.savedContent.transferEnabled
										}
									/>
									Transfer Saved Content
								</label>
								<label>
									<input
										type="checkbox"
										setFunction={(transferEnabled) =>
											setOldUser({
												...oldUser,
												subscriptions: {
													...oldUser.subscriptions,
													transferEnabled,
												},
											})
										}
										onChange={toggleTransfer}
										checked={
											oldUser.subscriptions
												.transferEnabled
										}
									/>
									Transfer Subscribed Subreddits
								</label>
								<button onClick={transferUserInfo}>
									Transfer!
								</button>
							</div>
						)}
						{oldUser.prefs.transferEnabled ? (
							<h4>{oldUser.prefs.transferred}</h4>
						) : null}
						{oldUser.savedContent.transferEnabled ? (
							<h4>{oldUser.savedContent.transferred}</h4>
						) : null}
						{oldUser.subscriptions.transferEnabled ? (
							<h4>{oldUser.subscriptions.transferred}</h4>
						) : null}
					</div>
				</div>
			) : (
				<Loader
					oldUser={sessionStorage.getItem("RUT::OLD_USER_NAME")}
				/>
			)}
		</div>
	);
};

export default UserTransfer;
