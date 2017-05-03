import React = require('react');
import {
  bindMethod,
  throttle,
} from '../../../lib/utils';
import { oneDay } from '../../../lib/date';
import {
  DataSetGetter,
  CommonCalendarProps,
} from './types';
import {
  isSameDay
} from '../../../lib/date';
import CanvasRenderer, {
  getColor,
  Cell,
  Rect,
  DateData,
} from './CanvasRenderer';

require('./index.scss');

type State = {
  dates: DateData[][],
  wrapperSize?: ClientRect,
  offset: number,
  baseDate: Date,
  renderer?: CanvasRenderer,
}

type Props = CommonCalendarProps & {
  activeMonth: [number, number],
};


export {
  DataSetGetter,
}

export default class Calendar extends React.Component<Props, State> {
  dates: DateData[][] = [];
  cells: Cell[] | null = null;
  cellSize: Rect | null = null;
  lastTouchPoint: number | null = null;
  constructor(props: Props) {
    super(props);
    const date = props.date;
    this.state = {
      baseDate: date,
      offset: 0,
      dates: [],
    }

    this.resizeCallback = throttle(this.resizeCallback, 500);
    bindMethod(this, [
      'renderCanvas',
      'touchStart',
      'touchMove',
      'touchEnd',
      'generateDates',
      'setActiveMonth',
      'onCanvasClick',
      'resizeCallback',
    ]);
  }


  generateDates(rowOffset: number) {
    const dates: DateData[][] = [];
    const am = this.props.activeMonth;
    const year = this.state.baseDate.getFullYear();
    const month = this.state.baseDate.getMonth();
    const startOfBaseMonth = new Date(year, month, 1);

    const startOfActivedMonth = new Date(am[0], am[1], 1);
    const endOfActivedMonth = new Date(am[0], am[1] + 1, 0);

    const offset = startOfBaseMonth.getDay() - 1;
    const startOfData = new Date(year, month, -offset - (7 * rowOffset));
    for (let i = 0; i < 8; i++) {
      let row: DateData[] = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(startOfData.getTime() + oneDay * (i * 7 +  j));
        row.push({
          date,
          disabled: date < startOfActivedMonth || date > endOfActivedMonth,
          haveData: false,
        });
      }
      dates.push(row);
    }

    return dates;
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

  initCanvas() {
    const dates = this.refs.dates as HTMLDivElement;
    const canvas = dates.querySelector('canvas') as HTMLCanvasElement;
    const style = getComputedStyle(canvas);
    const highLightStyle = getComputedStyle(dates.querySelector('.high-light') as Element);
    const noteStyle = getComputedStyle(dates.querySelector('.note') as Element);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const renderer = new CanvasRenderer(ctx, {
      style: {
        fontFamily: style.fontFamily || '',
        fontSize: Number((style.fontSize || '').replace('px', '')),
        color: getColor(style.color || ''),
      },
    },   {
      highLight: {
        color: getColor(highLightStyle.color || ''),
        backgroundColor: getColor(highLightStyle.backgroundColor || ''),
      },
      note: {
        color: getColor(noteStyle.color || ''),
      },
    });
    this.setState({
      renderer,
    });
  }

  renderCanvas() {
    const { renderer, offset } = this.state;
    const { date, activeMonth } = this.props;
    if (!this.refs.canvas) return;
    if (!renderer) {
      this.initCanvas();
      return;
    };
    renderer.render({
      getDateSet: this.generateDates,
      activeDate: date,
      setActiveMonth: this.setActiveMonth,
      offset,
      activeMonth,
    });
    this.cells = renderer.cells;
    this.cellSize = renderer.cellCSSSize;
  }

  setActiveMonth(year: number, month: number) {
    if (this.props.onHoveredMonthChanged) {
      this.props.onHoveredMonthChanged(year, month);
    }
  }

  touchStart(e: React.TouchEvent<HTMLDivElement>) {
    const point = e.touches[0].clientY;
    this.lastTouchPoint = point;
  }

  touchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (this.lastTouchPoint === null) return;
    const point = e.touches[0].clientY;
    const offset = (point - this.lastTouchPoint) * devicePixelRatio;
    this.setState({
      offset: this.state.offset + offset,
    });
    this.lastTouchPoint = point;
  }

  touchEnd() {
    this.lastTouchPoint = null;
  }

  onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!this.cells || !this.cellSize) return;
    const cellSize = this.cellSize;
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cell = this.cells.find(c => {
      return Math.abs(x - c.x) < cellSize.width / 2 &&
             Math.abs(y - c.y) < cellSize.height / 2;
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
    return <div className="calendar" ref="container"
    onTouchStart={this.touchStart}
    onTouchMove={this.touchMove}
    onTouchEnd={this.touchEnd}
    >
      <ul className="calendar-header">
        <li>日</li>
        <li>一</li>
        <li>二</li>
        <li>三</li>
        <li>四</li>
        <li>五</li>
        <li>六</li>
      </ul>
      <div className="canvas-wrapper" ref="wrapper">
        { wrapperSize &&
          <div className="dates" ref="dates">
            <canvas
              ref="canvas"
              style={this.getCanvasStyle()}
              width={size.width}
              height={size.height}
              onClick={this.onCanvasClick}
            ></canvas>
            <span className="high-light"></span>
            <span className="note"></span>
          </div>}
      </div>
    </div>;
  }
}
