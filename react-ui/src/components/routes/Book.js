import React from 'react';
import PropTypes from 'prop-types';

// import EditButton from '../buttons/EditButton';


const Book = (props) => {

  return (
    <div>

      <div className="content">
        Book
      </div>

    </div>
  );
}

export default Book;

Book.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
