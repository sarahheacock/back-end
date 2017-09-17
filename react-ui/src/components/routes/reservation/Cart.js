import React from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';
import { cloudName } from '../../../../../data/data';

const Cart = (props) => {
  console.log(props.user.cart);
  //const cart = ;

  return(
    <div className="main-content">
      <h3 className="pretty text-center">Shopping Cart <i className="fa fa-shopping-cart" aria-hidden="true"></i></h3>
        {(props.user.cart.length > 0) ?
          <div className="flex-container">
            {props.user.cart.map((room, i) => (
              <div className="cart-item text-center" key={`cart${i}`}>
                <h3 className="pretty">{`${room.roomID.title}`}</h3>
                <h4 className="paragraph"><big>$</big>{room.cost}<sup>00</sup></h4>
                <h4 className="paragraph">{room.guests}<sub>guest(s)</sub></h4>
              </div>
            ))}
            <div className="cart-item">
               <h3 className="pretty text-center">{`${(true) ? ' =' : ' +'}`}</h3>
            </div>
            <div className="text-center cart-item">
              <h3 className="pretty">Total</h3>
              <h4 className="paragraph"><big>$</big>{`${props.user.cart.reduce((a, b) => { return a + b.cost; }, 0)}.`}<sup>00</sup></h4>
              <h4 className="paragraph">{`${props.user.cart.reduce((a, b) => { return a + b.guests; }, 0)} `}<sub>guest(s)</sub></h4>
            </div>
          </div> :
          <h4 className="text-center">You currently have no items in your cart.</h4>}
    </div>
  );

};

export default Cart;

Cart.propTypes = {
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}

// <CloudinaryContext cloudName={cloudName}>
//     <Image publicId={room.roomID.image} className="projectPic" >
//         <Transformation width="150" crop="scale" radius="10"/>
//     </Image>
// </CloudinaryContext>
