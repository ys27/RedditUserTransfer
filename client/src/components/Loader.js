import React from 'react'

class Loader extends React.Component {
    render() {
        return (
            <div>
                Loading {this.props.oldUser}'s content...
            </div>
        )
    }
}

export default Loader