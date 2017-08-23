import React = require('react');
import { oneDay } from '../../../../lib/date';
import { bindMethod, throttle } from '../../../../lib/utils';
import CanvasRenderer, {
  Cell,
} from './CanvasRenderer'
import {
  getColor,
} from '../BaseCanvasRenderer'
import {
  isSameDay
} from '../../../../lib/date';
import {
  CommonCalendarProps,
} from '../types';
import RecordService from '../../../services/Record';

require('./index.scss');

type Props = CommonCalendarProps;

type State = {
  wrapperSize?: ClientRect,
  offset: number,
  current: Date,
  renderer?: CanvasRenderer,
  activeDates: {
    start: Date | null,
    dates: [number, number, number][],
  }
}

export default class CalendarScroler extends React.Component<Props, State> {
  state: State;
  dates: Date[];
  lastTouchPoint: number | null = null;
  step: number | null = null;
  cells: Cell[] = [];
  animation?: number;

  constructor(props: Props) {
    super(props);

    this.state = {
      offset: 0,
      current: props.date,
      activeDates: {
        start: null,
        dates: [],
      }
    };

    this.resizeCallback = throttle(this.resizeCallback, 500);
    this.getActiveDates = throttle(this.getActiveDates, 300);

    bindMethod(this, [
      'renderCanvas',
      'touchStart',
      'touchMove',
      'touchEnd',
      'generateDates',
      'onCanvasClick',
      'resizeCallback',
    ]);
  }

  generateDates(): Date[] {
    const { date } = this.props;
    const dates: Date[] = [];
    const start = new Date(date.getTime() - oneDay * 5)
    const end = new Date(date.getTime() + oneDay * 5)
    let d = start;
    while (d <= end) {
      dates.push(d);
      d = new Date(d.getTime() + oneDay);
    }

    const activeStart = this.state.activeDates.start;
    if (activeStart && start.getTime() !== activeStart.getTime()) {
      this.getActiveDates(dates);
    } else if (!activeStart) {
      this.getActiveDates(dates);
    }
    return dates;
  }

  async getActiveDates(dates: Date[]) {
    const from = dates[0];
    const to = dates[dates.length - 1];
    const rs = await RecordService('getByDateRange')(from, to);
    this.setState({
      activeDates: {
        start: from,
        dates: rs.map(s => {
          const d = new Date(s);
          return [d.getFullYear(), d.getMonth(), d.getDate()];
        }) as [number, number, number][],
      },
    });
  }

  initCanvas() {
    const canvas = this.refs.canvas as HTMLCanvasElement;
    const style = getComputedStyle(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const renderer = new CanvasRenderer(ctx, {
      style: {
        fontFamily: style.fontFamily || '',
        fontSize: Number((style.fontSize || '').replace('px', '')),
        fontWeight: 'bold',
        color: getColor(style.color || ''),
      },
    });
    this.step = renderer.step;
    this.setState({
      renderer,
    });
  }

  getCanvasStyle() {
    const { wrapperSize } = this.state;
    const height = wrapperSize ? wrapperSize.height : 0;
    return {
      height: `${height}px`,
    }
  }

  getCanvasSize() {
    const { wrapperSize } = this.state;
    return {
      width: (wrapperSize ? wrapperSize.width : 0) * devicePixelRatio,
      height: (wrapperSize ? wrapperSize.height : 0) * devicePixelRatio,
    }
  }

  componentDidMount() {
    const wrapper = this.refs.wrapper as HTMLDivElement;
    const rect = wrapper.getBoundingClientRect();
    this.setState({
      wrapperSize: rect,
    });
    window.addEventListener('resize', this.resizeCallback);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeCallback);
  }

  resizeCallback() {
    this.forceUpdate();
    const wrapper = this.refs.wrapper as HTMLDivElement;
    const rect = wrapper.getBoundingClientRect();
    this.setState({
      wrapperSize: rect,
      renderer: undefined,
    });
  }

  renderCanvas() {
    const { renderer, offset, activeDates} = this.state;
    const { date } = this.props;
    if (!this.refs.canvas) return;
    if (!renderer) {
      this.initCanvas();
      return;
    };
    this.cells = renderer.render({
      getDateSet: this.generateDates,
      activeDate: date,
      offset: offset * devicePixelRatio,
      activeDates: activeDates.dates,
    });
  }

  touchStart(e: React.TouchEvent<HTMLDivElement>) {
    const point = e.touches[0].clientX;
    this.lastTouchPoint = point;
  }

  touchMove(e: React.TouchEvent<HTMLDivElement>) {
    const { onSelectedDateChanged, date} = this.props;
    if (this.lastTouchPoint === null) return;
    if (this.animation) {
      cancelAnimationFrame(this.animation);
      this.animation = undefined;
    }
    const point = e.touches[0].clientX;
    let offset = (point - this.lastTouchPoint);
    offset += this.state.offset;
    if (this.step !== null && onSelectedDateChanged) {
      if (offset > this.step / 2) {
        onSelectedDateChanged(new Date(date.getTime() - oneDay));
        offset -= this.step;
      } else if (offset < -1 * this.step / 2) {
        onSelectedDateChanged(new Date(date.getTime() + oneDay));
        offset += this.step;
      }
    }
    this.setState({
      offset,
    });
    this.lastTouchPoint = point;
  }

  startResetAnimation() {
    const next = () => {
      this.animation = requestAnimationFrame(() => {
        let offset = this.state.offset;
        if (offset === 0) return;
        offset = offset > 0 ? offset - 3 : offset + 3;
        if (Math.abs(offset) < 3) offset = 0;
        this.setState({
          offset,
        });
        next();
      });
    };
    next();
  }

  touchEnd() {
    this.lastTouchPoint = null;

    if (this.state.offset !== 0) {
      this.startResetAnimation();
    }
  }

  onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!this.cells.length || this.step === null) return;
    const step = this.step;
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cell = this.cells.find(c => {
      return Math.abs(x - c.x) < step / 2 &&
             Math.abs(y - c.y) < step / 2;
    });
    if (!cell) return;
    if (isSameDay(cell.date, this.props.date)) return;
    if (this.props.onSelectedDateChanged) {
      this.props.onSelectedDateChanged(cell.date);
    }
  }


  render() {
    const { wrapperSize } = this.state;
    const size = this.getCanvasSize();
    requestAnimationFrame(this.renderCanvas);
    return <div className="calendar-scroller"
      onTouchStart={this.touchStart}
      onTouchMove={this.touchMove}
      onTouchEnd={this.touchEnd}
      ref="scroller"
    >
      <div className="canvas-wrapper" ref="wrapper">
        { wrapperSize &&
          <canvas
            ref="canvas"
            style={this.getCanvasStyle()}
            width={size.width}
            height={size.height}
            onClick={this.onCanvasClick}
          />}
      </div>
    </div>;
  }
}
