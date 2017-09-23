import React from 'react';
import PropTypes from 'prop-types';
import { PageHeader } from 'react-bootstrap';

import Home from './routes/Home';
import Gallery from './routes/Gallery';
import LocalGuide from './routes/LocalGuide';
// import Book from './routes/Book';
import Room from './routes/Room';
// import WelcomeAdmin from './routes/WelcomeAdmin';
// import EditButton from './buttons/EditButton';

const title = (s) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
};

const Routes = (props) => {

  const section = ((props.section === "home") ?
    <Home data={props.data} user={props.user} updateState={props.updateState}/> :
    ((props.section === "gallery") ?
      <Gallery data={props.data} user={props.user} updateState={props.updateState}/> :
      ((props.section === "guide") ?
        <LocalGuide data={props.data} user={props.user} updateState={props.updateState}/> :
        ((props.section === "gallery/:room") ?
          <Room data={(Object.keys(props.data).length > 0) ? props.data.rooms : {} } user={props.user} updateState={props.updateState}/> :
          <div></div>))))

  return (
    <div>
      <div className="tool-bar">{(props.section === "home" || props.section === "gallery/:room") ? <div></div> : <PageHeader><span className="header-text">{title(props.section)}<hr /></span></PageHeader>}</div>
      <div className={(props.section === "home" || props.section === "gallery/:room") ? "" : "main-content"}>
        <div>{(Object.keys(props.data).length > 0) ? section : '' }</div>
      </div>
    </div>
  );
};

export default Routes;

Routes.propTypes = {
  section: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,

  updateState: PropTypes.func.isRequired,
  // getData: PropTypes.func.isRequired
};

// (Object.keys(props.data).length > 0)?
//   <div>{section}</div>:
//   <div></div>
