import React from 'react';
import PropTypes from 'prop-types';

import { ControlLabel, FormGroup, FormControl, Checkbox } from 'react-bootstrap';
import { loginData, notRequired, messages } from '../../../../data/data';
const formObj = {...loginData};

const upper = (label) => {
  const required = notRequired.reduce((c, d) => { return c || label === d }, false);
  if(!required) return `${label.charAt(0).toUpperCase()}${label.slice(1)}*`;
  else return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
};

const EditForm = (props) => {

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

      <FormControl
         name={props.comp}
         type={formObj[props.comp]["type"]}
         placeholder={formObj[props.comp]["placeholder"]}
         componentClass={formObj[props.comp]["componentClass"]}
         value={props.value}
         onChange={props.formChange}
       />
      );
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
