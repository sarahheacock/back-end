import React from 'react';
import PropTypes from 'prop-types';


const Bill = (props) => {

  return (
    <div>

      <div className="content">
        Bill
      </div>

    </div>
  );
}

export default Bill;

Bill.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
