import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import { Image } from 'cloudinary-react';

import { cloudName } from '../../../../data/data';

const Room = (props) => {
  const index = window.location.pathname.split('/').reduce((a, b) => {
    if(!isNaN(a)) return a;
    else return parseInt(b);
  }, NaN);

  const carouselImg = props.data[index]["carousel"].map((image, index) => (
    <Carousel.Item key={`carImg${index}`}>
      <Image className='carImg'
        id={`carImg${index}`}
        cloudName={cloudName}
        publicId={image}
        height="600"
        width="1200"
        crop="fill"/>
      <Carousel.Caption>

      </Carousel.Caption>
    </Carousel.Item>
  ));

  return (
    <div>
      <header>
        <Carousel className="carousel-content">
          {carouselImg}
        </Carousel>
      </header>
      <h1 className="headerText clear">{("b&b").toUpperCase()}
        <hr />
        Welcome Home
      </h1>

      <div className="home">
        <div className="content">
          <h3 className="pretty">{props.data[index].title}</h3>
          <p className="paragraph"><b>{props.data[index].b}</b></p>
          <p className="paragraph">{props.data[index].p1}</p>
          <br />
          <div className="text-center">
            <h4 className="paragraph"><big>$</big>{`${props.data[index].cost}.`}<sup>00</sup><sub> per night</sub></h4>
            <h4 className="paragraph"><big>{props.data[index]["maximum-occupancy"]}</big><sub> person max</sub></h4>
            <NavLink to="/book">
              <button className="button blueButton">Book Now</button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;

Room.propsTypes = {
  data: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
