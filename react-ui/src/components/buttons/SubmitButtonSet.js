import React from 'react';
import PropTypes from 'prop-types';
// const FBSDK = require('react-native-fbsdk');
// const {
//   LoginButton,
// } = FBSDK;

import { initialMessage, initialEdit, initialUser, messages } from '../../../../data/data';

import AlertMessage from './AlertMessage';
import EditButton from './EditButton';

const names = ["Send Reminder", "Check In", "Charge Client"];

//SUBMIT ADMIN EDITTING, USER PROFILE EDIT, CREATE USER, RESERVE, AND CANCEL RESERVATION
class SubmitButtonSet extends React.Component {
  static propTypes = {
    editData: PropTypes.func.isRequired,
    updateState: PropTypes.func.isRequired,

    message: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    edit: PropTypes.object.isRequired,
  }


  pop = (e) => {
    e.preventDefault();
    this.props.updateState({
      edit: initialEdit,
      message: initialMessage
    });
  }

  logout = (e) => {
    e.preventDefault();
    this.props.updateState({
      edit: initialEdit,
      message: initialMessage,
      user: initialUser,
    });
  }


  submit = (e) => {
    e.preventDefault();

    const edit = this.props.edit;
    if(edit.modalTitle.includes("Delete")) this.props.editData(edit.url);
    else this.props.editData(edit.url, edit.dataObj);
  }

  editRes = (e) => {
    e.preventDefault();
    const edit = this.props.edit;

    let url = edit.url; //send reminder
    if(e.target.name === names[1]) url.replace("reminder", "charge"); //charge client
    else if(e.target.name === names[2]) url.replace("reminder", "checkIn"); //check in
    console.log(url);

    this.props.editData(url);
  }


  render(){

    const edit = this.props.edit;
    let style = (edit.modalTitle.includes("Edit")) ?
      "button orangeButton":
      ((edit.modalTitle.includes("Add") || edit.modalTitle.includes("Login") || edit.modalTitle.includes("Send")) ?
        "button blueButton":
        ((edit.modalTitle.includes("Delete")) ?
          "button yellowButton":
          "button"));
    if(window.location.pathname.includes("welcome")) style += " linkButton smallLink";

    return (
      <div className="text-center">
        <AlertMessage
          message={this.props.message}
        />
        {
          (this.props.message !== messages.expError) ?
            <div>
              {(edit.modalTitle.includes("Upcoming")) ?
              <div>
                {names.map((n) => (
                <div key={n}>
                  <button className={(n.includes('Send')) ? "linkButton blueButton smallLink" : ((n.includes('Check')) ? "linkButton orangeButton smallLink" : "linkButton yellowButton smallLink")} onClick={this.editRes}>
                    {n}
                    {(n).includes('Send') ?
                      <i className="fa fa-paper-plane" aria-hidden="true"></i>:
                      <span></span>
                    }
                  </button>
                </div>
                ))}
                <EditButton
                  user={this.props.user}
                  updateState={this.props.updateState}
                  dataObj={edit.dataObj}
                  title="Delete Reservation"
                />
              </div>:
              <button className={style} onClick={this.submit}>
                {edit.modalTitle.replace('Message', '')}
                {(edit.modalTitle).includes('Send') ?
                  <i className="fa fa-paper-plane" aria-hidden="true"></i>:
                  ((edit.modalTitle).includes('Delete')?
                    <i className="fa fa-trash" aria-hidden="true"></i>:
                    <span></span>
                  )
                }
              </button>}

              {(edit.modalTitle.includes("Login"))?
                <span>
                  <EditButton
                    user={this.props.user}
                    updateState={this.props.updateState}
                    dataObj={{}}
                    title="Sign Up"
                  />
                  <br />
                  <br />
                  <a className="btn btn-primary" href="http://localhost:5000/auth/facebook"><i className="fa fa-facebook"></i> Login with Facebook</a>
                </span>:
                <div></div>}
            </div> :
            <div>
              <EditButton
                user={this.props.user}
                updateState={this.props.updateState}
                dataObj={{}}
                title="Login Again"
              />
              <button className="button" onClick={this.logout}>
                Close
              </button>
            </div>
        }
      </div>
    );
  }
}


export default SubmitButtonSet;

// <button className="btn btn-primary" onClick={(e) => {
//   e.preventDefault();
//   this.props.getData("/login/facebook");
// }}>Facebook</button>
