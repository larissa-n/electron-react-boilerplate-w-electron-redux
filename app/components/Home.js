// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.css';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Home</h2>
        <Link
          to={{
            pathname: '/counter',
            state: { counter: 500 }
          }}
        >
          to Counter
        </Link>
      </div>
    );
  }
}
