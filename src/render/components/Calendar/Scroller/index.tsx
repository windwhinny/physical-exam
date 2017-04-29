import React = require('react');
import { oneDay } from '../../../../lib/date';
import { bindMethod } from '../../../../lib/utils';
import cx = require('classnames');
import {
  CommonCalendarProps,
} from '../types';

require('./index.scss');

type Props = CommonCalendarProps;

type State = {
  offset: number,
  current: Date,
}

export default class CalendarScroler extends React.Component<Props, State> {
  state: State;
  dates: Date[];
  touching: boolean = false;
  touchStartPoint: number = 0;
  touchStartOffset: number = 0;
  containerRect: ClientRect;
  scrollerRect: ClientRect;
  lastTouchPoint: number;

  constructor(props: Props) {
    super(props);

    this.state = {
      offset: 0,
      current: props.date,
    };

    bindMethod(this, ['touchStart', 'touchMove', 'touchEnd']);
  }

  genDates(): Date[] {
    const dates: Date[] = [];
    const start = new Date(this.state.current.getTime() - oneDay * 4)
    const end = new Date(this.state.current.getTime() + oneDay * 4)
    let d = start;
    while (d <= end) {
      dates.push(d);
      d = new Date(d.getTime() + oneDay);
    }

    return dates;
  }

  touchStart(e: React.TouchEvent<HTMLDivElement>) {
    this.touchStartPoint = e.touches[0].clientX;
    this.touchStartOffset = this.state.offset;
    this.touching = true;
    const container = this.refs.container as HTMLDivElement;
    const scroller = this.refs.scroller as HTMLDivElement;
    this.containerRect = container.getBoundingClientRect();
    this.scrollerRect = scroller.getBoundingClientRect();
  }

  touchMove(e: React.TouchEvent<HTMLDivElement>) {
    console.info('MOVE', e.currentTarget);
    const point = e.touches[0].clientX;
    if (!this.touching) return;
    const movement = point - this.touchStartPoint;
    const state = {
      offset: this.touchStartOffset + movement,
      current: this.state.current,
    }
    if (movement > 100) {
      state.current = new Date(state.current.getTime() - oneDay);
      this.touchStartOffset -= movement;
    } else if (movement < -100) {
      state.current = new Date(state.current.getTime() + oneDay);
      this.touchStartOffset += movement;
    }
    this.lastTouchPoint = point;
    this.setState(state);
  }

  touchEnd() {
    this.touching = false;
  }

  render() {
    const dates = this.genDates();
    const style = {
      transform: `translateX(${this.state.offset}px)`,
    };
    return <div className="calendar-scroller"
      onTouchStart={this.touchStart}
      onTouchMove={this.touchMove}
      onTouchEnd={this.touchEnd}
      ref="scroller"
    >
      <div className="slide">
        <div className="container"
          style={style}
          ref="container"
        >
          {dates.map(d => {
            return <div className={cx('date', {
              active: d.getTime() === this.state.current.getTime(),
            })} key={d.getTime()}>
              {d.getDate()}
            </div>;
          })}
        </div>
      </div>
    </div>;
  }
}
