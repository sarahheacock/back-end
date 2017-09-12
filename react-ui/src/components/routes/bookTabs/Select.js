import React from 'react';
import PropTypes from 'prop-types';

import { cloudName } from '../../../../../data/data';
import { Row, Col } from 'react-bootstrap';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';

import moment from 'moment';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';


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
    console.log(startDate, endDate);
    const start = (startDate !== null) ? new Date(startDate._d).setUTCHours(12, 0, 0, 0) : this.props.data.reservation.start;
    const end = (endDate !== null) ? new Date(endDate._d).setUTCHours(11, 59, 0, 0) : this.props.data.reservation.end;

    // if(endDate !== null && startDate !== null){
      console.log("get");
      this.props.getData(`/res/available/${start.toString()}/${end.toString()}/${this.props.data.reservation.guests.toString()}`);
    // }
    // else {
    //   console.log("update");
    //   this.props.updateState({
    //     book: {
    //       ...this.props.data,
    //       reservation: {
    //         ...this.props.data.reservation,
    //         start: start,
    //         end: end
    //       }
    //     }
    //   });
    // }
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

    const start = moment(this.props.data.reservation.start);
    const end = moment(this.props.data.reservation.end);

    return (
      <div className="text-center">
        <h4 className="content">{start.format('MMMM Do YYYY')} <i className="fa fa-arrow-right" aria-hidden="true"></i> {end.format('MMMM Do YYYY')}</h4>
        <div className="date-picker">
          <DayPickerRangeController
            onDatesChange={this.onDatesChange}
            onFocusChange={this.onFocusChange}
            focusedInput={focusedInput}
            startDate={start}
            endDate={end}
          />
        </div>

        {gallery}
      </div>
    );
  }
}


export default Select;
