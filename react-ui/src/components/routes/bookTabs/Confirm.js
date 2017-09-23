import React from 'react';
import PropTypes from 'prop-types';

// import { PageHeader } from 'react-bootstrap';
// import { NavLink } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';

import Cart from '../reservation/Cart';
import PersonalInfo from '../reservation/PersonalInfo';
// import EditButton from '../../buttons/EditButton.js';
// import { blogID, initial } from '../../../../../data/data';


class Confirm extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired
  }

  componentDidMount(){
    if(this.props.user.cart.length > 0){
      this.props.updateState({
        title: "Confirm Reservation",
        dataObj: {}
      });
    }
  }

  // componentDidUpdate(prevProps){
  //   if()
  // }

  render(){

    return(
      <div className="main-content">
        <h3 className="pretty text-center">Shopping Cart <i className="fa fa-shopping-cart"></i>{` ${this.props.user.cart.length}`}</h3>
        {(this.props.user.cart.length > 0) ?
          <Cart
            updateState={this.props.updateState}
            user={this.props.user}
            cart={this.props.user.cart}
            remove={true}
          />:
          <h4 className="content text-center">You currently have no items in your cart.</h4>}

        <hr />
        <Row className="clear-fix">
          <Col sm={6} className="columns text-center">
            <h4><b>Total:</b></h4>
          </Col>
          <Col sm={6} className="columns text-center">
            {(this.props.user.cart.length >= 0) ?
            <div className="text-center">
              <h4><big>$</big>{this.props.user.cart.reduce((a, b) => {
                return a + b.cost;
              }, 0)}<sup>{".00"}</sup><br />{this.props.user.cart.reduce((a, b) => {
                return a + b.guests;
              }, 0)}<sub> guest(s)</sub></h4>
            </div>:
            <div></div>}
          </Col>
        </Row>
        <hr />
        <br />

        <h3 className="pretty text-center">Personal Information</h3>
        <div className="content text-center">
          <PersonalInfo
            category="email"
            user={this.props.user}
            updateState={this.props.updateState}
          />
          <hr />
          <PersonalInfo
            category="billing"
            user={this.props.user}
            updateState={this.props.updateState}
          />
          <hr />
          <PersonalInfo
            category="credit"
            user={this.props.user}
            updateState={this.props.updateState}
          />

        </div>
        <hr />

      </div>);
  }
}

export default Confirm;
