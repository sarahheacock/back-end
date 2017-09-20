import React from 'react';
import PropTypes from 'prop-types';

import 'react-big-calendar/lib/css/react-big-calendar.css'
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

import { blogID, initial } from '../../../../data/data';
BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
); // or globalizeLocalizer

class WelcomeAdmin extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    getData: PropTypes.func.isRequired,
    updateState: PropTypes.func.isRequired,
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
    // "/page/:pageID/charge/:userID/:start"
    // "/page/:pageID/:task/:userID/:resID/"
    // this.props.updateState({
    //   edit: {
    //     ...initial.edit,
    //     url: `/res/page/${blogID}/reminder/${event._id}?token=${this.props.user.token}`,
    //     modalTitle: "Upcoming Stay",
    //     dataObj: event
    //   }
    // })
    console.log(event);
    window.location.pathname = `/welcome/${event.event.user}`
  }

  getClassName = (event) => {
    let style = "blueButton";

    //if(event.reminded) style = "blueButton";
    if(event.checkedIn) style = "orangeButton";
    if(event.charged) style = "yellowButton";

    const end = new Date(event.end).getTime();
    if(end < Date.now()) style += " old";

    return {className: style};
  }

  render(){

    return(
      <div>
        <div className="text-center">
          <button className="button blueButton" onClick={this.logout}>Logout</button>
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
      </div>);
  }
}

export default WelcomeAdmin;
