import {expect} from 'chai';
import path from 'path';
import cheerio from 'cheerio';
import stats from '../mock/stats.json';
import config from '../../lib/util/config';
import render from '../utils/template-setup';
import GetAsset from '../../lib/tasks/template/tags/get-asset';

describe(`#GetAsset`, () => {
  const extensions = {
    GetAsset: new GetAsset(),
  };
  const opts = {
    extensions,
  };
  const dest = path.join(`test`, `mock`);
  const statsFile = `stats.json`;

  Object.assign(config, {dest, statsFile});

  const ctx = {
    config,
    env: config.env,
  };

  it(`should create script tag`, () => {
    const data = render(
      `{% get_asset type="js" %}`,
      ctx,
      opts
    );
    const $ = cheerio.load(data);

    expect($(`script`).attr(`src`)).to.equal(stats.javascript.main);
  });

  it(`should create style tag in NODE_ENV=development`, () => {
    const data = render(
      `{% get_asset type="css" %}`,
      ctx,
      opts
    );

    const $ = cheerio.load(data);

    expect($(`link`).attr(`href`)).to.equal(stats.styles.main);
  });

  it(`should create link tag in NODE_ENV=production`, () => {
    const data = render(
      `{% get_asset type="css" %}`,
      Object.assign({}, ctx, {env: `production`}),
      opts
    );

    const $ = cheerio.load(data);

    expect($(`link`).attr(`href`)).to.equal(stats.styles.main);
  });
});
