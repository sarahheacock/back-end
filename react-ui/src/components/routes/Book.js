import React from 'react';
import PropTypes from 'prop-types';

import { Route, Redirect, Switch } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';

import Select from './bookTabs/Select';
import Pay from './bookTabs/Pay';
import Bill from './bookTabs/Bill';
import Confirm from './bookTabs/Confirm';

// import EditButton from '../buttons/EditButton';

const Book = (props) => {
  //get categories
  const categories = {
    "Select Room": true,
    Billing: props.data.reservation.roomID !== '',
    Payment: props.user.billing.charAt(props.user.billing.length - 1) !== '/' && props.user.billing !== '' && props.data.reservation.roomID !== '',
    Confirm: props.user.credit.charAt(props.user.credit.length - 1) !== '/' && props.user.credit !== '' && props.user.billing.charAt(props.user.billing.length - 1) !== '/' && props.user.billing !== '' && props.data.reservation.roomID !== ''
  };
  console.log(JSON.stringify(categories));

  const link = (cat) => {
    return "/book/" + cat.toLowerCase().trim().replace(/\s/g, "-");
  };

  const getClass = (cat) => {
    if(window.location.pathname.includes(link(cat))) return "linkButton blueButtonActive";
    if(categories[cat]) return "linkButton blueButton";
    return "linkButton blueButtonInactive"
  };

  const keys = Object.keys(categories);
  const tabs = keys.map((cat, i) => (
    <div key={`bookTab${i}`}>
      <NavLink to={link(cat)}>
        <button className={getClass(cat)}>{cat}</button>
      </NavLink>
    </div>
  ));

  return (
    <div>
      <Row className="clear-fix">
        <Col sm={4} className="columns">
          <div className="text-center">{tabs}</div>
        </Col>
        <Col sm={8} className="columns">
        <Switch>
          <Route path={link(keys[0])} render={ () =>
            <Select
            /> }
          />
          <Route path={link(keys[1])} render={ () =>
            (categories[keys[1]]) ?
            <Bill
            />:
            <Redirect to={link(keys[0])} /> }
          />
          <Route path={link(keys[2])} render={ () =>
            (categories[keys[2]]) ?
            <Pay
            />:
            <Redirect to={link(keys[0])} /> }
          />
          <Route path={link(keys[3])} render={ () =>
            (categories[keys[3]]) ?
            <Confirm
            />:
            <Redirect to={link(keys[0])} /> }
          />
          <Route render={ () => (
            <Redirect to={link(keys[0])} />
          )} />
        </Switch>
        </Col>
      </Row>
    </div>
  );
}

export default Book;

Book.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
