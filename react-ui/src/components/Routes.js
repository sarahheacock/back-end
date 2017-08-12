import React from 'react';
import PropTypes from 'prop-types';
import { PageHeader } from 'react-bootstrap';

import Home from './routes/Home';
import Gallery from './routes/Gallery';
import LocalGuide from './routes/LocalGuide';
import Book from './routes/Book';
// import EditButton from './buttons/EditButton';

const title = (s) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
};

const Routes = (props) => {

  //EditButton will make button invisible without token
  const editButton = <div></div>;

  const section = ((props.section === "home") ?
    <Home data={props.data} user={props.user} updateState={props.updateState}/> :
    ((props.section === "gallery") ?
      <Gallery data={props.data} user={props.user} updateState={props.updateState}/> :
      ((props.section === "local-guide") ?
        <LocalGuide data={props.data} user={props.user} updateState={props.updateState}/> :
        ((props.section === "book") ?
          <Book data={props.data} user={props.user} updateState={props.updateState}/> :
          <div></div>))))

  return (
    <div className="main-content">
      <PageHeader><span className="header-text">{title(props.section)}</span></PageHeader>
      <div>{section}</div>
      <div className="text-center">{editButton}</div>
    </div>
  );
};

export default Routes;

Routes.propTypes = {
  section: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,

  updateState: PropTypes.func.isRequired
};

// (Object.keys(props.data).length > 0)?
//   <div>{section}</div>:
//   <div></div>
