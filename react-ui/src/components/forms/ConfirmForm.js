import React from 'react';
import PropTypes from 'prop-types';

//import EditFormText from './EditFormText';
import Cart from '../routes/reservation/Cart';
import { Row, Col } from 'react-bootstrap';

const ConfirmForm = (props) => {
  console.log(props.reservations)
  return(
    <div>
      <Cart
        user={props.user}
        cart={props.reservations}
        remove={false}
      />
      <hr />

      <Row className="clear-fix">
        <Col sm={6} className="columns">
          <h4><b>Email: </b></h4>
        </Col>
        <Col sm={6} className="columns">
          <h4 className="text-center">{props.user.email}</h4>
        </Col>
      </Row>
      <hr />

      <Row className="clear-fix">
        <Col sm={6} className="columns">
          <h4><b>Credit: </b></h4>
        </Col>
        <Col sm={6} className="columns">
          {props.user.credit.split("/").map((c, i) => {
            if(c.includes("fa ")) return <div key={`confirmInfo${i}`} className="text-center"><i className={`${c} fa-2x`} aria-hidden="true"></i></div>
            else return <h4 key={`confirmInfo${i}`} className='text-center'>{c}</h4>;
          })}
        </Col>
      </Row>
      <hr />

      <Row className="clear-fix">
        <Col sm={6} className="columns">
          <h4><b>Total: </b></h4>
        </Col>
        <Col sm={6} className="columns">
          <h4 className="text-center"><big>$</big>{props.reservations.reduce((a, b) => {
            return a + b.cost;
          }, 0)}<sup>{".00"}</sup><br />{props.reservations.reduce((a, b) => {
            return a + b.guests;
          }, 0)}<sub> guest(s)</sub></h4>
        </Col>
      </Row>
      <br />
      <br />

    </div>
  );
}

export default ConfirmForm;

ConfirmForm.propTypes = {
  user: PropTypes.object.isRequired,
  reservations: PropTypes.array.isRequired
}
