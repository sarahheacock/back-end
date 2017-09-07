import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';

import { cloudName } from '../../../../data/data';


const Gallery = (props) => {
  console.log(props.data.rooms);
  const gallery = props.data.rooms.map((room, i) => (
    <div className="content" key={room._id}>
      <Row className="clear-fix">
        <Col sm={6} className="columns">
          <div className="text-center">
            <CloudinaryContext cloudName={cloudName}>
                <Image publicId={room.image} className="projectPic" >
                    <Transformation width="250" crop="scale"/>
                </Image>
            </CloudinaryContext>
          </div>
        </Col>
        <Col sm={6} className="columns">
          <div className="text-center">
            <h3 className="pretty">{room.title}</h3>
            <h4 className="paragraph"><big>$</big>{`${room.cost}.`}<sup>00</sup><sub> per night</sub></h4>
            <div>
              <NavLink to={`/gallery/${i}`}>
                <button className="button blueButton">More Info</button>
              </NavLink>
              <NavLink to="/book">
                <button className="button">Book Now</button>
              </NavLink>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  ));

  return (
    <div>
      <h3 className="pretty">{props.data.title}</h3>
      <p><b className="paragraph">{props.data.b}</b></p>
      <p className="paragraph">{props.data.p1}</p>
      <div>{gallery}</div>
    </div>
  );
}

export default Gallery;

Gallery.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
