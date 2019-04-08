import React from 'react'

import '../styles/UsersFunctions.css'

import transferArrow from '../images/transferArrow.png'

class UsersFunctions extends React.Component {
    render() {
        return (
            <div className='usersFunctions'>
                <User accountType='OLD'/>
                <img src={transferArrow} alt='transferArrow'/>
                <User accountType='NEW'/>
            </div>
        )
    }
}

class User extends React.Component {
    constructor() {
        super()
        this.state = {
            unsubscribeText: 'Unsubscribe all subreddits',
            removeSavedText: 'Remove all saved content'
        }
    }
    render() {
        return (
            <div>
                <h3>/u/{sessionStorage.getItem(`RUT::${this.props.accountType}_USER_NAME`)}</h3>
                <button>{this.state.unsubscribeText}</button>
                <button>{this.state.removeSavedText}</button>
            </div>
        )
    }
}

export default UsersFunctions