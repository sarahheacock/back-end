import React from 'react';
import PropTypes from 'prop-types';

import { PageHeader, Form } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';

import Cart from './reservation/Cart';
import PersonalInfo from './reservation/PersonalInfo';
import EditButton from '../buttons/EditButton.js';
// import { NavLink } from 'react-router-dom';
import { blogID, initial } from '../../../../data/data';


class Welcome extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    getData: PropTypes.func.isRequired,
    updateState: PropTypes.func.isRequired,
  }

  // constructor(props){
  //   super(props);
  // }

  componentDidMount(){
    const location = window.location.pathname.split('/').reduce((a, b) => {
      if(b.length > 16) return b;
      else return a;
    }, '');

    const url = (this.props.user.admin) ?  `/res/page/${blogID}/${location}?token=${this.props.user.token}` : `/res/user/${this.props.user._id}?token=${this.props.user.token}`;
    this.props.getData(url);
  }

  componentDidUpdate(prevProps, prevState){
    const location = window.location.pathname.split('/').reduce((a, b) => {
      if(b.length > 16) return b;
      else return a;
    }, '');

    if(prevProps.user.cart.length > this.props.user.cart.length){
      const url = (this.props.user.admin) ?  `/res/page/${blogID}/${location}?token=${this.props.user.token}` : `/res/user/${this.props.user._id}?token=${this.props.user.token}`;
      this.props.getData(url);
    }
  }

  componentWillUnmount(){
    if(this.props.user.admin){
      this.props.updateState({
        user: {
          ...initial.user,
          name: this.props.user.name,
          token: this.props.user.token,
          admin: true
        }
      });
    }
  }

  logout = (e) => {
    if(e) e.preventDefault();
    window.location.pathname = "/welcome";
  }


  check = (e) => {
    if(e) e.preventDefault();

    if(this.props.data.length > 0){
      const newState = this.props.data.map((state) => {
        state.notes = (state.notes === false || state.notes === '');
        return state;
      });

      this.props.updateState({
        welcome: newState
      });
    }
  }

  // logout = (e) => {
  //   //this.props.getData('/auth/logout');
  //   this.props.updateState({
  //     url: '/auth/logout',
  //     dataObj:
  //   });
  // }

  valid = (key) => {
    return this.props.data.reduce((a, b) => {
      if(b.notes){
        if(b[key] === false || key === "delete") a.push(b);
      }
      return a;
    }, []);
  }

  render(){

    return(
      <div>
      <PageHeader>
        <Row className="clear-fix">
          <Col sm={6}>
            <span className="header-text">{`Welcome, ${this.props.user.name || this.props.user.email.slice(0, this.props.user.email.indexOf('@'))}! `}</span>
          </Col>
          <Col sm={6} className="admin">
            {(this.props.user.admin) ?
              <a className="sign-out" href="#" onClick={this.logout}>{`Sign Out ${this.props.user.email}`} <i className="fa fa-sign-out"></i></a>:
              <span></span>}
          </Col>
        </Row>
        <hr />
      </PageHeader>

      <div className="main-content">
        <div className="text-center">
          <br />
          <EditButton
            user={this.props.user}
            dataObj={{}}
            updateState={this.props.updateState}
            title="Logout"
          />
          {(this.props.user.admin) ?
          <span>
            <NavLink to="/welcome">
              <button className="buttonLarge orangeButton">Go to Calendar <i className="fa fa-calendar-check-o" aria-hidden="true"></i></button>
            </NavLink>
            <NavLink to="/welcome/search">
              <button className="buttonLarge orangeButton">Search for Client <i className="fa fa-search" aria-hidden="true"></i></button>
            </NavLink>
          </span>:
          <div></div>}
        </div>
        <hr />

        <Row className="clear-fix">
          <Col sm={4} className="columns">
            <h3 className="pretty text-center">Upcoming Stays</h3>
            {(this.props.user.admin === false) ?
              <div className='text-center paragraph'><h4>Need to cancel or change a reservation? Click on a</h4>
              <h3>
                <EditButton
                  user={this.props.user}
                  updateState={this.props.updateState}
                  dataObj={this.props.user}
                  title="Send Message"
                />
              </h3>
              <h4>or call the number below.</h4></div>:
              <div className="text-center">
                <br />
                <EditButton
                  user={this.props.user}
                  updateState={this.props.updateState}
                  dataObj={this.valid("reminded")}
                  title="Send Reminder"
                />
                <br />
                <EditButton
                  user={this.props.user}
                  updateState={this.props.updateState}
                  dataObj={this.valid("checkedIn")}
                  title="Check-In"
                />
                <br />
                <EditButton
                  user={this.props.user}
                  updateState={this.props.updateState}
                  dataObj={this.valid("charged")}
                  title="Charge Client"
                />
                <br />
                <EditButton
                  user={this.props.user}
                  updateState={this.props.updateState}
                  dataObj={this.valid("delete")}
                  title="Delete Reservation"
                />
              </div>
            }
          </Col>
          <Col sm={8} className="columns">
            {(this.props.data.length > 0) ?
              <Form>
                <div className="text-center">
                  {(this.props.user.admin && this.props.data.length > 0) ?
                    <div>
                      <br />
                      <button className="button blueButton" onClick={this.check}>{(this.props.data[0]["notes"] === true) ? "Uncheck All" : "Check All"}</button>
                    </div>:
                    <div></div>
                  }
                </div>
                <Cart
                  updateState={this.props.updateState}
                  user={this.props.user}
                  cart={this.props.data}
                  remove={false}
                />
              </Form>:
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
                {(!this.props.user.admin) ?
                <NavLink to="/book/confirm">
                  <button className="buttonLarge blueButton">Book Now <i className="fa fa-book" aria-hidden="true"></i></button>
                </NavLink>:
                <div></div>}
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

      </div>
      </div>);
  }
}

export default Welcome;
