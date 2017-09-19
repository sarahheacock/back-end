import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

import EditButton from './EditButton';

const getClass = (cat) => {
  const path = window.location.pathname;
  //cat[i] equal path and cat[i + 1] has to be treu;
  const keys = Object.keys(cat);
  const active = keys.reduce((a, b) => {
    if(a === true) return a;
    if(path.includes(a.toLowerCase().replace(" ", "-")) && cat[b]) return true;
    return b;
  }, "hjkl");

  return (active === true || path.includes("confirm")) ? "linkButton orangeButton" : "linkButton orangeButton old";
};

const ContinueButton = (props) => {
  const keys = Object.keys(props.categories);

  return(
    <div className="text-center">
      <br />
      <NavLink to={`/book/${keys[keys.length - 1].toLowerCase().replace(' ', '-')}`}>
      {(window.location.pathname.includes("confirm")) ?
        <EditButton
          user={props.user}
          dataObj={{}}
          updateState={props.updateState}
          title="Confirm Reservation"
        /> :
        <button className={getClass(props.categories)}>
          Continue <i className="fa fa-hand-o-right" aria-hidden="true"></i>
        </button>
      }
      </NavLink>
    </div>
  );
};

export default ContinueButton;

ContinueButton.propTypes = {
  categories: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
