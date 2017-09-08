import React from 'react';
import PropTypes from 'prop-types';


const Select = (props) => {

  return (
    <div>

      <div className="content">
        Select
      </div>

    </div>
  );
}

export default Select;

Select.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
