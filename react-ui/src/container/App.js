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


//data
import { links } from '../../../data/data';


class App extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    message: PropTypes.string.isRequired,
    edit: PropTypes.object.isRequired
  }


  render(){
    const{ dispatch, user, data, message, edit } = this.props;
    //turns an object whose values are action creators (functions)
    //and wraps in dispatch (what causes state change)

    const updateState = bindActionCreators(AdminActionCreators.updateState, dispatch);
    const getData = bindActionCreators(AdminActionCreators.getData, dispatch);
    const putData = bindActionCreators(AdminActionCreators.putData, dispatch);
    const postData = bindActionCreators(AdminActionCreators.postData, dispatch);
    const deleteData = bindActionCreators(AdminActionCreators.deleteData, dispatch);


    console.log("");
    console.log("user", user);
    console.log("data", data);
    console.log("message", message);
    console.log("edit", edit);

    const routes = (links).map((k) => {
      if(k === "home"){
        return (
          <Route key={`route${k}`} exact path="/" render={ () => (
            <Routes
              section={k}
              data={data[k]}
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
              data={data[k]}
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
            <Route render={ () => (
              <Redirect to="/" />
            )} />
          </Switch>

          <Footer
            edit={edit}
            user={user}
            message={message}

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
    data: state.data,
    message: state.message,
    edit: state.edit
  }
);


export default connect(mapStateToProps)(App);
