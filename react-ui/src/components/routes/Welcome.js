import React from 'react';
import PropTypes from 'prop-types';

import { PageHeader } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';

import Cart from './reservation/Cart';
import PersonalInfo from './reservation/PersonalInfo';
import EditButton from '../buttons/EditButton.js';
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
    const location = window.location.pathname.split('/').reduce((a, b) => {
      if(b.length > 16) return b;
      else return a;
    }, '');
    console.log(location);

    const url = (this.props.user.admin) ?  `/res/page/${blogID}/${location}?token=${this.props.user.token}` : `/res/user/${this.props.user._id}?token=${this.props.user.token}`;
    this.props.getData(url);
  }

  componentDidUpdate(prevProps, prevState){
    const location = window.location.pathname.split('/').reduce((a, b) => {
      if(b.length > 16) return b;
      else return a;
    }, '');
    console.log(location);

    if(prevProps.user.cart.length > this.props.user.cart.length){
      const url = (this.props.user.admin) ?  `/res/page/${blogID}/${location}?token=${this.props.user.token}` : `/res/user/${this.props.user._id}?token=${this.props.user.token}`;
      this.props.getData(url);
    }
  }

  logout = (e) => {
    this.props.getData('/auth/logout');
  }

  render(){

    return(
      <div className="main-content">
        <PageHeader><span className="header-text">{`Welcome, ${this.props.user.name || this.props.user.email.slice(0, this.props.user.email.indexOf('@'))}!`}</span></PageHeader>
        <div className="text-center">
          <button className="linkButton blueButton" onClick={this.logout}>Logout</button>
        </div>
        <hr />

        <Row className="clear-fix">
          <Col sm={4} className="columns">
            <h3 className="pretty text-center">Upcoming Stays</h3>
            {(this.props.data.length >= 0) ?
              <div className='text-center'><h4>Click on a</h4>
              <h3>
                <EditButton
                  user={this.props.user}
                  updateState={this.props.updateState}
                  dataObj={this.props.user}
                  title="Send Message"
                />
              </h3>
              <h4>or call the number below if you would like to cancel or change your reservation(s).</h4></div>:
              <div></div>
            }
          </Col>
          <Col sm={8} className="columns">
            {(this.props.data.length > 0) ?
              <Cart
                updateState={this.props.updateState}
                user={this.props.user}
                cart={this.props.data}
                remove={false}
              />:
              <h4 className="content text-center">You currently have no upcoming reservations.</h4>}
          </Col>
        </Row>
        <hr />

        <Row className="clear-fix">
          <Col sm={4} className="columns">
            <div className="text-center">
              <h3 className="pretty">Shopping Cart <i className="fa fa-shopping-cart"></i> {this.props.user.cart.length}</h3>
              {(this.props.user.cart.length > 0) ?
              <div>
                <NavLink to="/book/confirm">
                  <button className="linkButton blueButton">Book Now</button>
                </NavLink>
                <h4><big>$</big>{this.props.user.cart.reduce((a, b) => {
                  return a + b.cost;
                }, 0)}<sup>{".00"}</sup><br />{this.props.user.cart.reduce((a, b) => {
                  return a + b.guests;
                }, 0)}<sub> guest(s)</sub></h4>
              </div>:
              <div></div>}
            </div>
          </Col>
          <Col sm={8} className="columns">
            {(this.props.user.cart.length > 0) ?
              <Cart
                updateState={this.props.updateState}
                user={this.props.user}
                cart={this.props.user.cart}
                remove={true}
              />:
              <h4 className="content text-center">You currently have no items in your cart.</h4>}
          </Col>
        </Row>
        <hr />

        <Row className="clear-fix">
          <Col sm={4} className="columns">
            <h3 className="pretty text-center">Personal Information</h3>
          </Col>
          <Col sm={8} className="columns">
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
          </Col>
        </Row>
        <hr />

      </div>);
  }
}

export default Welcome;
