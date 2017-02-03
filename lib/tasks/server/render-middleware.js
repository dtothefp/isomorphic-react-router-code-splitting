import {log} from 'gulp-util';
import makeTemplate from '../template/index';

/**
 * Middleware to isomorphically render from react-route
 * @param {Object} config task config
 * @return {Function} express middleware
 */
export default function(config) {
  const render = makeTemplate({config});

  return (req, res, next) => {
    render({req}).then(({ctx, page}) => {
      const {
        redirectLocation,
        props,
        error,
      } = ctx;

      if (redirectLocation) {
        res.redirect(301).send(redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        res.status(500).send(error.message);
      } else if (!props) {
        res.status(404).send(`Not found`);
      } else {
        res.status(200).send(page);
      }
    }).catch((err) => {
      if (err) log(err.message, err.stack);

      next();
    });
  };
}
