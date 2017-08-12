import React from 'react';
import PropTypes from 'prop-types';

// import EditButton from '../buttons/EditButton';


const LocalGuide = (props) => {

  return (
    <div>

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
