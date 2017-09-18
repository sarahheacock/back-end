import React from 'react';
import PropTypes from 'prop-types';

import PersonalInfo from '../reservation/PersonalInfo';


class Bill extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
  }

  componentDidMount(){
    if(this.props.user.billing.charAt(0) === "/"){
      this.props.updateState({
        dataObj: this.props.user.billing,
        title: "Update Billing"
      })
    }
  }

  render(){
    return(
      <div className="content">
        <PersonalInfo
          category="billing"
          user={this.props.user}
          updateState={this.props.updateState}
        />
      </div>
    );
  }
}

export default Bill;
