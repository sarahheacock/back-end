import React from 'react';
import PropTypes from 'prop-types';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';

import { cloudName } from '../../../../data/data';


const Home = (props) => {
  console.log("hello", props.data);

  return (
    <div>
      <header>
        <CloudinaryContext cloudName={cloudName} className="carousel-content">
            <Image publicId={props.data.image} className="carImg">
                <Transformation height="1000" width="2000" crop="fill"/>
            </Image>
        </CloudinaryContext>
      </header>
      <h1 className="headerText">{("b&b").toUpperCase()}
        <hr />
        Welcome Home
      </h1>

      <div className="home">
        <div className="content">
          <h3 className="pretty">{props.data.title}</h3>
          <p className="paragraph">{props.data.p1}</p>
        </div>
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
