import React from 'react';
import PropTypes from 'prop-types';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';
import { Button, Row, Col, ControlLabel, FormGroup, FormControl, Checkbox } from 'react-bootstrap';
import { loginData, initial, signUpData, addressData, paymentData, messageData, galleryData, localGuideData, editData, notRequired, messages, cloudName } from '../../../../data/data';

const upper = (label) => {
  const required = notRequired.reduce((c, d) => { return c || label === d }, false);
  if(!required) return `${label.charAt(0).toUpperCase()}${label.slice(1)}*`;
  else return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
};

const EditForm = (props) => {
  const formObj = { ...loginData, ...signUpData, ...addressData, ...paymentData, ...messageData, ...galleryData, ...localGuideData, ...editData };

  const check = (k) => {
    if(props.message === messages.inputError && !props.value){
      return 'warning';
    }
    if(props.message === messages.emailError && k === "email"){
      return 'warning';
    }
    if(props.message === messages.phoneError && k === "phone"){
      return 'warning';
    }
    return null;
  }

  const component = (!formObj[props.comp]) ?
    <div></div>:
    ((formObj[props.comp]["componentClass"] === 'checkbox') ?
      <Checkbox
        className="text-center"
        name={props.comp}
        value={props.value}
        onChange={props.formChange}
      >
      </Checkbox>:

      ((props.comp === "carousel" || props.comp === "image") ?
          <Row className="clearfix">
            <Row className="clearfix">
              <Col sm={6} className="text-center">
                <CloudinaryContext cloudName={cloudName}>
                    <Image publicId={props.value}>
                        <Transformation width="200" crop="fill"/>
                    </Image>
                </CloudinaryContext>
              </Col>
              <Col sm={2} className="text-center">
                {(props.comp === "carousel") ?
                <Button bsStyle="link" name={props.name} value="delete" onClick={props.formChange}>
                  Delete
                </Button>:
                <div></div>}
              </Col>
            </Row>
            <hr />
          </Row> :

          <FormControl
             name={props.comp}
             type={formObj[props.comp]["type"]}
             placeholder={formObj[props.comp]["placeholder"]}
             componentClass={formObj[props.comp]["componentClass"]}
             value={props.value}
             onChange={props.formChange}
           />
         ));
  const classComp = (formObj[props.comp]["componentClass"] === 'checkbox') ?
    "text-center" : "";

  return (
    <FormGroup className={classComp} validationState={check(props.comp)}>
      <ControlLabel>{upper(props.comp)}</ControlLabel>
      {component}
    </FormGroup>
  );
}


export default EditForm;

EditForm.propTypes = {
  comp: PropTypes.string.isRequired,
  formChange: PropTypes.func.isRequired,
  // value: PropTypes.object.isRequired,
};
