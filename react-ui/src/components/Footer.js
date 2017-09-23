import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';

import EditModal from '../components/modals/EditModal';
import EditButton from '../components/buttons/EditButton';


const Footer = (props) => {
  return (
    <footer className="text-center">

      <EditModal
        user={props.user}
        edit={props.edit}
        message={props.message}

        getData={props.getData}
        putData={props.putData}
        postData={props.postData}
        deleteData={props.deleteData}
        uploadFile={props.uploadFile}

        updateState={props.updateState}
      />

      <Row className="clearfix">
        <Col sm={6}>
         <hr />
          <h3 className="pretty">This page was built with</h3>
          <h3><i className="fa fa-heart footer-icon" aria-hidden="true"></i> and <i className="fa fa-coffee footer-icon" aria-hidden="true"></i></h3>
          <h3 className="pretty">by Sarah Heacock</h3>
          <hr />
        </Col>

        <Col sm={6}>
          <hr />
          <h3 className="pretty">Contact Us</h3>
          <h3>
            <EditButton
              user={props.user}
              updateState={props.updateState}
              dataObj={props.user}
              title="Send Message"
            />
          </h3>
          <h3 className="pretty">555-555-5555</h3>
          <hr />
        </Col>
      </Row>

      <br />

    </footer>

  );
}


export default Footer;

Footer.propTypes = {
  user: PropTypes.object.isRequired,
  edit: PropTypes.object.isRequired,
  message: PropTypes.string.isRequired,

  getData: PropTypes.func.isRequired,
  putData: PropTypes.func.isRequired,
  postData: PropTypes.func.isRequired,
  deleteData: PropTypes.func.isRequired,
  uploadFile: PropTypes.func.isRequired,

  updateState: PropTypes.func.isRequired,
};
