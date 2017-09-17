import React from 'react';
import PropTypes from 'prop-types';

import { PageHeader } from 'react-bootstrap';

import Cart from './reservation/Cart';
import { blogID, initial } from '../../../../data/data';


class Welcome extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    getData: PropTypes.func.isRequired,
    updateState: PropTypes.func.isRequired,
  }

  constructor(props){
    super(props);
  }

  componentDidMount(){
    const url = `/res/user/${this.props.user._id}?token=${this.props.user.token}`;
    console.log(url);
    this.props.getData(url);
  }

  logout = (e) => {
    this.props.getData('/auth/logout');
  }

  render(){

    return(
      <div className="main-content">
        <PageHeader><span className="header-text">{`Welcome, ${this.props.user.name || this.props.user.email.slice(0, this.props.user.email.indexOf('@'))}!`}</span></PageHeader>
        <Cart
          updateState={this.props.updateState}
          user={this.props.user}
        />
        <div className="text-center">
          <button className="button blueButton" onClick={this.logout}>Logout</button>
        </div>
      </div>);
  }
}

export default Welcome;
