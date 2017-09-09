import React from 'react';
import PropTypes from 'prop-types';

import BigCalendar from 'react-big-calendar';
import moment from 'moment';

// Setup the localizer by providing the moment (or globalize) Object
// to the correct localizer.
BigCalendar.momentLocalizer(moment); // or globalizeLocalizer

const Calendar = (props) => (
  <div>
    <BigCalendar
      
    />
  </div>
);

export default Calendar;
