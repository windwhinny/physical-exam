import React = require('react');
import { Link } from 'react-router-dom';
import url = require('url');
import {
  TestName,
} from '../../../constants';
require('./index.scss');

export default class TestCategory extends React.Component<{}, {}> {
  render() {
    return <div className="test-category">
      {Object.keys(TestName).map((k) => {
        const name = TestName[Number(k)];
        const path = url.format({
          pathname: '/daily',
          query: {
            item: k,
          },
        });
        return <Link className="item" to={path} key={k}>
          <span className="name">{name}</span>
        </Link>;
      })}
    </div>;
  }
}
