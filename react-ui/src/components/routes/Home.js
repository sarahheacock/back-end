import React from 'react';
import PropTypes from 'prop-types';

// import EditButton from '../buttons/EditButton';


const Home = (props) => {

  return (
    <div>
      <div className="content">
        Home
      </div>
    </div>
  );
}

export default Home;

Home.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
