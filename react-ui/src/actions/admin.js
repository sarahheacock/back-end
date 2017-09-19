import * as AdminActionTypes from '../actiontypes/admin';
import axios from 'axios';

import {  } from '../../../data/data';

export const updateState = (newState) => {
  return {
    type: AdminActionTypes.UPDATE_STATE,
    newState
  }
}

export const uploadFile = (newData, file) => {

  console.log("file", file);

  return (dispatch) => {
    axios.post(newData.url, file)
      .then(response => {
        // if(response.data.success === false) dispatch(updateState({ message: errorStatus.expError }));

        console.log(response.data);
        if(Array.isArray(newData.edit.dataObj[newData.name]))newData.edit.dataObj[newData.name].push(response.data.public_id);
        newData.edit.dataObj["image"] = response.data.public_id;

        dispatch(updateState({ edit: newData.edit, message: '' }));
      })
      .catch(error => {
        console.log("err", error);
        dispatch(updateState({ message: "Unable to upload image" }))
      });
  };
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
        //if(url.includes(`/res/available/user/${response.data.user._id}`)) window.location.pathname = "/book/confirm";
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
