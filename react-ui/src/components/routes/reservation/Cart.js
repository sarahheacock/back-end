import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import { Row, Col, FormGroup, Checkbox } from 'react-bootstrap';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';

import EditButton from '../../buttons/EditButton.js';
import { cloudName } from '../../../../../data/data';

const Cart = (props) => {
  const limit = new Date().setUTCHours(12, 0, 0, 0);

  const cart = props.cart.sort((a, b) => {
    if(a.start < limit && b.start >= limit) return 1; //push b to the front;
    if(a.start >= limit && b.start < limit) return -1; //push a to the front

    return a.start - b.start; // -1 if a < b

  }).map((item, i) => {
    const start = moment(new Date(item.start)).format('MMM Do YYYY');
    const startTime = moment(new Date(item.start)).add(6, 'hours').format('h:mm a');
    const end = moment(new Date(item.end)).format('MMM Do YYYY');
    const endTime = moment(new Date(item.end)).add(3, 'hours').add(1, 'minutes').format('h:mm a');

    return (
      <div className={(item.start < limit) ? "content old" : "content"} key={`${i}cart`}>
        <Row className="clear-fix">
          <Col sm={1} className="columns">
            {(props.user.admin && props.remove === false && props.updateState) ?
              <FormGroup className="text-center">
                <Checkbox
                  className="text-center big-check"
                  name={item._id}
                  checked={item.notes === true}
                  onChange={(e) => {
                    let edit = props.cart.map((m) => {
                      if(m._id === e.target.name){
                        if(item.notes === '') m.notes = true;
                        else m.notes = !m.notes;
                      }
                      return m;
                    });
                    props.updateState({welcome: edit})
                  }}
                >
                </Checkbox>
              </FormGroup>:
              <div></div>
            }
          </Col>
          <Col sm={5} className="columns">
            <div className="text-center">
              <h3 className="pretty text-center">{item.roomID.title}</h3>
              <h4><b>{start}<br />{`${startTime} -`}</b></h4>
              <h4><b>{end}<br />{endTime}</b></h4>
              <h4 className="paragraph"><big>$</big>{item.cost}<sup>{".00"}</sup></h4>
            </div>
          </Col>
          <Col sm={6} className="columns">
            <div className="text-center">
              <br />
              <CloudinaryContext cloudName={cloudName}>
                  <Image publicId={item.roomID.image} className="projectPic" >
                      <Transformation width="200" crop="scale" radius="10"/>
                  </Image>
              </CloudinaryContext>
              <br />
              {(props.remove) ?
                <EditButton
                  user={props.user}
                  dataObj={item}
                  updateState={props.updateState}
                  title="Remove from Cart"
                />:
                <div></div>}
                {(item.reminded && props.user.admin) ?
                <span className="welcome"><i className="fa fa-check welcomeCheck" aria-hidden="true"></i> Reminded<br /></span>:
                <div></div>}
                {(item.checkedIn) ?
                <span className="welcome"><i className="fa fa-check welcomeCheck" aria-hidden="true"></i> Checked In<br /></span>:
                <div></div>}
                {(item.charged) ?
                <span className="welcome"><i className="fa fa-check welcomeCheck" aria-hidden="true"></i> Paid For<br /></span>:
                <div></div>}
            </div>
          </Col>
        </Row>

        <Row className="text-center">



        </Row>

      </div>
    );
  });

  return(
    <div>
    {cart}
    </div>
  );

};

export default Cart;

Cart.propTypes = {
  user: PropTypes.object.isRequired,
  cart: PropTypes.array.isRequired,
  updateState: PropTypes.func,
  remove: PropTypes.bool.isRequired
}

// <div className="main-content">
//   <h3 className="pretty text-center">Shopping Cart <i className="fa fa-shopping-cart" aria-hidden="true"></i></h3>
//     {(props.user.cart.length > 0) ?
//       <div className="flex-container">
//         {props.user.cart.map((room, i) => (
//           <div className="cart-item text-center" key={`cart${i}`}>
//             <h3 className="pretty">{`${room.roomID.title}`}</h3>
//             <h4 className="paragraph"><big>$</big>{room.cost}<sup>00</sup></h4>
//             <h4 className="paragraph">{room.guests}<sub>guest(s)</sub></h4>
//           </div>
//         ))}
//         <div className="cart-item">
//            <h3 className="pretty text-center">{`${(true) ? ' =' : ' +'}`}</h3>
//         </div>
//         <div className="text-center cart-item">
//           <h3 className="pretty">Total</h3>
//           <h4 className="paragraph"><big>$</big>{`${props.user.cart.reduce((a, b) => { return a + b.cost; }, 0)}.`}<sup>00</sup></h4>
//           <h4 className="paragraph">{`${props.user.cart.reduce((a, b) => { return a + b.guests; }, 0)} `}<sub>guest(s)</sub></h4>
//         </div>
//       </div> :
//       <h4 className="text-center">You currently have no items in your cart.</h4>}
// </div>

// <CloudinaryContext cloudName={cloudName}>
//     <Image publicId={room.roomID.image} className="projectPic" >
//         <Transformation width="150" crop="scale" radius="10"/>
//     </Image>
// </CloudinaryContext>
