import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
// import { NavLink } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import EditButton from './buttons/EditButton';
import { blogID } from '../../../data/data';

class Header extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    links: PropTypes.array.isRequired,
    getData: PropTypes.func.isRequired,
    updateState: PropTypes.func.isRequired,
  }

  componentDidMount(){
    if(window.location.hash.includes('register')){
      const obj = window.location.hash.split('/').reduce((a, b) => {
        if(b.includes('token')) a.token = b.replace('?token=', '');
        if(b.includes('?id=')) a.id = b.replace('?id=', '');
        return a;
      }, {});

      window.location.hash = '';
      const url = `/user/user/${obj.id}/?token=${obj.token}`;
      console.log(url)
      this.props.getData(url);
    }
    this.props.getData(`/page/${blogID}`);
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
        <Navbar className="navigation navbar-fixed-top" id="navigation" inverse>
          <Navbar.Header>
            <Navbar.Brand>
              <div><i className="fa fa-coffee"></i><span className="brand">{" B&B"}</span></div>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>

          <Navbar.Collapse>
            <Nav className="ml-auto" navbar>
              {navItems}
            </Nav>
            <Nav className="" navbar pullRight>
              <LinkContainer to={(this.props.user.token) ? ((this.props.user._id && this.props.user.admin) ? `/welcome/${this.props.user._id}` : "/welcome"): "#"}>
                {(!(!this.props.user.token))?
                  <NavItem>
                    <span className="shop sign-out">
                    {`${this.props.user.name || this.props.user.email.slice(0, this.props.user.email.indexOf('@'))} `}
                    {(this.props.user.admin && !this.props.user._id) ?
                      <span></span>:
                      <span><i className="fa fa-shopping-cart large-icon" aria-hidden="true"></i>
                      {this.props.user.cart.length}</span>
                    }
                    </span>
                  </NavItem> :
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
