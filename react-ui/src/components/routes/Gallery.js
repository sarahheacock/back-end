import React from 'react';
import PropTypes from 'prop-types';

// import { Route, Redirect, Switch } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';

import { cloudName } from '../../../../data/data';
import EditButton from '../buttons/EditButton.js';
//import Room from './Room';

const link = (cat) => {
  return cat.toLowerCase().trim().replace(/\W/g,"").replace(/\s/g, "-");
}

const Gallery = (props) => {
  // const routes = props.data.rooms.map((room, i) => {
  //   <Route key={`roomRoute${i}`} path={`/gallery/${link(room.title)}`} render={ () =>
  //     <Room
  //       data={props.data.rooms}
  //       user={props.user}
  //       updateState={props.updateState}
  //     /> }
  //   />
  // });

  const gallery = props.data.rooms.map((room, i) => (
    <div className="content" key={room._id}>
      <Row className="clear-fix">
        <Col sm={6} className="columns">
          <div className="text-center">
            <CloudinaryContext cloudName={cloudName}>
                <Image publicId={room.image} className="projectPic" >
                    <Transformation width="250" crop="scale" radius="10"/>
                </Image>
            </CloudinaryContext>
          </div>
        </Col>
        <Col sm={6} className="columns">
          <div className="text-center">
            <h3 className="pretty">{room.title}</h3>
            <h4 className="paragraph"><big>$</big>{`${room.cost}.`}<sup>00</sup><sub> per night</sub></h4>
            <br />
            <div>
              <NavLink to={`/gallery/${link(room.title)}`}>
                <button className="button blueButton">More Info <i className="fa fa-info" aria-hidden="true"></i></button>
              </NavLink>
              <NavLink to="/book">
                <button className="button orangeButton">Check <i className="fa fa-calendar-check-o" aria-hidden="true"></i></button>
              </NavLink>
            </div>
            <br />
            <div>
              <EditButton
                user={props.user}
                dataObj={room}
                updateState={props.updateState}
                title="Edit Room"
              />
              <EditButton
                user={props.user}
                dataObj={room}
                updateState={props.updateState}
                title="Delete Room"
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  ));

  return (
    <div className="text-center">
      <h3 className="pretty">{props.data.title}</h3>
      <p><b className="paragraph">{props.data.b}</b></p>
      <p className="paragraph">{props.data.p1}</p>
      <div className="text-center">
        <EditButton
          user={props.user}
          dataObj={props.data}
          updateState={props.updateState}
          title="Edit Content"
        />
      </div>
      <br />
      <div>{gallery}</div>
      <div className="text-center">
        <EditButton
          user={props.user}
          dataObj={props.data.rooms[0]}
          updateState={props.updateState}
          title="Add Room"
        />
      </div>
    </div>
  );
}

export default Gallery;

Gallery.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
