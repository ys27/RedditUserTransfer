import React from 'react'

import '../styles/Header.css'

import Logo from '../images/favicon.png'

class Header extends React.Component {
    constructor() {
        super()
        this.signOut = this.signOut.bind(this)
    }
    signOut() {
        window.location.href = '/'
    }
    render() {
        return (
            <div className='header'>
                <img src={Logo}/>
                <div>Reddit User Transfer</div>
                {window.location.href.endsWith('/') ? null : <button onClick={this.signOut}>Sign out all users</button>}
            </div>
        )
    }
}

export default Header
