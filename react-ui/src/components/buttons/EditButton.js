import React from 'react';
import PropTypes from 'prop-types';
import { NavItem } from 'react-bootstrap';

//import { name } from '../../../../data/data';
const names = ["Send Reminder", "Check-In", "Charge Client", "Delete Reservation" ];

const modify = (string) => {
  if(string.includes(' ') && !string.includes('Confirm') && !string.includes('Sign Up')) return string.slice(0, string.indexOf(' ') + 1)
  else return string;
}
const getClass = (n, valid) => {
  let style = "";
  if(n.includes("Delete") || n.includes("Charge") ||  n.includes("Remove") ||  n.includes("Update") || n.includes("Cart")) style = "yellowButton";
  else if(n.includes("Edit") || n.includes("Check")  || n.includes("Confirm")  || n.includes("Sign Up")) style = "orangeButton";
  else style = "blueButton";

  if(n.includes("Confirm")) style += " linkButton smallLink";
  else if(n.includes("Logout") || n.includes("Sign Up")) style += " buttonLarge"
  else style += " button";

  if(names.includes(n) && !valid){
    style += " old";
  }
  return style;
}

const getIcon = (n) => {
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

const EditButton = (props) => {
  //hide buttons that should only be used by admin
  const adminAuth = (props.title.includes("Edit") || props.title.includes("Add") || props.title.includes("Delete")) && !props.title.includes("Cart");
  const valid = (Array.isArray(props.dataObj)) ? props.dataObj.length > 0 : true;

  const button = (!props.user.admin && adminAuth) ?
    <div></div> :
    ((props.title === "Send Message") ?
      <a href="#" onClick={(e) => { if(e) e.preventDefault(); props.updateState({dataObj: props.dataObj, title: props.title}); }}>
        <i className="fa fa-envelope env" aria-hidden="true"></i>
      </a> :
      ((props.title === "Login") ?
        <NavItem onClick={(e) => { if(e) e.preventDefault(); props.updateState({dataObj: props.dataObj, title: props.title}); }} ><span className="login">{modify(props.title)} <i className={getIcon(props.title)} aria-hidden="true"></i></span></NavItem> :
        <button className={getClass(props.title, valid)} onClick={(e) => { if(e) e.preventDefault(); if(valid) props.updateState({dataObj: props.dataObj, title: props.title}); }}>
          {modify(props.title)}<i className={getIcon(props.title)} aria-hidden="true"></i>
        </button>))

  return ( button );
}


export default EditButton;

//DATAOBJ
//string is used to editing user info
//array is for admin editing multiple reservations
//object is for everything else
EditButton.propTypes = {
  user: PropTypes.object.isRequired,
  dataObj: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array
  ]).isRequired,
  updateState: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
};
