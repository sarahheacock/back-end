import React from 'react';
import PropTypes from 'prop-types';

import Guide from './Guide';

import { Route, Redirect } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';


const link = (cat) => {
  return "/guide/" + cat.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s/g, "-");
}

const LocalGuide = (props) => {
  //get categories
  const categories = props.data.guide.reduce((a, b) => {
    if(!a.includes(b.category)) return a.concat([b.category]);
    else return a;
  }, []);

  const routes = categories.map((cat, i) => (
    <Route key={`guideRoute${i}`} path={link(cat)} render={ () =>
      <Guide
        data={props.data.guide.filter((g) => { return g.category === cat; })}
      /> }
    />
  ));

  const tabs = categories.map((cat, i) => (
    <NavLink to={link(cat)} key={`guideTab${i}`}>
      <button className={(window.location.pathname.includes(link(cat))) ? "linkButton blueButtonActive": "linkButton blueButton"}>{cat}</button>
    </NavLink>
  ));

  return (
    <div>
      <div className="text-center">
        <h3 className="pretty">{props.data.title}</h3>
        <p><b className="paragraph">{props.data.b}</b></p>
        <p className="paragraph">{props.data.p1}</p>
      </div>

      <Row className="clear-fix">
        <Col sm={4} className="columns">
          <div className="text-center">{tabs}</div>
        </Col>
        <Col sm={8} className="columns">
          <Route exact path="/guide/" render={ () =>
            <Redirect to={link(categories[0])} /> }
          />
          {routes}
        </Col>
      </Row>

    </div>
  );
}

export default LocalGuide;

LocalGuide.propsTypes = {
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
