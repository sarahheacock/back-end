import React from 'react';
import PropTypes from 'prop-types';
import { NavItem } from 'react-bootstrap';

import { loginData, initialEdit, signUpData } from '../../../../data/data';


const newDataObj = (formData, dataObj) => {
  let data = {};
  Object.keys(formData).forEach((k) => data[k] = formData[k]["default"]);
  return data;
};


const newEdit = (title, dataObj) => {
  if(title.includes("Login")){
    return {
      message: "",
      edit: {
        modalTitle: title,
        url: "/login",
        dataObj: newDataObj(loginData, dataObj)
      }
    }
  }
  else if(title.includes("Send Message")){
    return {
      message: "",
      edit: {
        modalTitle: title,
        url: "/sayHello",
        dataObj: newDataObj(loginData, dataObj)
      }
    }
  }
  else if(title.includes("Sign Up")){
    return {
      message: "",
      edit: {
        modalTitle: title,
        url: "/signUp",
        dataObj: newDataObj(signUpData, dataObj)
      }
    }
  }
  else {
    return {
      message: "",
      edit: initialEdit
    };
  }
};

const EditButton = (props) => {


  //=====STYLE OF BUTTON DEPENDING ON BUTTON TITLE====================================================
  const style = (props.title.includes("Edit")) ?
    "button orangeButton":
    ((props.title.includes("Add") || props.title.includes("Login")) ?
      "button blueButton":
      ((props.title.includes("Delete")) ?
        "button redButton":
        "button"));


  //=====DETERMINE NEXT AND MODAL-TITLE FROM PAGE-SECTION==========================================
  const adminAuth = props.title === "Add" || props.title === "Edit" || props.title === "Delete";


  //====THE ACTUAL BUTTON=====================================================

  const content = newEdit(props.title, props.dataObj);
  console.log("content", content);


  //page editing buttons are hidden
  //if we are not updating edit, then navLink to next page
  //...otherwise wait
  const button = (!props.user.token && adminAuth) ?
    <div></div> :
    ((content.edit.modalTitle === "Send Message") ?
      <a href="#" onClick={(e) => { if(e) e.preventDefault(); props.updateState(content); }}>
        <i className="fa fa-envelope env" aria-hidden="true"></i>
      </a> :
      ((content.edit.modalTitle.includes("Login")) ?
        <NavItem onClick={(e) => { if(e) e.preventDefault(); props.updateState(content); }} ><span className="login">{content.edit.modalTitle}</span></NavItem> :
        <button className={style} onClick={(e) => { if(e) e.preventDefault(); props.updateState(content); }}>
          {props.title}
        </button>)
      )

  return ( button );
}


export default EditButton;

EditButton.propTypes = {
  user: PropTypes.object.isRequired,
  dataObj: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
};
