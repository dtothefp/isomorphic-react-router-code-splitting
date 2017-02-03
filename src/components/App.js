import React from 'react';
import {Link} from 'react-router';
import capitalize from 'lodash/capitalize';
import cx from 'classnames';
import styles from './app.css';
import Helmet from 'react-helmet';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.pages = [
      `bleep`,
      `bloop`,
      `bloosh`,
    ];
  }

  render() {
    const {spacing, ...rest} = styles;

    return (
      <div>
        <Helmet title="My Title" />
        <h1>Hellloooo App Stuff More</h1>
        <div>{this.props.children}</div>
        {this.pages.map(page => (
          <Link
            className={cx(spacing, rest[page])}
            key={page}
            to={`/${page}`}
          >
            {capitalize(page)}
          </Link>
        ))}
      </div>
    );
  }
}
