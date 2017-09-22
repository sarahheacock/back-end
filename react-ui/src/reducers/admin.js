import * as AdminActionTypes from '../actiontypes/admin';
import Edit from './Edit';

//==============================================================
//state={} is overwritten by initialState provided in index.js
export default function Admin(state={}, action){
  switch (action.type) {

    case AdminActionTypes.UPDATE_STATE: {
      if(action.newState.message === "confirm" && !state.user.admin) window.location.pathname = "/welcome";
      if(action.newState.message === "confirm" && state.user.admin) window.location.pathname = `/welcome/${state.user._id}`;

      if(Object.keys(action.newState).includes("dataObj")){ //sent by EditButton
        let edit = new Edit(action.newState.title);
        edit.setDataObj(action.newState.dataObj);

        const id = (action.newState.dataObj._id) ? action.newState.dataObj._id: state.user._id
        edit.setURL(state.user.token, id, state.user.admin);

        return {...state, ...edit.getEdit()}
      }
      return {...state, ...action.newState};
    }

    default:
      return state;
  }
}
