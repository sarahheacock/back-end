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

  getClass = (n) => {
    let style = "";
    if(n.includes("Edit") || n.includes("Check") || n.includes("Update")) style = "orangeButton";
    else if(n.includes("Add") || n.includes("Login") || n.includes("Send")) style = "blueButton";
    else if(n.includes("Delete") || n.includes("Charge")) style = "yellowButton";

    if(n === "Login" || n.includes("Sign Up")) style += " button"
    else style += " linkButton smallLink"
    return style;
  }

  getIcon = (n) => {
    if(n.includes("Send")) return "fa fa-paper-plane";
    if(n.includes("Delete")) return "fa fa-trash";
    if(n.includes("Check")) return "fa fa-check";
    if(n.includes("Charge")) return "fa fa-usd";
    return "";
  }


  render(){
    const edit = this.props.edit;
    const style = this.getClass(edit.modalTitle);

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
                  <button className={this.getClass(n)}>
                    {n}<i className={this.getIcon(n)} aria-hidden="true"></i>
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
                {edit.modalTitle} <i className={this.getIcon(edit.modalTitle)} aria-hidden="true"></i>
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
