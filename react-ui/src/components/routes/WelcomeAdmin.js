import React from 'react';
import PropTypes from 'prop-types';

import { PageHeader } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import 'react-big-calendar/lib/css/react-big-calendar.css'
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

import { blogID } from '../../../../data/data';

BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
); // or globalizeLocalizer

class WelcomeAdmin extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired
  }

  constructor(props){
    super(props);
    BigCalendar.setLocalizer(
      BigCalendar.momentLocalizer(moment)
    ); // or globalizeLocalizer
  }

  componentDidMount(){
    const date = new Date();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    const url = `/res/page/${blogID}/${month}/${year}?token=${this.props.user.token}`;
    this.props.getData(url);
  }

  logout = (e) => {
    this.props.getData('/auth/logout');
  }

  navigate = (date) => {
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    const url = `/res/page/${blogID}/${month}/${year}?token=${this.props.user.token}`;

    this.props.getData(url);
  }

  handleSelect = (event) => {
    console.log(event);
    window.location.pathname = `/welcome/${event.event.user}`
  }

  getClassName = (event) => {
    let style = "blueButton";

    //if(event.reminded) style = "blueButton";
    if(event.checkedIn || event.charged) style = "orangeButton";
    if(event.reminded) style = "yellowButton";

    const end = new Date(event.end).getTime();
    if(end < Date.now()) style += " old";

    return {className: style};
  }

  render(){

    return(
      <div>
      <PageHeader><span className="header-text">{`Welcome, ${this.props.user.name || this.props.user.email.slice(0, this.props.user.email.indexOf('@'))}!`}<hr /></span></PageHeader>
      <div className="main-content">

        <div className="text-center">
          <br />
          <button className="buttonLarge blueButton" onClick={this.logout}>Logout <i className="fa fa-sign-out" aria-hidden="true"></i></button>
          <NavLink to="/welcome/search">
            <button className="buttonLarge orangeButton">Search for Client <i className="fa fa-search" aria-hidden="true"></i></button>
          </NavLink>
        </div>

        <div className="search text-center">
          <h4><i className="fa fa-circle yellow" aria-hidden="true"></i>  Sent Reminder Message</h4>
          <h4><i className="fa fa-circle orange" aria-hidden="true"></i>  Charged or Checked-In</h4>
        </div>

        <div className="content">
          <BigCalendar
            events={this.props.data}
            eventPropGetter={this.getClassName}
            style={{height: "600px"}}
            onNavigate={this.navigate}
            onSelectEvent={this.handleSelect}

          />
        </div>
      </div>
      </div>);
  }
}

export default WelcomeAdmin;
