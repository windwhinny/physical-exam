import React = require('react');
import cx = require('classnames');
import {
  Student
} from '../../../../constants';
import {
  bindMethod,
} from '../../../../lib/utils';
type Props = {
  students: Student[],
}

type State = {
  active: string | null,
}

type CanvasState = {
  rect?: ClientRect,
  ctx?: CanvasRenderingContext2D,
}

class CanvasContainer extends React.Component<{}, CanvasState> {
  lastPoint: {x: number, y: number} | null = null;
  touched: boolean = false;
  constructor(props: {}) {
    super(props);
    this.state = { };
    bindMethod(this, ['touchMove', 'touchStart', 'touchEnd']);
  }

  touchStart(event: React.TouchEvent<HTMLDivElement>) {
    const { rect, ctx } = this.state;
    if (!ctx || !rect) return;
    const touch = event.touches[0];
    const x = Math.floor((touch.clientX - rect.left) * devicePixelRatio);
    const y = Math.floor((touch.clientY - rect.top) * devicePixelRatio);
    this.lastPoint = {x, y};
  }

  touchEnd() {
    this.lastPoint = null;
  }

  touchMove(event: React.TouchEvent<HTMLDivElement>) {
    const { rect, ctx } = this.state;
    if (!ctx || !rect) return;
    this.touched = true;
    const touch = event.touches[0];
    const x = Math.floor((touch.clientX - rect.left) * devicePixelRatio);
    const y = Math.floor((touch.clientY - rect.top) * devicePixelRatio);
    if (!this.lastPoint) {
      this.lastPoint = {x, y};
      return;
    }
    ctx.beginPath();
    ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.stroke();
    this.lastPoint = {x, y};
  }

  componentDidMount() {
    const container = this.refs.container as HTMLDivElement;
    const rect = container.getBoundingClientRect();
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.height = devicePixelRatio * rect.height;
    canvas.width = devicePixelRatio * rect.width;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4 * devicePixelRatio;
    this.setState({
      rect,
      ctx,
    });
  }

  clear() {
    const { ctx } = this.state;
    if (!ctx) return;
    this.touched = false;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  export() {
    if (!this.touched) return null;
    const { ctx } = this.state;
    if (!ctx) return null;
    const canvas = document.createElement('canvas');
    const width = ctx.canvas.width > 200 ? 200 : ctx.canvas.width;
    const height = Math.round((width / ctx.canvas.width ) * ctx.canvas.height);
    canvas.width = width;
    canvas.height = height;
    const ctx2 = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx2.drawImage(ctx.canvas, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
  }

  render() {
    return <div
      className="canvas-container"
      ref="container"
      onTouchMove={this.touchMove}
      onTouchStart={this.touchStart}
      onTouchEnd={this.touchEnd}
      >
    </div>
  }
}

export default class SignBoard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      active: props.students.length ? props.students[0].nu : null,
    };
  }

  componentWillReceiveProps(props: Props) {
    if (props.students.length === 0) {
      this.setState({
        active: null
      });
    } else if (!props.students.find(s => s.nu === this.state.active)) {
      this.setState({
        active: props.students[0].nu,
      });
    }
  }

  getCanvas(nu: string) {
    return this.refs[`canvas${nu}`] as CanvasContainer;
  }

  clearCanvas(nu: string) {
    this.getCanvas(nu).clear();
  }

  renderBoard() {
    const { students } = this.props;
    const { active } = this.state;
    return students.map((s) => {
      return <div className={cx('board', s.nu === active && 'active')} key={s.nu}>
        <h3>签名区域</h3>
        <button onClick={() => this.clearCanvas(s.nu)}>清除重签</button>
        <CanvasContainer ref={`canvas${s.nu}`}/>
      </div>
    });
  }

  active(s: Student) {
    this.setState({
      active: s.nu,
    });
  }

  getSigns() {
    const result: {
      [k: string]: string,
    } = {};
    const { students } = this.props;
    students.forEach((s) => {
      const c = this.getCanvas(s.nu);
      const sign = c.export();
      if (sign !== null) {
        result[s.nu] = sign;
      }
    });
    return result;
  }

  render() {
    const { students } = this.props;
    const { active } = this.state;
    if (!students.length) {
      return null;
    }
    return <div className="sign-board">
      <ul>
        {students.map(s => {
          return <li className={s.nu === active ? 'active' : ''} key={s.nu} onClick={() => this.active(s)}>{s.name}</li>
        })}
      </ul>
      <div className="board-container">
        {this.renderBoard()}
      </div>
    </div>;
  }
}
