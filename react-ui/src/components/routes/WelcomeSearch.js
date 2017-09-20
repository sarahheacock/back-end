import React from 'react';
import PropTypes from 'prop-types';

import { PageHeader } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

import { blogID, initial } from '../../../../data/data';


class WelcomeSearch extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    postData: PropTypes.func.isRequired,
    getData: PropTypes.func.isRequired,
    //updateState: PropTypes.func.isRequired,
  }

  constructor(props){
    super(props);
    this.state = {
      name: ''
    };
  }

  // navigate = (e) => {
  //   window.location.pathname = `/welcome/${e.target.value}`
  // }

  logout = (e) => {
    this.props.getData('/auth/logout');
  }

  handleChange = (e) => {
    this.state.name = e.target.value;
    this.setState(this.state, () => {
      if(this.state.name.length >= 3){
        this.props.postData(`/user/${blogID}?token=${this.props.user.token}`, {
          find: this.state.name
        });
      }
    });
  }

  render(){
    const result = (this.state.name.length > 3) ?
      this.props.data.map((d, i) => (
        <a href={`/welcome/${d._id}`} key={`result${i}`}>
          <div className="result text-center">
            <h4><b>{d.name}</b></h4>
            <h4>{d.email}</h4>
          </div>
        </a>
      )):
      <div></div>

    return(
      <div className="main-content">
        <PageHeader><span className="header-text">{`Welcome, ${this.props.user.name || this.props.user.email.slice(0, this.props.user.email.indexOf('@'))}!`}</span></PageHeader>
        <div className="text-center">
          <button className="linkButton blueButton" onClick={this.logout}>Logout</button>
          <NavLink to="/welcome">
            <button className="linkButton orangeButton">Go to Calendar <i className="fa fa-calendar-check-o" aria-hidden="true"></i></button>
          </NavLink>
        </div>
        <br />

        <Form className="search text-center">
          <FormGroup>
            <ControlLabel className=""><h4>{"Search for Client By Email or Name "}<i className="fa fa-search" aria-hidden="true"></i></h4></ControlLabel>
            <FormControl
              type="text"
              value={this.state.name}
              placeholder="Enter text"
              onChange={this.handleChange}
            />
          </FormGroup>
        </Form>

        {result}
      </div>);
  }
}

export default WelcomeSearch;
