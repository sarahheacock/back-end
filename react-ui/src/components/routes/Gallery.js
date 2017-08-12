import React from 'react';
import PropTypes from 'prop-types';

// import EditButton from '../buttons/EditButton';


const Gallery = (props) => {

  return (
    <div>

      <div className="content">
        Gallery
      </div>

    </div>
  );
}

export default Gallery;

Gallery.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
