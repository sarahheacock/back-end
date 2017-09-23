import React from 'react';
import PropTypes from 'prop-types';
// import { NavLink } from 'react-router-dom';

import EditButton from '../../buttons/EditButton.js';
import { cloudName, blogID } from '../../../../../data/data';
import { Row, Col, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';

import moment from 'moment';
import { DayPickerRangeController } from 'react-dates';


class Select extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
    getData: PropTypes.func.isRequired,
    putData: PropTypes.func.isRequired,
    postData: PropTypes.func.isRequired
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
    //this.props.getData(`/res/available/${this.props.data.reservation.start}/${this.props.data.reservation.end}/${this.props.data.reservation.guests}`)
    let url = "/res/available";

    if(this.props.user.token && this.props.user._id && !this.props.user.admin) url += `/user/${this.props.user._id}`;
    if(this.props.user.token && !this.props.user._id && this.props.user.admin) url += `/page/${blogID}`;
    if(this.props.user.token && this.props.user._id && this.props.user.admin) url += `/page/${blogID}/${this.props.user._id}`;

    url += `?token=${this.props.user.token}`;

    this.props.postData(url, this.props.data.reservation);

  }

  // componentDidUpdate(prevProps, prevState){
  //   if(this.props.user.cart.length > prevProps.user.cart.length) history.pushState(null, null, "/book/confirm");
  // }

  onDatesChange({ startDate, endDate }) {
    // this.setState({ startDate, endDate });
    let url = "/res/available";

    if(this.props.user.token && this.props.user._id && !this.props.user.admin) url += `/user/${this.props.user._id}`;
    if(this.props.user.token && !this.props.user._id && this.props.user.admin) url += `/page/${blogID}`;
    if(this.props.user.token && this.props.user._id && this.props.user.admin) url += `/page/${blogID}/${this.props.user._id}`;

    url += `?token=${this.props.user.token}`;

    const start = (startDate !== null) ? new Date(startDate._d).setUTCHours(12, 0, 0, 0) : this.props.data.reservation.start;
    const end = (endDate !== null) ? new Date(endDate._d).setUTCHours(11, 59, 0, 0) : this.props.data.reservation.end;

    this.props.postData(url, {
      ...this.props.data.reservation,
      start: start,
      end: end
    });
  }

  onFocusChange(focusedInput) {
    this.setState({
      // Force the focusedInput to always be truthy so that dates are always selectable
      focusedInput: !focusedInput ? 'startDate' : focusedInput,
    });
  }

  onGuestChange = (e) => {
    this.props.postData('/res/available/', {
      ...this.props.data.reservation,
      guests: e.target.value
    });
  }

  // onGetCartItem = (e) => {
  //   if(e) e.preventDefault();
  //   const value = JSON.parse(e.target.value);
  //   let url = "/res/available";
  //
  //   if(this.props.user.token && this.props.user._id && !this.props.user.admin) url += `/user/${this.props.user._id}`;
  //   if(this.props.user.token && !this.props.user._id && this.props.user.admin) url += `/page/${blogID}`;
  //   if(this.props.user.token && this.props.user._id && this.props.user.admin) url += `/page/${blogID}/${this.props.user._id}`;
  //
  //   url += `?token=${this.props.user.token}`;
  //
  //   this.props.postData(url, {
  //     start: this.props.data.reservation.start,
  //     end: this.props.data.reservation.end,
  //     guests: this.props.data.reservation.guests,
  //     roomID: value._id,
  //     cost: value.cost
  //   });
  // }


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
                      <Transformation width="200" crop="scale" radius="10"/>
                  </Image>
              </CloudinaryContext>
            </div>
          </Col>
          <Col sm={6} className="columns">
            <div className="text-center">
              <h3 className="pretty">{room.title}</h3>
              <h4 className="paragraph"><big>$</big>{`${room.cost}.`}<sup>00</sup><sub> total</sub></h4>
              <h4 className="paragraph">{room.available}<sub> room(s) left</sub></h4>
              <EditButton
                user={this.props.user}
                dataObj={{
                  start: this.props.data.reservation.start,
                  end: this.props.data.reservation.end,
                  guests: this.props.data.reservation.guests,
                  roomID: room._id,
                  cost: room.cost,
                  image: room.image,
                  title: room.title
                }}
                updateState={this.props.updateState}
                title="Add to Cart"
              />
            </div>
          </Col>
        </Row>
      </div>
    ));

    const start = moment(this.props.data.reservation.start);
    const end = moment(this.props.data.reservation.end);
    const empty = (this.props.data.available.length > 0) ? this.props.data.available[0]["cost"] > 0 : false;

    return (
      <div className="text-center">
        <h4 className="black">{start.format('MMMM Do YYYY')} <i className="fa fa-arrow-right" aria-hidden="true"></i> {end.format('MMMM Do YYYY')}</h4>
        <Row className="clear-fix content smoke">
          <Col sm={4} className="columns">
            <FormGroup controlId="formControlsSelectMultiple" className="guests">
              <ControlLabel>Number of Guests</ControlLabel>
              <FormControl componentClass="select" onChange={this.onGuestChange}>
                {[...new Array(6)].map((a, i) => (
                  <option value={i + 1} key={`guest${i + 1}`}>{i + 1}</option>
                ))}
              </FormControl>
            </FormGroup>
          </Col>
          <Col sm={6} className="columns">
            <FormGroup controlId="formControlsSelectMultiple" className="date-picker">
              <ControlLabel>Select Dates</ControlLabel>
              <DayPickerRangeController
                onDatesChange={this.onDatesChange}
                onFocusChange={this.onFocusChange}
                focusedInput={focusedInput}
                startDate={start}
                endDate={end}
              />
            </FormGroup>
          </Col>
        </Row>
        <hr />
        <div>{(empty) ? gallery : <h4>Oh darn! No rooms are available for these selected days.</h4>}</div>
      </div>
    );
  }
}


export default Select;
