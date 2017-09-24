import React = require('react');
import {
  TestType,
} from '../../../../constants';
type Props = {
  onUpdate?: (d: Date) => void,
  type: TestType,
}

type State = {
  time: Date,
}

export default class Timmer extends React.Component<Props, State> {
  // tslint:disable-next-line:no-any
  timmer: any;
  startTime: Date;
  lastTime: Date;
  constructor(props: Props) {
    super(props);
    this.state = {
      time: new Date(0),
    };
    this.startTime = new Date();
  }

  update() {
    const now = new Date();
    const d = new Date(now.getTime() - this.startTime.getTime());
    this.setState({
      time: d,
    });
    if (this.props.onUpdate) {
      if (!this.lastTime) {
        this.props.onUpdate(d);
      } else {
        if (this.lastTime.getSeconds() !== d.getSeconds()) {
          this.props.onUpdate(d);
        }
      }
    }
  }

  componentDidMount() {
    this.timmer = setInterval(() => {
      this.update();
    }, 100);
  }

  componentWillUnmount() {
    clearInterval(this.timmer);
  }

  render() {
    if (![
      TestType.Running1000,
      TestType.Running800,
      TestType.Running50,
      TestType.RopeSkipping,
    ].includes(this.props.type)) {
      return null;
    }
    const { time } = this.state;
    const minutes = String(100 + time.getMinutes()).slice(1);
    const seconds = String(100 + time.getSeconds()).slice(1);
    const milliseconds = String(1000 + time.getMilliseconds()).slice(1);
    return <span className="Timmer">{minutes}:{seconds}.{milliseconds}</span>
  }
}
