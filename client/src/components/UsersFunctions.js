import React from 'react'

import '../styles/UsersFunctions.css'

import transferArrow from '../images/transferArrow.png'

class UsersFunctions extends React.Component {
    render() {
        return (
            <div className='usersFunctions'>
                <div>
                    <h3>u/{sessionStorage.getItem('RUT::OLD_USER_NAME')}</h3>
                </div>
                <img src={transferArrow} alt='transferArrow'/>
                <div>
                    <h3>u/{sessionStorage.getItem('RUT::NEW_USER_NAME')}</h3>
                </div>
            </div>
        )
    }
}

export default UsersFunctions