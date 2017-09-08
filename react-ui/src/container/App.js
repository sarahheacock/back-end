import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

//redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AdminActionCreators from '../actions/admin';

//components
import Routes from '../components/Routes';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Room from '../components/routes/Room';


//data
import { links } from '../../../data/data';


class App extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    home: PropTypes.object.isRequired,
    gallery: PropTypes.object.isRequired,
    guide: PropTypes.object.isRequired,
    book: PropTypes.object.isRequired,
    welcome: PropTypes.array.isRequired,
    message: PropTypes.string.isRequired,
    edit: PropTypes.object.isRequired
  }


  render(){
    const{ dispatch, user, home, gallery, guide, welcome, book, message, edit } = this.props;
    //turns an object whose values are action creators (functions)
    //and wraps in dispatch (what causes state change)

    const updateState = bindActionCreators(AdminActionCreators.updateState, dispatch);
    const getData = bindActionCreators(AdminActionCreators.getData, dispatch);
    const putData = bindActionCreators(AdminActionCreators.putData, dispatch);
    const postData = bindActionCreators(AdminActionCreators.postData, dispatch);
    const deleteData = bindActionCreators(AdminActionCreators.deleteData, dispatch);


    console.log("");
    console.log("user", user);
    console.log("home", home);
    console.log("gallery", gallery);
    console.log("guide", guide);
    console.log("book", book);
    console.log("welcome", welcome);
    console.log("message", message);
    console.log("edit", edit);
    console.log(window.location);

    const routes = ([...links, "welcome"]).map((k) => {
      if(k !== "guide" && k !== "book"){
        return (
          <Route key={`route${k}`} exact path={(k === "home") ? "/" : `/${k}`} render={ () => (
            <Routes
              section={k}
              data={this.props[k]}
              user={user}

              updateState={updateState}
            />) }
          />);
      }
      else {
        return (
          <Route key={`route${k}`} path={`/${k}`} render={ () => (
            <Routes
              section={k}
              data={this.props[k]}
              user={user}

              updateState={updateState}
            />) }
          />);
      }
    });



    return (
      <BrowserRouter>
        <div className="container-fluid">

          <Header
            user={user}
            links={links}

            getData={getData}
            updateState={updateState}
          />

          <Switch>
            {routes}
            <Route path="/gallery/:room" render={ (req) => (
              (gallery.rooms) ?
              <Room
                data={(gallery.rooms) ? gallery.rooms : {}}
                user={user}

                updateState={updateState}
              />:
              <div></div>
            )}
            />
            <Route render={ () => (
              <Redirect to="/" />
            )} />
          </Switch>

          <Footer
            edit={edit}
            user={user}
            message={message}

            getData={getData}
            putData={putData}
            postData={postData}
            deleteData={deleteData}
            updateState={updateState}
          />
        </div>

      </BrowserRouter>

    );
  }
}

const mapStateToProps = state => (
  {
    user: state.user,
    home: state.home,
    gallery: state.gallery,
    guide: state.guide,
    book: state.book,
    welcome: state.welcome,
    message: state.message,
    edit: state.edit
  }
);


export default connect(mapStateToProps)(App);
