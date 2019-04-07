import React from 'react'

import '../styles/App.css'

import Header from './Header'
import Description from './Description'
import UserAuthError from './UserAuthError'
import UserTransfer from './UserTransfer'
import RedditLogin from './RedditLogin'

class App extends React.Component {
    render() {
        return (
            <div className='app centered-vertical'>
                <Header/>
                <Description/>
                <div className='content'>
                    <Content/>
                </div>
            </div>
        )
    }
}

function Content() {
    const uri = window.location.href
    if (uri.indexOf('error') > 0) {
        return <UserAuthError/>
    }
    else if (uri.indexOf('code') > 0) {
        const searchParams = new URL(uri).searchParams
        if (searchParams.get('state') === sessionStorage.getItem('RUT::OLD_USER_STATE')) {
            sessionStorage.setItem('RUT::OLD_USER_ACCESS_CODE', searchParams.get('code'))
            return <RedditLogin accountType='new'/>
        }
        if (searchParams.get('state') === sessionStorage.getItem('RUT::NEW_USER_STATE')) {
            sessionStorage.setItem('RUT::NEW_USER_ACCESS_CODE', searchParams.get('code'))
            return <UserTransfer/>
        }
    }
    else {
        sessionStorage.removeItem('RUT::OLD_USER_STATE')
        sessionStorage.removeItem('RUT::OLD_USER_ACCESS_CODE')
        sessionStorage.removeItem('RUT::OLD_USER_ACCESS_TOKEN')
        sessionStorage.removeItem('RUT::OLD_USER_NAME')
        sessionStorage.removeItem('RUT::OLD_USER_SAVED_CONTENT')
        sessionStorage.removeItem('RUT::OLD_USER_SUBSCRIPTIONS')
        sessionStorage.removeItem('RUT::NEW_USER_STATE')
        sessionStorage.removeItem('RUT::NEW_USER_ACCESS_CODE')
        sessionStorage.removeItem('RUT::NEW_USER_ACCESS_TOKEN')
        sessionStorage.removeItem('RUT::NEW_USER_NAME')
        return <RedditLogin accountType='old'/>
    }
}

export default App
