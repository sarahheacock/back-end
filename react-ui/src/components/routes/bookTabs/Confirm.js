import React from 'react';
import PropTypes from 'prop-types';


const Confirm = (props) => {

  return (
    <div>

      <div className="content">
        Confirm
      </div>

    </div>
  );
}

export default Confirm;

Confirm.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
