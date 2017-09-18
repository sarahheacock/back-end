import React from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';
import EditButton from '../../buttons/EditButton.js';
import { initial } from '../../../../../data/data';

const cap = (s) => {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
}

const pretty = (info, cat) => {
  if(!info.includes('/')) return [info];
  if(cat === "billing"){
    if(info.includes('///')) return [`${cap(cat)} not provided yet.`];

    return info.split('/').reduce((a, b) => {
      let input = b;
      //if(b === '') return a;

      if(b === "true") input = "*Send me reservation confirmation through text message.";
      if(b === "false") "*Do NOT send me reservation confirmation through text message.";

      if(input.includes("*") || input.includes("+") || a.length < 3) a.push(input);
      else if(!isNaN(a[a.length - 1].slice(-1)) || !isNaN(b.charAt(0))) a[a.length - 1] = a[a.length - 1] + " " + b;
      else a[a.length - 1] = a[a.length - 1] + ", " + b;

      return a;
    }, []);
  }
  else if(cat === "credit"){
    if(info.includes('//')) return [`${cap(cat)} not provided yet.`];
    return info.split('/').slice(0, -1).reduce((a, b) => {
      const num = parseInt(b);
      if(num >= Math.pow(10, 13)) a.push(`xxxx xxxx xxxx ${b.slice(-4)}`);
      else if(a.length === 3) a[2] = a[2] + " - " + b;
      else a.push(b);

      return a;
    }, []);
  }
}

const PersonalInfo = (props) => {
  return(
    <Row className="clear-fix">
      <Col sm={2} className="text-center">
        <h4><b>{`${cap(props.category)}: `}</b></h4>
      </Col>
      <Col sm={8}>
        {pretty(props.user[props.category], props.category).map((c, i) => (
          <h4 key={`${props.category}info${i}`} className='text-center'>{c}</h4>
        ))}
        <div className="text-center">
          <EditButton
            user={props.user}
            updateState={props.updateState}
            dataObj={props.user[props.category]}
            title={`Update ${cap(props.category)}`}
          />
        </div>
      </Col>
    </Row>
  );
}

export default PersonalInfo;

PersonalInfo.propTypes = {
  category: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  updateState: PropTypes.func.isRequired
}
