/*

// pass a loading key

CanvasLoader.start('load my thing')
CanvasLoader.start('load other thing')

// after some loading and such...
CanvasLoader.stop('load my thing')

// still spinning

CanvasLoader.stop('load my thing')

// spinning stops
// or stop all loading keys because your too cool for them

CanvasLoader.stop()

*/
const RAD = Math.PI / 180;

export class CanvasLoader {
  $div = document.createElement('div');
  $cvs = document.createElement('canvas');
  ctx = this.$cvs.getContext('2d');
  dotIndex = 0;
  dotCount = 12;
  dotRadius = 4;
  dotStep = (Math.PI * 2) / this.dotCount;
  center = 0;
  radius = 40;
  ticking = false;
  requestFrame: number;
  timeout: NodeJS.Timeout;

  constructor() {
    Object.assign(this.$div.style, {
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    });
    this.$div.appendChild(this.$cvs);
    this.$cvs.width = 10 + (this.radius + this.dotRadius) * 2;
    this.$cvs.height = 10 + (this.radius + this.dotRadius) * 2;
    this.center = this.$cvs.width * 0.5;
    this.ctx.fillStyle = '#FFF';
    this.start();
  }

  drawDot() {
    const a = this.dotStep * this.dotIndex;
    const x = this.center + Math.cos(a) * this.radius;
    const y = this.center + Math.sin(a) * this.radius;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.dotRadius, 0, 2 * Math.PI, false);
    this.ctx.fill();
  }

  fade() {
    this.ctx.globalAlpha = 0.15;
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillRect(0, 0, 100, 100);
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1;
  }

  start() {
    if (!this.ticking) {
      this.$div.style.display = 'flex';
      this.tick();
    }
  }

  tick() {
    this.drawDot();
    this.fade();
    this.dotIndex++;
    this.timeout = setTimeout(() => requestAnimationFrame(this.tick.bind(this)), 50);
  }

  stop() {
    this.$div.style.display = 'none';
    cancelAnimationFrame(this.requestFrame);
    if (this.timeout) clearTimeout(this.timeout);
  }
}
