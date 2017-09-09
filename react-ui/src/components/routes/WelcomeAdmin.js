import React from 'react';
import PropTypes from 'prop-types';

import 'react-big-calendar/lib/css/react-big-calendar.css'
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

import { blogID } from '../../../../data/data';
BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
); // or globalizeLocalizer

// class WelcomeAdmin extends React.Component {
//   static propTypes = {
//     user: PropTypes.object.isRequired,
//     data: PropTypes.array.isRequired,
//     getData: PropTypes.func.isRequired,
//     updateState: PropTypes.func.isRequired,
//   }
//
//   constructor(props){
//     console.log("hello");
//     super(props);
//     BigCalendar.setLocalizer(
//       BigCalendar.momentLocalizer(moment)
//     ); // or globalizeLocalizer
//
//     const date = new Date();
//     const month = (date.getMonth() + 1).toString();
//     const year = date.getFullYear().toString();
//
//     this.state = {
//       month: month,
//       year: year
//     };
//   }
//
//   // componentDidUpdate(){
//   //   BigCalendar.setLocalizer(
//   //     BigCalendar.momentLocalizer(moment)
//   //   ); // or globalizeLocalizer
//   // }
//
//   logout = (e) => {
//     this.props.getData('/auth/logout');
//   }
//
//   navigate = (date) => {
//     console.log(date);
//     const month = (date.getMonth() + 1).toString();
//     const year = date.getFullYear().toString();
//     const url = `/res/page/${blogID}/${month}/${year}?token=${this.props.user.token}`;
//     // this.props.getData(url);
//     this.props.updateState({message: "hi"})
//     // this.state.month = date.getMonth();
//     // this.setState(this.state, () => this.props.getData(`/api/admin/${this.props.admin.user}/${this.state.month}?token=${this.props.admin.id}`));
//   }
//
//   handleSelect = (event) => {
//     // this.props.updateState({
//     //   edit: {
//     //     ...initialEdit,
//     //     modalTitle: "Upcoming Stay",
//     //     length: 2,
//     //     pageSection: "welcome",
//     //     dataObj: event
//     //   }
//     // })
//
//   }

  const WelcomeAdmin = (props) => {
    // const date = new Date();
    // const end = new Date("Sept 8, 2017");
    // const myEvents = [];

    return(
      <div>
        <div className="text-center">
          <button className="button blueButton" onClick={(e) => {}}>Logout</button>
        </div>
        <div className="content">
          <BigCalendar
            events={props.data}
            style={{height: "600px"}}
            onNavigate={(date) => {
              const month = (date.getMonth() + 1).toString();
              const year = date.getFullYear().toString();
              const url = `/res/page/${blogID}/${month}/${year}?token=${props.user.token}`;
              props.getData(url);
            }}
            onSelectEvent={() => {}}
          />
        </div>
      </div>);
  }
// }

export default WelcomeAdmin;

WelcomeAdmin.propTypes = {
  user: PropTypes.object.isRequired,
  getData: PropTypes.func.isRequired,
  updateState: PropTypes.func.isRequired
};
