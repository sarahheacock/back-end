import React from 'react';
import PropTypes from 'prop-types';

// import EditButton from '../buttons/EditButton';


const LocalGuide = (props) => {

  return (
    <div>
      <h3 className="pretty">{props.data.title}</h3>
      <p><b className="paragraph">{props.data.b}</b></p>
      <p className="paragraph">{props.data.p1}</p>
      <div className="content">
        LocalGuide
      </div>

    </div>
  );
}

export default LocalGuide;

LocalGuide.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
