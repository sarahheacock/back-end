import React from 'react';
import PropTypes from 'prop-types';

import { cloudName } from '../../../../../data/data';
import { Row, Col } from 'react-bootstrap';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';

import moment from 'moment';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';


class Select extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
    getData: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      focusedInput: props.autoFocusEndDate ? 'endDate' : 'startDate',
      // startDate: moment(props.data.reservation.start),
      // endDate: moment(props.data.reservation.end),
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  componentDidMount(){
    console.log("hi");
    this.props.getData(`/res/available/${this.props.data.reservation.start}/${this.props.data.reservation.end}/${this.props.data.reservation.guests}`)
  }

  onDatesChange({ startDate, endDate }) {
    // this.setState({ startDate, endDate });
    //ADD UPDATE STATE
    console.log(startDate, endDate);
    let start = this.props.data.reservation.start;
    let end = this.props.data.reservation.end;
    if(startDate !== null) start = new Date(startDate._d).setUTCHours(12, 0, 0, 0).toString();
    if(endDate !== null) end = new Date(endDate._d).setUTCHours(11, 59, 0, 0).toString();
    console.log(start, end);
    this.props.getData(`/res/available/${start}/${end}/${this.props.data.reservation.guests}`);
  }

  onFocusChange(focusedInput) {
    this.setState({
      // Force the focusedInput to always be truthy so that dates are always selectable
      focusedInput: !focusedInput ? 'startDate' : focusedInput,
    });
  }

  render() {
    const { focusedInput } = this.state;

    // const startDateString = startDate && startDate.format('YYYY-MM-DD');
    // const endDateString = endDate && endDate.format('YYYY-MM-DD');

    const gallery = this.props.data.available.map((room, i) => (
      <div className="content" key={room._id}>
        <Row className="clear-fix">
          <Col sm={6} className="columns">
            <div className="text-center">
              <CloudinaryContext cloudName={cloudName}>
                  <Image publicId={room.image} className="projectPic" >
                      <Transformation width="250" crop="scale" radius="10"/>
                  </Image>
              </CloudinaryContext>
            </div>
          </Col>
          <Col sm={6} className="columns">
            <div className="text-center">
              <h3 className="pretty">{room.title}</h3>
              <h4 className="paragraph"><big>$</big>{`${room.cost}.`}<sup>00</sup><sub> per night</sub></h4>
              <h4 className="paragraph">{room.available}<sub> room(s) left</sub></h4>
            </div>
          </Col>
        </Row>
      </div>
    ));

    return (
      <div>

        <DayPickerRangeController
          onDatesChange={this.onDatesChange}
          onFocusChange={this.onFocusChange}
          focusedInput={focusedInput}
          startDate={moment(this.props.data.reservation.start)}
          endDate={moment(this.props.data.reservation.end)}
        />

        {gallery}
      </div>
    );
  }
}


export default Select;

// import React from 'react';
// import PropTypes from 'prop-types';
//

// import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';
// import moment from 'moment';
// import 'react-dates/lib/css/_datepicker.css';
//
// class Select extends React.Component {

//
//   constructor(props){
//     super(props);
//
//     this.state = {
//       focusedInput: 'startDate'
//     };
//   }
//

//
//   dateChange = (e) => {

//     //
//   }
//
//   focusChange = (e) => {
//     console.log(e);
//     const focus = (e === 'startDate') ? 'endDate'' : 'startDate';
//     this.setState({ focusedInput: e });
//   }
//
//   render(){

//
//     console.log(this.state);
//     const start = moment(new Date(this.props.data.reservation.start));
//     const end = moment(new Date(this.props.data.reservation.end));
//
//     return(
//       <div>
//         <div className="text-center">
//           <DayPickerRangeController
//             numberOfMonths={1}
//             startDate={moment(new Date(this.props.data.reservation.start))}
//             endDate={moment(new Date(this.props.data.reservation.end))}
//             onDatesChange={this.dateChange}
//             onFocusChange={this.focusChange}
//           />
//         </div>
//
//       </div>
//     );
//   }
// }
//
// export default Select;
