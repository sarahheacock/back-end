import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { Form } from 'react-bootstrap';

import EditFormComponents from './EditFormComponents';
import EditFormText from './EditFormText';
import SubmitButtonSet from '../buttons/SubmitButtonSet';

const EditForm = (props) => {

  //======ALL OF THE FORM GROUPS===================================

  // console.log(Object.keys(props.edit.dataObj));
  const formGroups = (props.edit.modalTitle.includes("Delete") || props.edit.modalTitle.includes("Upcoming")) ?
    <EditFormText
      title={props.edit.modalTitle}
      dataObj={props.edit.dataObj}
    />:
    Object.keys(props.edit.dataObj).map(k => {
      if(k === "carousel"){
        console.log(props.edit.dataObj[k]);
        return props.edit.dataObj[k].map((j, i) => (
          <EditFormComponents
            key={`${i}car`}
            name={`${k}-${i}`}
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
            name={k}
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
        {((Object.keys(props.edit.dataObj).includes("carousel") || Object.keys(props.edit.dataObj).includes("image")) && !props.edit.modalTitle.includes("Delete")) ?
          <Dropzone
            multiple={false}
            accept={"image/*"}
            onDrop={props.drop.bind(this)}
            onDropAccepted={props.formAdd.bind(this)}>
            <p>{"Drop an image or click to select a file to upload."}</p>
          </Dropzone>:
          <div></div>}
      </div>
      <div className="text-center">
        <SubmitButtonSet
          editData={props.editData}
          updateState={props.updateState}

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
  formAdd: PropTypes.func.isRequired,
  drop: PropTypes.func.isRequired,
  formChange: PropTypes.func.isRequired,

  editData: PropTypes.func.isRequired,
  updateState: PropTypes.func.isRequired,

  message: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  edit: PropTypes.object.isRequired,
};
