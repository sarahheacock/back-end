import * as AdminActionTypes from '../actiontypes/admin';
import axios from 'axios';

import {  } from '../../../data/data';

export const updateState = (newState) => {
  return {
    type: AdminActionTypes.UPDATE_STATE,
    newState
  }
}

export const getData = (url) => {
  return (dispatch) => {

    return axios.get(url)
      .then(response => {
        console.log("response", response.data);
        dispatch(updateState(response.data));

      })
      .catch(error => {
        console.log("error", error);
        dispatch(updateState({ message: error.message }));
      });
  }
};

export const putData = (url, newData) => {

  return (dispatch) => {

    return axios.put(url, newData)
    .then(response => {
      console.log("response", response.data);
      dispatch(updateState(response.data));

    })
    .catch(error => {
      console.log("error", error);
      dispatch(updateState({ message: error.message }));
    });
  }
};


export const postData = (url, newData) => {
  return (dispatch) => {

    return axios.post(url, newData)
      .then(response => {
        console.log("response", response.data);
        dispatch(updateState(response.data));

      })
      .catch(error => {
        console.log("error", error);
        dispatch(updateState({ message: error.message }));
      });
  }
};


export const deleteData = (url) => {
  return (dispatch) => {

    return axios.delete(url)
    .then(response => {
      console.log("response", response.data);
      dispatch(updateState(response.data));

    })
    .catch(error => {
      console.log("error", error);
      dispatch(updateState({ message: error.message }));
    });
  }
};
