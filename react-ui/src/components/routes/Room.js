import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import { Image } from 'cloudinary-react';

import { cloudName } from '../../../../data/data';
import EditButton from '../buttons/EditButton.js';

const link = (cat) => {
  return cat.toLowerCase().trim().replace(/\W/g,"").replace(/\s/g, "-");
}

const Room = (props) => {
  console.log(props.data);
  const location = window.location.pathname.split('/').filter((p) => { return p !== ''; });
  const pathname = location[location.length - 1];

  const data = props.data.reduce((a, b) => {
    if(pathname === link(b.title)) return b;
    return a;
  }, {title: "fghjk", carousel: []});

  //this is a crappy solution to prevent people from adding a non-existent room
  //since the route is /gallery/:room and
  //and since /gallery was an exact route, I had to create
  if(!data.cost) window.location.pathname = "/gallery";
  console.log(data);

  const carouselImg = data["carousel"].map((image, index) => (
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
          <h3 className="pretty text-center">{data.title}</h3>
          <p className="paragraph"><b>{data.b}</b></p>
          <p className="paragraph">{data.p1}</p>
          <br />
          <div className="text-center">
            <h4 className="paragraph"><big>$</big>{`${data.cost}.`}<sup>00</sup><sub> per night</sub></h4>
            <h4 className="paragraph"><big>{data["maximum-occupancy"]}</big><sub> person max</sub></h4>
            <div>
              <NavLink to="/book">
                <button className="buttonLarge orangeButton">Check Availability <i className="fa fa-calendar-check-o" aria-hidden="true"></i></button>
              </NavLink>
            </div>
          </div>
          <div className="text-center">
            <EditButton
              user={props.user}
              dataObj={data}
              updateState={props.updateState}
              title="Edit Room"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;

Room.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
