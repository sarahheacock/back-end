import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

import EditForm from '../forms/EditForm';
import { initial, messages } from '../../../../data/data';


class EditModal extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    edit: PropTypes.object.isRequired,
    message: PropTypes.string.isRequired,

    getData: PropTypes.func.isRequired,
    putData: PropTypes.func.isRequired,
    postData: PropTypes.func.isRequired,
    deleteData: PropTypes.func.isRequired,
    uploadFile: PropTypes.func.isRequired,

    updateState: PropTypes.func.isRequired,
  }

  pop = (e) => {
    e.preventDefault();
    this.props.updateState({
      edit: initial.edit,
      message: initial.message
    });
  }

  onFormChange = (e) => {
    console.log(e.target);

    let dataObj = {...this.props.edit.dataObj};
    const nameArr = e.target.name.split("-");
    const name = nameArr[0];
    const index = nameArr[1]
    const value = e.target.value;

    if(value === "on"){
      dataObj[name] = !dataObj[name];
    }
    else if(value === "delete"){
      dataObj[name].splice(index, 1);
    }
    else {
      if(Array.isArray(this.props.edit.dataObj[name])){
        dataObj[name][index] = value;
      }
      else {
        dataObj[name] = value;
      }
    }


    this.props.updateState({
      edit: {
        ...this.props.edit,
        dataObj: dataObj
      },
      message: ''
    });
  }

  onDrop = (files, rejected) => {
    const name = (window.location.pathname === "/") ?
      "carousel":
      (window.location.pathname === "/publications")?
        "link":
        "image";

    if(rejected[0]){
      this.props.updateState({"message": (name === "link") ? "File must be pdf." : "Image must be png, jpg, or jpeg."})
    }
    else{
      this.props.updateState({"message": "Loading..."})
    }
  }

  onFormAdd = (files) => {
    const name = (window.location.pathname.includes("gallery")) ?
      "carousel":
      "image";

    let newEdit = {...this.props.edit};
    const file = new File([files[0]], files[0].name, {
      type: "image/jpeg",
    });

    let formData = new FormData();
    formData.append('file', file);
    console.log('file', formData.get('file'));

    this.props.uploadFile({
      url: `/file?token=${this.props.user.token}`,
      edit: newEdit,
      name: name
    }, formData);
  }


  render(){

    const title = this.props.edit.modalTitle;
    let editFunc = this.props.postData;
    if(title.includes("Edit") || title.includes("Charge") || title.includes("Update") || title.includes("Remove") || title.includes("Reminder") || title.includes("Check-In")){
      editFunc = this.props.putData;
    }
    else if(title.includes("Delete")){
      editFunc = this.props.deleteData;
    }
    else if(title.includes("Continue") || title.includes("Logout")){
      editFunc = this.props.getData;
    }

    return (
      <div>
        <Modal show={Object.keys(this.props.edit.dataObj).length > 0}>
          <Modal.Header>
            <Modal.Title>{this.props.edit.modalTitle}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <EditForm
              formChange={this.onFormChange}
              drop={this.onDrop}
              formAdd={this.onFormAdd}
              editData={editFunc}
              updateState={this.props.updateState}

              message={this.props.message}
              user={this.props.user}
              edit={this.props.edit}
            />
          </Modal.Body>

          <Modal.Footer>
            <div className="text-center">
              <button className="buttonLarge cancel" onClick={this.pop}>
                {(this.props.message === messages.messageSent || this.props.message === "logged out") ? "Close" : "Cancel"} <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </div>
            *Fill out required fields
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default EditModal;
