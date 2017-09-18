import React from 'react';
import PropTypes from 'prop-types';
import { NavItem } from 'react-bootstrap';

//import { name } from '../../../../data/data';

const modify = (string) => {
  if(string.includes(' ') && !string.includes('Update')) return string.slice(0, string.indexOf(' ') + 1)
  else return string;
}
const getClass = (n) => {
  let style = "";
  if(n.includes("Edit") || n.includes("Check") ||  n.includes("Update")) style = "orangeButton";
  else if(n.includes("Add") || n.includes("Login") || n.includes("Send")) style = "blueButton";
  else if(n.includes("Delete") || n.includes("Charge") ||  n.includes("Remove")) style = "yellowButton";

  if(n === "Login" || n.includes("Sign Up")) style += " button"
  else style += " linkButton smallLink"
  return style;
}

const getIcon = (n) => {
  if(n.includes("Send")) return "fa fa-paper-plane";
  if(n.includes("Delete")) return "fa fa-trash";
  return "";
}

const EditButton = (props) => {
  //hide buttons that should only be used by admin
  const adminAuth = props.title.includes("Edit") || props.title.includes("Add") || props.title.includes("Delete");

  const button = (!props.user.admin && adminAuth) ?
    <div></div> :
    ((props.title === "Send Message") ?
      <a href="#" onClick={(e) => { if(e) e.preventDefault(); props.updateState({dataObj: props.dataObj, title: props.title}); }}>
        <i className="fa fa-envelope env" aria-hidden="true"></i>
      </a> :
      ((props.title === "Login") ?
        <NavItem onClick={(e) => { if(e) e.preventDefault(); props.updateState({dataObj: props.dataObj, title: props.title}); }} ><span className="login">{modify(props.title)}</span></NavItem> :
        <button className={getClass(props.title)} onClick={(e) => { if(e) e.preventDefault(); props.updateState({dataObj: props.dataObj, title: props.title}); }}>
          {modify(props.title)}<i className={getIcon(props.title)} aria-hidden="true"></i>
        </button>))

  return ( button );
}


export default EditButton;

EditButton.propTypes = {
  user: PropTypes.object.isRequired,
  dataObj: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  updateState: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
};
