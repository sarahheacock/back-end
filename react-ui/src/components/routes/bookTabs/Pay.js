import React from 'react';
import PropTypes from 'prop-types';

import PersonalInfo from '../reservation/PersonalInfo';


class Pay extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
  }

  componentDidMount(){
    if(this.props.user.credit.charAt(0) === "/"){
      this.props.updateState({
        dataObj: this.props.user.credit,
        title: "Update Credit"
      })
    }
  }

  render(){
    return(
      <div className="content">
        <PersonalInfo
          category="credit"
          user={this.props.user}
          updateState={this.props.updateState}
        />
      </div>
    );
  }
}

export default Pay;
