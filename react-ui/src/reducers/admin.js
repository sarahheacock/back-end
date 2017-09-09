import * as AdminActionTypes from '../actiontypes/admin';
import Edit from './Edit';

//==============================================================
//state={} is overwritten by initialState provided in index.js
export default function Admin(state={}, action){
  switch (action.type) {

    case AdminActionTypes.UPDATE_STATE: {

      if(Object.keys(action.newState).includes("dataObj")){
        let edit = new Edit(action.newState.title);
        edit.setDataObj(action.newState.dataObj);
        edit.setURL(state.user.token, action.newState.dataObj._id);

        return {...state, ...edit.getEdit()}
      }
      return {...state, ...action.newState};
    }

    default:
      return state;
  }
}
