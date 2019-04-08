import React from 'react'
// import Modal from 'react-modal'
import { Modal, Button } from 'react-bootstrap';

import '../styles/UsersFunctions.css'

import transferArrow from '../images/transferArrow.png'

class UsersFunctions extends React.Component {
    constructor() {
        super()
        this.state = {
            isOpen: false,
            accountType: '',
            actionMessage: '',
            currentFunction: null
        }
        this.removeAllSavedContent = this.removeAllSavedContent.bind(this)
        this.unsubscribeAll = this.unsubscribeAll.bind(this)
        this.reallyDoIt = this.reallyDoIt.bind(this)
        this.closeModal = this.closeModal.bind(this)
    }
    removeAllSavedContent(accountType) {
        this.setState({
            isOpen: true,
            actionMessage: `remove all saved content for /u/${sessionStorage.getItem(`RUT::${accountType}_USER_NAME`)}`,
            currentFunction: 'removeAllSavedContent',
            accountType
        })
    }
    unsubscribeAll(accountType) {
        this.setState({
            isOpen: true,
            actionMessage: `unsubscribe from all subreddits for /u/${sessionStorage.getItem(`RUT::${accountType}_USER_NAME`)}`,
            currentFunction: 'unsubscribeAll',
            accountType
        })
    }
    reallyDoIt() {
        this.closeModal()
        this.state.currentFunction === 'removeAllSavedContent' ? 
            this.props.reallyRemoveAllSavedContent(this.state.accountType) : 
            this.props.reallyUnsubscribeAll(this.state.accountType)
    }
    closeModal() {
        this.setState({
            isOpen: false
        })
    }
    render() {
        return (
            <div className='usersFunctions'>
                <Modal show={this.state.isOpen} onHide={this.closeModal} animation={false}>
                    <Modal.Header>
                        <Modal.Title>Are you sure you would like to {this.state.actionMessage}?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='centered-vertical'>
                        <div>This is an irreversible action.</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.closeModal}>No, let me out!</Button>
                        <Button variant="primary" onClick={this.reallyDoIt}>Yes, I am!</Button>
                    </Modal.Footer>
                </Modal>
                <User accountType='OLD' 
                    removeAllSavedContent={this.removeAllSavedContent} unsubscribeAll={this.unsubscribeAll}
                    savedContentRemoved={this.props.savedContentRemoved} unsubscribed={this.props.unsubscribed}
                    removingAccountType={this.props.removingAccountType}/>
                <img src={transferArrow} alt='transferArrow'/>
                <User accountType='NEW' 
                    removeAllSavedContent={this.removeAllSavedContent} unsubscribeAll={this.unsubscribeAll}
                    savedContentRemoved={this.props.savedContentRemoved} unsubscribed={this.props.unsubscribed}
                    removingAccountType={this.props.removingAccountType}/>
            </div>
        )
    }
}

class User extends React.Component {
    constructor() {
        super()
        this.state = {
            saveContentRemovalInProgress: false,
            unsubscribeInProgress: false,

        }
        this.removeAllSavedContent = this.removeAllSavedContent.bind(this)
        this.unsubscribeAll = this.unsubscribeAll.bind(this)
    }
    removeAllSavedContent() {
        if (!this.state.saveContentRemovalInProgress) {
            this.setState({
                saveContentRemovalInProgress: true
            })
            this.props.removeAllSavedContent(this.props.accountType)
        }
    }
    unsubscribeAll() {
        if (!this.state.unsubscribeInProgress) {
            this.setState({
                unsubscribeInProgress: true
            })
            this.props.unsubscribeAll(this.props.accountType)
        }
    }
    render() {
        return (
            <div>
                <h3>/u/{sessionStorage.getItem(`RUT::${this.props.accountType}_USER_NAME`)}</h3>
                <button onClick={this.removeAllSavedContent}>
                    {this.props.accountType === this.props.removingAccountType 
                        && this.props.savedContentRemoved ? 
                        this.props.savedContentRemoved : `Remove all saved content`
                    }
                </button>
                <button onClick={this.unsubscribeAll}>
                    {this.props.accountType === this.props.removingAccountType 
                        && this.props.unsubscribed ? 
                        this.props.unsubscribed : `Unsubscribe all subreddits`
                    }
                </button>
            </div>
        )
    }
}

export default UsersFunctions