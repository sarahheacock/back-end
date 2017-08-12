
import * as AdminActionTypes from '../actiontypes/admin';

//==============================================================
//state={} is overwritten by initialState provided in index.js
export default function Admin(state={}, action){
  switch (action.type) {

    case AdminActionTypes.UPDATE_STATE: {
      return {...state, ...action.newState};
    }

    default:
      return state;
  }
}
