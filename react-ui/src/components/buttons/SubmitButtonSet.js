import React from 'react';
import PropTypes from 'prop-types';
// const FBSDK = require('react-native-fbsdk');
// const {
//   LoginButton,
// } = FBSDK;

import { initial, messages } from '../../../../data/data';

import AlertMessage from './AlertMessage';
import EditButton from './EditButton';



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
      edit: initial.edit,
      message: initial.message
    });
  }

  submit = (e) => {
    e.preventDefault();
    const names = ["Delete Reservation", "Send Reminder", "Charge Client", "Check-In"];

    if(names.includes(this.props.edit.modalTitle)){
      const arr = this.props.edit.dataObj.reservations.map((r) => r._id.toString());
      console.log(this.props.edit.url, {reservations: arr});
      this.props.editData(this.props.edit.url, {reservations: arr});
    }
    else if(this.props.edit.modalTitle.includes("Delete")){
      this.props.editData(this.props.edit.url);
    }
    else {
      this.props.editData(this.props.edit.url, this.props.edit.dataObj);
    }
  }

  // editRes = (e) => {
  //   e.preventDefault();
  //   const edit = this.props.edit;
  //
  //   let url = edit.url; //send reminder
  //   if(e.target.name === names[1]) url.replace("reminder", "charge"); //charge client
  //   else if(e.target.name === names[2]) url.replace("reminder", "checkIn"); //check in
  //   console.log(url);
  //
  //   this.props.editData(url);
  // }

  getClass = (n) => {
    let style = "buttonLarge ";
    if(n.includes("Delete") || n.includes("Charge") ||  n.includes("Remove") ||  n.includes("Update") || n.includes("Cart")) style += "yellowButton";
    else if(n.includes("Edit") || n.includes("Check")  || n.includes("Confirm")) style += "orangeButton";
    else style += "blueButton";

    return style;
  }

  getIcon = (n) => {
    if(n.includes("Send")) return "fa fa-paper-plane";
    if(n.includes("Delete") || n.includes("Remove")) return "fa fa-trash";
    if(n.includes("Add to Cart")) return "fa fa-shopping-cart";
    if(n.includes("Confirm")) return "fa fa-flag-checkered";
    if(n.includes("Check")) return "fa fa-check";
    if(n.includes("Charge")) return "fa fa-usd";
    if(n.includes("Credit")) return "fa fa-credit-card";
    if(n.includes("Billing")) return "fa fa-address-card-o";
    if(n.includes("Email")) return "fa fa-envelope-o";
    if(n.includes("Edit")) return "fa fa-pencil";
    if(n.includes("Add")) return "fa fa-plus-circle";
    if(n.includes("Logout")) return "fa fa-sign-out";
    if(n.includes("Login")) return "fa fa-sign-in";
    if(n.includes("Sign Up")) return "fa fa-user-plus";
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
                  <a href="https://sarahbb.herokuapp.com/auth/facebook" className="btn btn-primary"><i className="fa fa-facebook"></i> Login with Facebook</a>
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
