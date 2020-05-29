// @flow
import { LOCATION_CHANGE } from 'connected-react-router';
import { INCREMENT_COUNTER, DECREMENT_COUNTER } from '../actions/counter';
import type { Action } from './types';

export default function counter(state: number = 0, action: Action) {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return state + 1;
    case DECREMENT_COUNTER:
      return state - 1;
    case LOCATION_CHANGE:
      return action.payload.location.state &&
        action.payload.location.state.counter
        ? action.payload.location.state.counter
        : state;
    default:
      return state;
  }
}
