import React from 'react';
import PropTypes from 'prop-types';
import { NavItem } from 'react-bootstrap';

import Edit from './Edit';


const EditButton = (props) => {
  const path = window.location.pathname;
  const location = path.split('/').filter((p) => { return p !== ''; });

  let edit = new Edit(props.title);
  edit.setDataObj(location, props.dataObj);
  edit.setURL(props.user.token, props.dataObj._id, location);


  //=====DETERMINE NEXT AND MODAL-TITLE FROM PAGE-SECTION==========================================
  const adminAuth = props.title.includes("Add") || props.title.includes("Edit") || props.title.includes("Delete");


//====THE ACTUAL BUTTON=====================================================
//page editing buttons are hidden
//if we are not updating edit, then navLink to next page
//...otherwise wait
const button = (!props.user.token && adminAuth) ?
  <div></div> :
  ((edit.modalTitle === "Send Message") ?
    <a href="#" onClick={(e) => { if(e) e.preventDefault(); props.updateState(edit.getEdit()); }}>
      <i className="fa fa-envelope env" aria-hidden="true"></i>
    </a> :
    ((edit.modalTitle.includes("Login")) ?
      <NavItem onClick={(e) => { if(e) e.preventDefault(); props.updateState(edit.getEdit()); }} ><span className="login">{edit.modalTitle}</span></NavItem> :
      <button className={edit.style} onClick={(e) => { if(e) e.preventDefault(); props.updateState(edit.getEdit()); }}>
        {props.title.slice(0, props.title.indexOf(' ') + 1)}
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
