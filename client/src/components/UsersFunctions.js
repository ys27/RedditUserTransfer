import React, { useState } from "react";
// import Modal from 'react-modal'
import { Modal, Button } from "react-bootstrap";

import "../styles/UsersFunctions.css";

import transferArrow from "../images/transferArrow.png";

const UsersFunctions = ({
	reallyRemoveAllSavedContent,
	reallyUnsubscribeAll,
	unsaved,
	unsubscribed,
	accountTypeToRemove,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [accountType, setAccountType] = useState("");
	const [actionMessage, setActionMessage] = useState("");
	const [currentFunction, setCurrentFunction] = useState(null);

	const removeAllSavedContent = (accountType) => {
		setIsOpen(true);
		setAccountType(accountType);
		setActionMessage(
			`remove all saved content for /u/${sessionStorage.getItem(
				`RUT::${accountType}_USER_NAME`
			)}`
		);
		setCurrentFunction("removeAllSavedContent");
	};
	const unsubscribeAll = (accountType) => {
		setIsOpen(true);
		setAccountType(accountType);
		setActionMessage(
			`unsubscribe from all subreddits for /u/${sessionStorage.getItem(
				`RUT::${accountType}_USER_NAME`
			)}`
		);
		setCurrentFunction("unsubscribeAll");
	};
	const reallyDoIt = () => {
		closeModal();
		currentFunction === "removeAllSavedContent"
			? reallyRemoveAllSavedContent(accountType)
			: reallyUnsubscribeAll(accountType);
	};
	const closeModal = () => {
		setIsOpen(false);
	};

	return (
		<div className="usersFunctions">
			<Modal show={isOpen} onHide={closeModal} animation={false}>
				<Modal.Header>
					<Modal.Title>
						Are you sure you would like to {actionMessage}?
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="centered-vertical">
					<div>This is an irreversible action.</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={closeModal}>
						No, let me out!
					</Button>
					<Button variant="primary" onClick={reallyDoIt}>
						Yes, I am!
					</Button>
				</Modal.Footer>
			</Modal>
			<User
				accountType="OLD"
				removeAllSavedContent={removeAllSavedContent}
				unsubscribeAll={unsubscribeAll}
				unsaved={unsaved}
				unsubscribed={unsubscribed}
				accountTypeToRemove={accountTypeToRemove}
			/>
			<img src={transferArrow} alt="transferArrow" />
			<User
				accountType="NEW"
				removeAllSavedContent={removeAllSavedContent}
				unsubscribeAll={unsubscribeAll}
				unsaved={unsaved}
				unsubscribed={unsubscribed}
				accountTypeToRemove={accountTypeToRemove}
			/>
		</div>
	);
};

const User = ({
	accountType,
	unsaved,
	unsubscribed,
	accountTypeToRemove,
	...props
}) => {
	const [
		saveContentRemovalInProgress,
		SetSaveContentRemovalInProgress,
	] = useState(false);
	const [unsubscribeInProgress, setUnsubscribeInProgress] = useState(false);

	const removeAllSavedContent = () => {
		if (!saveContentRemovalInProgress) {
			SetSaveContentRemovalInProgress(true);
			props.removeAllSavedContent(accountType);
		}
	};
	const unsubscribeAll = () => {
		if (!unsubscribeInProgress) {
			setUnsubscribeInProgress(true);
			props.unsubscribeAll(accountType);
		}
	};

	return (
		<div>
			<h3>
				/u/
				{sessionStorage.getItem(`RUT::${accountType}_USER_NAME`)}
			</h3>
			<button onClick={removeAllSavedContent}>
				{accountType === accountTypeToRemove && unsaved
					? unsaved
					: `Remove all saved content`}
			</button>
			<button onClick={unsubscribeAll}>
				{accountType === accountTypeToRemove && unsubscribed
					? unsubscribed
					: `Unsubscribe all subreddits`}
			</button>
		</div>
	);
};

export default UsersFunctions;
