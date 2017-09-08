import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

import EditFormComponents from './EditFormComponents';
import SubmitButtonSet from '../buttons/SubmitButtonSet';

const EditForm = (props) => {

  //======ALL OF THE FORM GROUPS===================================

  // console.log(Object.keys(props.edit.dataObj));
  const formGroups = (props.edit.modalTitle.includes("Delete")) ?
    <div className="text-center">Are you sure you want to delete this service?</div>:
    Object.keys(props.edit.dataObj).map(k => {
      if(k === "carousel"){
        console.log(props.edit.dataObj[k]);
        return props.edit.dataObj[k].map((j, i) => (
          <EditFormComponents
            key={`${i}car`}
            comp={k}
            message={props.message}
            formChange={props.formChange}
            value={j}
          />
        ));
      }
      else {
        return(
          <EditFormComponents
            key={k}
            comp={k}
            message={props.message}
            formChange={props.formChange}
            value={props.edit.dataObj[k]}
          />
        );
      }
    });


  //============================================================

  return (
    <Form className="content">
      {formGroups}
      <div className="text-center">
        <SubmitButtonSet
          editData={props.editData}
          updateState={props.updateState}
          getData={props.getData}

          message={props.message}
          user={props.user}
          edit={props.edit}
        />
      </div>
    </Form>
  );
}


export default EditForm;

EditForm.propTypes = {
  formChange: PropTypes.func.isRequired,
  editData: PropTypes.func.isRequired,
  updateState: PropTypes.func.isRequired,
  getData: PropTypes.func.isRequired,

  message: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  edit: PropTypes.object.isRequired,
};
