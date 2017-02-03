import React from 'react';
import capitalize from 'lodash/capitalize';
import styles from './child.css';

/* eslint-disable */

export default class Child extends React.Component {
  static initState(location, store, opts = {}) {
    return new Promise((res) => {
      setTimeout(() => {
        res();
      }, 1000);
    });
  }

  render() {
    return <h1 className={styles.bg}>Hellloooo {capitalize(this.props.route.path)}</h1>;
  }
}
