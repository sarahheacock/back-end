import React from 'react';
import PropTypes from 'prop-types';

import { Route, Redirect, Switch } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Row, Col, PageHeader } from 'react-bootstrap';
import { initial, signUpAdminData, blogID } from '../../../../data/data';

import Select from './bookTabs/Select';
import Pay from './bookTabs/Pay';
import Bill from './bookTabs/Bill';
import Confirm from './bookTabs/Confirm';
import ContinueButton from '../buttons/ContinueButton';


// import EditButton from '../buttons/EditButton';
class Book extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
    getData: PropTypes.func.isRequired,
    putData: PropTypes.func.isRequired,
    postData: PropTypes.func.isRequired
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

  login = (e) => {
    if(e) e.preventDefault();
    if(this.props.user.admin){
      const dataObj = (Object.keys(signUpAdminData)).reduce((a, b) => {
        a[b] = signUpAdminData[b]["default"];
        return a;
      }, {});

      this.props.updateState({
        edit: {
          url: '/user/page/' + blogID + '?token=' + this.props.user.token,
          modalTitle: 'Submit',
          next: '#',
          dataObj: dataObj
        }
      });
    }
  }

  render(){
    const bill = this.props.user.cart.length > 0;
    const pay = this.props.user.billing.charAt(0) !== '/' && this.props.user.billing !== '';
    const conf = this.props.user.credit.charAt(0) !== '/' && this.props.user.credit !== '';


    //get categories
    const categories = {
      "Select Room": true,
      Billing: bill,
      Payment: pay && bill,
      Confirm: conf && pay && bill,
    };

    const link = (cat) => {
      if(cat === "Welcome") return cat.toLowerCase().trim().replace(/\s/g, "-");
      return "/book/" + cat.toLowerCase().trim().replace(/\s/g, "-");
    };

    const getClass = (cat) => {
      if(window.location.pathname.includes(link(cat))) return "linkButton blueButtonActive";
      if(categories[cat]) return "linkButton blueButton";
      return "linkButton blueButtonInactive"
    };

    const getRedirect = () => {
      return Object.keys(categories).reduce((a, b) => {
        if(categories[b]) return link(b);
        else return a;
      }, "/gallery");
    }

    const getIcon = (n) => {
      if(n.includes("Confirm")) return "fa fa-check";
      if(n.includes("Select")) return "fa fa-home";
      if(n.includes("Payment")) return "fa fa-credit-card";
      if(n.includes("Billing")) return "fa fa-address-card-o";
      return "";
    }

    const keys = Object.keys(categories);
    const tabs = keys.map((cat, i) => (
      <div key={`bookTab${i}`}>
        <NavLink to={link(cat)}>
          <button className={getClass(cat)}>{cat} <i className={getIcon(cat)}></i></button>
        </NavLink>
      </div>
    ));

    return (
      <div>
        <PageHeader>
          <Row className="clear-fix">
            <Col sm={6}>
              <span className="header-text">Book Your Stay </span>
            </Col>
            <Col sm={6} className="admin">
              {(this.props.user.admin) ?
                <span>
                {(this.props.user._id)?
                <a className="sign-out" href="#" onClick={this.logout}>{`Sign Out ${this.props.user.email}`} <i className="fa fa-sign-out"></i></a>:
                <a className="sign-in" href="#" onClick={this.login}>Sign In Client <i className="fa fa-sign-in"></i></a>
                }</span>:
                <span></span>}
            </Col>
          </Row>
          <hr />
        </PageHeader>
        <div className="main-content">
          <div>
            <Row className="clear-fix">
              <Col sm={4} className="columns">
                <br />
                <div className="text-center">{tabs}</div>
              </Col>
              <Col sm={8} className="columns">
              <ContinueButton
                categories={categories}
                user={this.props.user}
                updateState={this.props.updateState}
              />
              <Switch>
                <Route path={link(keys[0])} render={ () =>
                  <Select
                    data={this.props.data}
                    user={this.props.user}
                    updateState={this.props.updateState}
                    getData={this.props.getData}
                    putData={this.props.putData}
                    postData={this.props.postData}
                  /> }
                />
                <Route path={link(keys[1])} render={ () =>
                  (categories[keys[1]]) ?
                  <Bill
                    user={this.props.user}
                    updateState={this.props.updateState}
                  />:
                  <Redirect to={getRedirect()} /> }
                />
                <Route path={link(keys[2])} render={ () =>
                  (categories[keys[2]]) ?
                  <Pay
                    user={this.props.user}
                    updateState={this.props.updateState}
                  />:
                  <Redirect to={getRedirect()} /> }
                />
                <Route path={link(keys[3])} render={ () =>
                  (categories[keys[3]]) ?
                  <Confirm
                    user={this.props.user}
                    updateState={this.props.updateState}
                  />:
                  <Redirect to={getRedirect()} /> }
                />
                <Route render={ () => (
                  <Redirect to={link(keys[0])} />
                )} />
              </Switch>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

export default Book;

// <Cart
//   updateState={this.props.updateState}
//   user={this.props.user}
// />
// <hr />

// Book.propTypes = {
//   data: PropTypes.object.isRequired,
//   user: PropTypes.object.isRequired,
//   updateState: PropTypes.func.isRequired,
//   getData: PropTypes.func.isRequired
// }
