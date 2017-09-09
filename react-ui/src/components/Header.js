import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import EditButton from './buttons/EditButton';
import { blogID, initial } from '../../../data/data';

class Header extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    links: PropTypes.array.isRequired,
    getData: PropTypes.func.isRequired,
    updateState: PropTypes.func.isRequired,
  }

  componentDidMount(){
    if(window.location.hash.includes('register')){
      const arr = window.location.hash.split('/');
      const token = arr[1].replace('?token=', '');
      const id = arr[2].replace('?id=', '');

      window.location.hash = '';
      this.props.getData(`/user/${id}?token=${token}`);
    }
    this.props.getData(`/page/${blogID}`);

    const date = new Date();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    const url = `/res/page/${blogID}/${month}/${year}?token=${this.props.user.token}`;
    console.log("url", url);
    this.props.getData(url);
  }

  render(){

    const navItems = this.props.links.map((link, i) => {
      if(link === "home"){
        return (
          <LinkContainer key={link} exact to="/" >
            <NavItem>{link.toUpperCase()}</NavItem>
          </LinkContainer>
        );
      }
      else {
        return (
          <LinkContainer key={link} to={`/${link}`} >
            <NavItem>{link.toUpperCase()}</NavItem>
          </LinkContainer>
        );
      }
    });


    return (
        <Navbar className="navigation" id="navigation" inverse>
          <Navbar.Header>
            <Navbar.Brand>
              <div><i className="fa fa-coffee"></i><span className="brand">{" B&B"}</span></div>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>

          <Navbar.Collapse>
            <Nav className="ml-auto" navbar pullRight>
              {navItems}
              <LinkContainer to={(this.props.user.token) ? "/welcome": "#"}>
                {(!(!this.props.user.token))?
                  <NavItem>{this.props.user.name}</NavItem> :
                  <EditButton
                    user={this.props.user}
                    dataObj={{}}
                    updateState={this.props.updateState}
                    title="Login"
                    length={2}
                  />}
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
    );
  }
}

export default Header;
