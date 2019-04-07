import React from 'react'
import uuid4 from 'uuid4'

import '../styles/RedditLogin.css'

import config from '../config'

import redditIcon from '../images/redditIcon.png'

class RedditLogin extends React.Component {
    constructor() {
        super()
        this.state = {
            scopes: 'account identity flair modflair subscribe mysubreddits history save'
        }
        this.loginReddit = this.loginReddit.bind(this)
    }
    loginReddit() {
        const uuid = uuid4()
        if (this.props.accountType === 'old') {
            sessionStorage.setItem('RUT::OLD_USER_STATE', uuid)
        }
        else {
            sessionStorage.setItem('RUT::NEW_USER_STATE', uuid)
        }
        window.location.href = `https://www.reddit.com/api/v1/authorize?client_id=${config.clientId}&response_type=code&state=${uuid}&redirect_uri=${config.redirectURI}&duration=temporary&scope=${this.state.scopes}`
    }
    render() {
        return (
            <div className='redditLogin centered-vertical'>
                <div className='centered-vertical'>
                    <div>Log in to your *{this.props.accountType}* reddit account.</div>
                    {this.props.accountType === 'new' ? 
                        <div className='centered-vertical'>
                            <div>You may create an account using the link as well.</div>
                            <div>(Make sure you log out from the old account to get to the sign in/register page!)</div>
                        </div> : null
                    }
                </div>
                <button onClick={this.loginReddit}><img src={redditIcon} alt='redditIcon'/><div>SIGN IN</div></button>
            </div>
        )
    }
}

export default RedditLogin