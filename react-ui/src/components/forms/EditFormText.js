import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';
import { cloudName } from '../../../../data/data';
import moment from 'moment';

const EditFormText = (props) => {
  let content = "reservation";
  if(window.location.pathname.includes("gallery")) content = "room";
  if(window.location.pathname.includes("guide")) content = "content";

  // const start = ;
  // const end = ;

  return(
    <div>
      <h3 className="pretty text-center">{props.dataObj.title || props.dataObj.roomID.title}</h3>
      <br />
      <Row className="clear-fix">
        <Col sm={6} className="columns">
          <div className="text-center">
            {(props.dataObj.userID) ?
            <span>
              <h4 className="paragraph">{props.dataObj.userID.name || props.dataObj.userID.email}</h4>
              <p className="paragraph">{props.dataObj.userID.credit || ""}</p>
              <p className="paragraph">{props.dataObj.userID.billing || ""}</p>
            </span>:
            <div></div>}
            {(props.dataObj.start) ?
            <span>
              <h4><b>{`${moment(new Date(props.dataObj.start)).add(6, 'hours').format('MMM Do YYYY, h:mm a')} -`}</b></h4>
              <h4><b>{moment(new Date(props.dataObj.end)).add(3, 'hours').add(1, 'minutes').format('MMM Do YYYY, h:mm a')}</b></h4>
            </span>:
            <div></div>}
            <h4 className="paragraph"><big>{(props.dataObj.address) ? "" : "$"}</big>{props.dataObj.address || props.dataObj.cost || props.dataObj.userID.cost}<sup>{(props.dataObj.address) ? "" : ".00"}</sup></h4>
          </div>
        </Col>
        <Col sm={6} className="columns">
          <div className="text-center">
            <CloudinaryContext cloudName={cloudName}>
                <Image publicId={props.dataObj.image || props.dataObj.roomID.image} className="projectPic" >
                    <Transformation width="200" crop="scale" radius="10"/>
                </Image>
            </CloudinaryContext>
          </div>
        </Col>
      </Row>
      <br />
      {(props.title.includes("Delete")) ?
        <h4 className="text-center">{`Are you sure you want to delete this ${content}?`}</h4>:
        <div></div>
      }
      <br />
    </div>
  );
}

export default EditFormText;

EditFormText.propTypes = {
  title: PropTypes.string.isRequired,
  dataObj: PropTypes.object.isRequired
}
