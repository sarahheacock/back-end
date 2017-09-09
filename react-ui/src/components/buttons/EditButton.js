import React from 'react';
import PropTypes from 'prop-types';
import { NavItem } from 'react-bootstrap';

const modify = (string) => {
  if(string.includes(' ')) return string.slice(0, string.indexOf(' ') + 1)
  else return string;
}

const EditButton = (props) => {
  //determine style of edit button
  const style = (props.title.includes("Edit")) ?
    "button orangeButton":
    ((props.title.includes("Add") || props.title.includes("Login")) ?
      "button blueButton":
      ((props.title.includes("Delete")) ?
        "button yellowButton":
        "button"));

  //hide buttons that should only be used by admin
  const adminAuth = props.title.includes("Edit") || props.title.includes("Add") || props.title.includes("Delete");

  const button = (!props.user.token && adminAuth) ?
    <div></div> :
    ((props.title === "Send Message") ?
      <a href="#" onClick={(e) => { if(e) e.preventDefault(); props.updateState({dataObj: props.dataObj, title: props.title}); }}>
        <i className="fa fa-envelope env" aria-hidden="true"></i>
      </a> :
      ((props.title === "Login") ?
        <NavItem onClick={(e) => { if(e) e.preventDefault(); props.updateState({dataObj: props.dataObj, title: props.title}); }} ><span className="login">{modify(props.title)}</span></NavItem> :
        <button className={style} onClick={(e) => { if(e) e.preventDefault(); props.updateState({dataObj: props.dataObj, title: props.title}); }}>
          {modify(props.title)}
        </button>))

  return ( button );
}


export default EditButton;

EditButton.propTypes = {
  user: PropTypes.object.isRequired,
  dataObj: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
};
