import React from 'react';
import PropTypes from 'prop-types';


const Pay = (props) => {

  return (
    <div>

      <div className="content">
        Pay
      </div>

    </div>
  );
}

export default Pay;

Pay.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
