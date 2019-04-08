import React from 'react'
import axios from 'axios'
import qs from 'qs'

import Loader from './Loader'
import UsersFunctions from './UsersFunctions'

import '../styles/UserTransfers.css'

import config from '../config'

class UserTransfer extends React.Component {
    constructor() {
        super()
        this.state = {
            oldUserPrefsReady: false,
            oldUserSavedContentReady: false,
            oldUserSubscriptionsReady: false,
            newUserSavedContentReady: false,
            newUserSubscriptionsReady: false,
            oldUserPreferences: {},
            oldUserSavedContent: [],
            oldUserSubscriptions: [],
            newUserSavedContent: [],
            newUserSubscriptions: [],
            preferencesTransferred: '',
            savedContentTransferred: '',
            subscriptionsTransferred: '',
            transferStarted: false,
            transferPrefs: true,
            transferSaved: true,
            transferSubs: true
        }
        this.getAccessToken = this.getAccessToken.bind(this)
        this.getUserInfo = this.getUserInfo.bind(this)
        this.getOldUserInfo = this.getOldUserInfo.bind(this)
        this.getNewUserInfo = this.getNewUserInfo.bind(this)
        this.getSavedContent = this.getSavedContent.bind(this)
        this.getSubscribedSubreddits = this.getSubscribedSubreddits.bind(this)
        this.getUserTransferrableInfo = this.getUserTransferrableInfo.bind(this)
        this.transferUserInfo = this.transferUserInfo.bind(this)
        this.patchUserPreferences = this.patchUserPreferences.bind(this)
        this.saveOldSavedContent = this.saveOldSavedContent.bind(this)
        this.subscribeOldSubreddits = this.subscribeOldSubreddits.bind(this)
        this.redditOAuthTransmitter = this.redditOAuthTransmitter.bind(this)
        this.toggleTransfer = this.toggleTransfer.bind(this)
    }
    getAccessToken(accountType, callback) {
        const accessToken = sessionStorage.getItem(`RUT::${accountType}_USER_ACCESS_TOKEN`)
        if (accessToken) {
            this.getUserInfo(accessToken, accountType, callback)
        }
        else {
            const authCode = sessionStorage.getItem(`RUT::${accountType}_USER_ACCESS_CODE`)
            const body = {
                grant_type: 'authorization_code',
                code: authCode,
                redirect_uri: config.redirectURI,
                // raw_json: 1,
                // api_type: 'json'
            }
            const headers = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`
                }
            }
            axios.post('https://www.reddit.com/api/v1/access_token', qs.stringify(body), headers)
            .then((tokenResponse) => {
                const accessToken = tokenResponse.data.access_token
                if (!accessToken) {
                    window.location.href = '/'
                }
                else {
                    this.getUserInfo(accessToken, accountType, callback)
                }
            })
        }
    }
    getUserInfo(accessToken, accountType, callback) {
        sessionStorage.setItem(`RUT::${accountType}_USER_ACCESS_TOKEN`, accessToken)
        this.redditOAuthTransmitter('get', accountType, '/api/v1/me')
        .then((userInfo) => {
            sessionStorage.setItem(`RUT::${accountType}_USER_NAME`, userInfo.name)
            callback()
        })
        .catch((err) => {
            console.log(err)
            console.log('Access Token timed out.')
            window.location.href = '/'
        })
    }
    getOldUserInfo() {
        const accountType = 'OLD'
        this.getPreferences()
        this.getSavedContent(sessionStorage.getItem('RUT::OLD_USER_NAME'), accountType, 'oldUserSavedContent', 'oldUserSavedContentReady')
        this.getSubscribedSubreddits(accountType, 'oldUserSubscriptions', 'oldUserSubscriptionsReady')
    }
    getNewUserInfo() {
        const accountType = 'NEW'
        this.getSavedContent(sessionStorage.getItem('RUT::NEW_USER_NAME'), accountType, 'newUserSavedContent', 'newUserSavedContentReady')
        this.getSubscribedSubreddits(accountType, 'newUserSubscriptions', 'newUserSubscriptionsReady')
    }
    getPreferences() {
        this.redditOAuthTransmitter('get', 'OLD', `/api/v1/me/prefs`)
        .then((response) => {
            this.setState({
                oldUserPreferences: response,
                oldUserPrefsReady: true
            })
        })
    }
    getSavedContent(name, accountType, stateObject, flag, after='') {
        this.getUserTransferrableInfo(`/user/${name}/saved`, accountType, stateObject, flag, after)
    }
    getSubscribedSubreddits(accountType, stateObject, flag, after='') {
        this.getUserTransferrableInfo('/subreddits/mine/subscriber', accountType, stateObject, flag, after)
    }
    getUserTransferrableInfo(uri, accountType, stateObject, flag, after='') {
        this.redditOAuthTransmitter('get', accountType, `${uri}?after=${after}`)
        .then((response) => {
            const responseData = response.data
            let redditItems = []
            for (let item of responseData.children) {
                redditItems.push({
                    name: item.data.name,
                    title: item.data.title,
                    permalink: `https://reddit.com${item.data.permalink}`,
                    url: `https://reddit.com${item.data.url}`
                })
            }
            this.setState({
                [stateObject]: [...this.state[stateObject], ...redditItems]
            })
            const nextPage = responseData.after
            if (nextPage) {
                this.getUserTransferrableInfo(uri, accountType, stateObject, flag, nextPage)
            }
            else {
                this.setState({
                    [stateObject]: this.state[stateObject].reverse(),
                    [flag]: true
                })
                console.log(this.state[stateObject])
            }
        })
    }

    transferUserInfo() {
        this.setState({
            preferencesTransferred: 'Transferring preferences...',
            savedContentTransferred: 'Transferring saved content...',
            subscriptionsTransferred: 'Transferring subscriptions...',
            transferStarted: true
        })
        const accountType = 'NEW'
        if (this.state.transferPrefs) {
            this.patchUserPreferences(accountType)
        }
        if (this.state.transferSaved) {
            this.saveOldSavedContent(accountType)
        }
        if (this.state.transferSubs) {
            this.subscribeOldSubreddits(accountType)
        }
    }
    patchUserPreferences(accountType) {
        const body = this.state.oldUserPreferences
        this.redditOAuthTransmitter('patch', accountType, '/api/v1/me/prefs', body)
        .then(() => {
            this.setState({
                preferencesTransferred: 'Transferring preferences complete!'
            })
        })
    }
    saveOldSavedContent(accountType, index=0) {
        if (this.state.oldUserSavedContent.length <= index) {
            this.setState({
                savedContentTransferred: 'Transferring saved content complete!'
            })
        }
        else {
            const body = {
                id: this.state.oldUserSavedContent[index].name
            }
            this.redditOAuthTransmitter('post', accountType, '/api/save', qs.stringify(body))
            .then(() => {
                setTimeout(() => {
                    this.saveOldSavedContent(accountType, index+1)
                }, 1200)
            })
        }
    }
    subscribeOldSubreddits(accountType) {
        let subreddits = []
        for (let subreddit of this.state.oldUserSubscriptions) {
            subreddits.push(subreddit.name)
        }
        const sr = subreddits.join(',')
        const body = {
            action: 'sub',
            sr
        }
        this.redditOAuthTransmitter('post', accountType, '/api/subscribe', qs.stringify(body))
        .then(() => {
            this.setState({
                subscriptionsTransferred: 'Transferring subscriptions complete!'
            })
        })
    }

    redditOAuthTransmitter(method, accountType, endpoint, data={}) {
        const headers = {
            'Authorization': `Bearer ${sessionStorage.getItem(`RUT::${accountType}_USER_ACCESS_TOKEN`)}`
        }
        return axios({
            method,
            url: `https://oauth.reddit.com${endpoint}`,
            headers,
            data
        })
        .then((response) => {
            console.log(response.data)
            return response.data
        })
    }

    toggleTransfer(evt) {
        const state = evt.target.name
        this.setState({
            [state]: !this.state[state]
        })
    }
    render() {
        return (
            <div className='userTransfer centered-vertical'>
                {this.state.oldUserSavedContentReady 
                    && this.state.oldUserSubscriptionsReady 
                        && this.state.oldUserPrefsReady ? 
                    <div>
                        {this.state.newUserSavedContentReady
                            && this.state.newUserSubscriptionsReady ?
                                <UsersFunctions/> : null
                        }
                        <div className='centered-vertical'>
                            <h3>You have {this.state.oldUserSavedContent.length} saved content.</h3>
                            {this.state.oldUserSavedContent.length === 1000 ? 
                                <h4>Wondering why you have exactly 1000 saved content? It's Reddit's fault. Reddit will only store 1000 saves.</h4> : null
                            }
                            <div className='centered-vertical'>
                                <h4>First Saved Content</h4>
                                <a href={this.state.oldUserSavedContent[0].permalink}>{this.state.oldUserSavedContent[0].title}</a>
                                <h4>Most Recently Saved Content</h4>
                                <a href={this.state.oldUserSavedContent[0].permalink}>{this.state.oldUserSavedContent[this.state.oldUserSavedContent.length-1].title}</a>
                            </div>
                            <h3>You are subscribed to {this.state.oldUserSubscriptions.length} subreddits, such as...</h3>
                            <div className='centered-vertical'>
                                <a href={this.state.oldUserSubscriptions[0].url}>{this.state.oldUserSubscriptions[0].title}</a>
                                <a href={this.state.oldUserSubscriptions[1].url}>{this.state.oldUserSubscriptions[1].title}</a>
                            </div>
                            {this.state.transferStarted ? null : 
                                <div className='transfers centered-vertical'>
                                    <label><input type='checkbox' name='transferPrefs' onChange={this.toggleTransfer} checked={this.state.transferPrefs}/>Transfer Preferences</label>
                                    <label><input type='checkbox' name='transferSaved' onChange={this.toggleTransfer} checked={this.state.transferSaved}/>Transfer Saved Content</label>
                                    <label><input type='checkbox' name='transferSubs' onChange={this.toggleTransfer} checked={this.state.transferSubs}/>Transfer Subscribed Subreddits</label>
                                    <button onClick={this.transferUserInfo}>Transfer!</button>
                                </div>
                            }
                            {this.state.transferPrefs ? <h4>{this.state.preferencesTransferred}</h4> : null}
                            {this.state.transferSaved ? <h4>{this.state.savedContentTransferred}</h4> : null}
                            {this.state.transferSubs ? <h4>{this.state.subscriptionsTransferred}</h4> : null}
                        </div>
                    </div> : <Loader oldUser={sessionStorage.getItem('RUT::OLD_USER_NAME')}/>
                }
            </div>
        )
    }
    componentDidMount() {
        this.getAccessToken('OLD', () => {this.getOldUserInfo()})
        this.getAccessToken('NEW', () => {this.getNewUserInfo()})
    }
}

export default UserTransfer