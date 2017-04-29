import React = require('react');
import { Link } from 'react-router-dom';
import url = require('url');
import {
  TestName,
} from '../../../constants';

export default class TestCategory extends React.Component<{}, {}> {
  render() {
    return <div className="TestCategory">
      {Object.keys(TestName).map((k) => {
        const name = TestName[Number(k)];
        const path = url.format({
          pathname: '/daily',
          query: {
            item: k,
          },
        });
        return <Link to={path} key={k}>{name}</Link>;
      })}
    </div>;
  }
}
