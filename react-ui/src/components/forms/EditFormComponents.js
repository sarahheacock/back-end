import React from 'react';
import PropTypes from 'prop-types';
import { Image, CloudinaryContext, Transformation } from 'cloudinary-react';
import { Button, Row, Col, ControlLabel, FormGroup, FormControl, Checkbox } from 'react-bootstrap';
import { loginData, signUpData, addressData, paymentData, messageData, galleryData, localGuideData, editData, homeData, emailData, notRequired, messages, cloudName, signUpAdminData } from '../../../../data/data';

const hash = {
  "Login": loginData,
  "Login Again": loginData,
  "Sign Up": signUpData,
  "Send Message": messageData,
  "Edit Content": editData,
  "Add Room": galleryData,
  "Edit Room": galleryData,
  "Edit Guide": localGuideData,
  "Edit Home": homeData,
  "Add Guide": localGuideData,
  "Update Credit": paymentData,
  "Update Billing": addressData,
  "Update Email": emailData,
  "Submit": signUpAdminData,
  "Continue": signUpAdminData
};

const upper = (label) => {
  const required = notRequired.reduce((c, d) => { return c || label === d }, false);
  if(!required) return `${label.charAt(0).toUpperCase()}${label.slice(1)}*`;
  else return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
};

const Countries = ["United States", "Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegowina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia (Hrvatska)", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "France Metropolitan", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard and Mc Donald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao, People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia, The Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia (Slovak Republic)", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "Spain", "Sri Lanka", "St. Helena", "St. Pierre and Miquelon", "Sudan", "Suriname", "Svalbard and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe"];

const Months = ["Jan 01", "Feb 02", "Mar 03", "Apr 04",
	   			    "May 05", "Jun 06", "July 07", "Aug 08",
				    "Sep 09", "Oct 10", "Nov 11", "Dec 12"];
const Year = new Date().getFullYear();

const EditForm = (props) => {
  console.log(props);
  const formObj = hash[props.title];

  const check = (k) => {
    if(props.message === messages.inputError && !props.value){
      return 'warning';
    }
    if(props.message === messages.emailError && k === "email"){
      return 'warning';
    }
    if(props.message === messages.phoneError && k === "phone"){
      return 'warning';
    }
    return null;
  }

  const component = (!formObj[props.comp]) ?
    <div></div>:
    ((formObj[props.comp]["componentClass"] === 'checkbox') ?
      <Checkbox
        className="text-center"
        name={props.comp}
        checked={props.value}
        onChange={props.formChange}
      >
      </Checkbox>:

      ((props.comp === "carousel" || props.comp === "image") ?
          <Row className="clearfix">
            <Row className="clearfix">
              <Col sm={6} className="text-center">
                <CloudinaryContext cloudName={cloudName}>
                    <Image publicId={props.value}>
                        <Transformation width="200" crop="fill"/>
                    </Image>
                </CloudinaryContext>
              </Col>
              <Col sm={2} className="text-center">
                {(props.comp === "carousel") ?
                <Button bsStyle="link" name={props.name} value="delete" onClick={props.formChange}>
                  Delete
                </Button>:
                <div></div>}
              </Col>
            </Row>
            <hr />
          </Row> :

          (formObj[props.comp]["componentClass"] === "select")?
          <FormControl
             name={props.comp}
             type={formObj[props.comp]["type"]}
             placeholder={formObj[props.comp]["placeholder"]}
             componentClass={formObj[props.comp]["componentClass"]}
             value={props.value}
             onChange={props.formChange}
           >
            {(props.comp === "country") ? Countries.map((n, i) => <option value={n} key={`country${i}`}>{n}</option>):
            (props.comp === "Expiration Year") ? [...new Array(4)].map((n, i) => <option value={Year + i} key={Year + i}>{Year + i}</option>):
            Months.map((n) => <option value={n} key={n}>{n}</option>)}
          </FormControl>:
          <FormControl
             name={props.comp}
             type={formObj[props.comp]["type"]}
             placeholder={formObj[props.comp]["placeholder"]}
             componentClass={formObj[props.comp]["componentClass"]}
             value={props.value}
             onChange={props.formChange}
           />
         ));
  const classComp = (formObj[props.comp]["componentClass"] === 'checkbox') ?
    "text-center" : "";

  return (
    <FormGroup className={classComp} validationState={check(props.comp)}>
      <ControlLabel>{upper(props.comp)}</ControlLabel>
      {component}
    </FormGroup>
  );
}


export default EditForm;

EditForm.propTypes = {
  comp: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  formChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
  // value: PropTypes.object.isRequired,
};
