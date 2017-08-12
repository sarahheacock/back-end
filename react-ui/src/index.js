import React from 'react';
import ReactDOM from 'react-dom';
import App from './container/App';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'


import AdminReducer from './reducers/admin';
import './stylesheets/index.css';
import './stylesheets/buttons.css';

import {initialUser, initialEdit, initialMessage, links } from '../../data/data';
//=============================================================\
let initialData = {};
links.splice(-1, 1).forEach((d) => initialData[d] = {});

const initialState = {
  edit: initialEdit,
  message: initialMessage,
  user: initialUser,
  data: initialData
}


const saveState = (state) => {
  try {
    const serializedState = JSON.stringify({user: state.user});
    localStorage.setItem('bb', serializedState);
  }
  catch(err){

  }
};

const initial = (localStorage.bb !== undefined) ? JSON.parse(localStorage.bb) : {user: initialUser};

const store = createStore(
  AdminReducer, {...initialState, ...initial}, applyMiddleware(thunk)
);

store.subscribe(() => { saveState(store.getState()); });


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
