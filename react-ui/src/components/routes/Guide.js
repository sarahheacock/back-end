import React from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';
import { cloudName } from '../../../../data/data';

import EditButton from '../buttons/EditButton.js';


const Guide = (props) => {
  return (
    <div>
      {props.data.map((d) => (
        <div className="content" key={d._id}>
          <Row className="clear-fix">
            <Col sm={6} className="columns">
              <div className="text-center">
                <h3 className="pretty">{d.title}</h3>
                <h4 className="paragraph">{d.address}</h4>
                {(d.link !== '' && d.link !== '#') ?
                <a href="#" onClick={(e) => {
                  if(e) e.preventDefault();
                  window.open(d.link);
                }}>
                  <i className="fa fa-info-circle fa-2x" aria-hidden="true"></i>
                </a> : <div></div>}
              </div>
            </Col>
            <Col sm={6} className="columns">
              <div className="text-center">
                <CloudinaryContext cloudName={cloudName}>
                    <Image publicId={d.image} className="projectPic" >
                        <Transformation width="200" crop="scale" radius="10"/>
                    </Image>
                </CloudinaryContext>
              </div>
            </Col>
          </Row>
          <Row className="clear-fix">
            <br />
            <p className="paragraph">{d.p1}</p>
            <br />
            <div className="text-center">
              <EditButton
                user={props.user}
                dataObj={d}
                updateState={props.updateState}
                title="Edit Guide"
              />
              <EditButton
                user={props.user}
                dataObj={d}
                updateState={props.updateState}
                title="Delete Guide"
              />
            </div>
          </Row>
        </div>
      ))}
    </div>
  );
}

export default Guide;

Guide.propsTypes = {
  data: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
