import React from 'react';
import ReactDOM from 'react-dom';
import App from './container/App';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'


import AdminReducer from './reducers/admin';
import 'react-dates/lib/css/_datepicker.css';
import './stylesheets/index.css';
import './stylesheets/buttons.css';


import { initial } from '../../data/data';
//=============================================================\

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify({user: state.user});
    localStorage.setItem('bb', serializedState);
  }
  catch(err){

  }
};

const initialState = (localStorage.bb !== undefined) ? JSON.parse(localStorage.bb) : {user: initial.user};

const store = createStore(
  AdminReducer, {...initial, ...initialState}, applyMiddleware(thunk)
);

store.subscribe(() => { saveState(store.getState()); });


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
