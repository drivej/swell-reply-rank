import './linear-loader.css';

export class LinearLoader {
  $el = document.createElement('div');
  $inner;
  requestFrame: number;
  private startTime = 0;
  private duration = 0;
  private ticking = false;
  private _progress = 0;

  constructor() {
    this.$el.className = 'linear-loader';
    this.$el.innerHTML = '<div></div>';
    this.$inner = this.$el.querySelector<HTMLDivElement>('div');
  }

  addEventListener(t: 'complete', f: (e: Event) => void) {
    this.$el.addEventListener(t, f);
  }

  removeEventListener(t: 'complete', f: (e: Event) => void) {
    this.$el.removeEventListener(t, f);
  }

  triggerComplete() {
    this.$el.dispatchEvent(new CustomEvent('complete', { bubbles: false, cancelable: false }));
  }

  set progress(val: number) {
    this._progress = Math.max(0, Math.min(1, val));
    this.$inner.style.width = `${this._progress * 100}%`;
  }

  get progress() {
    return this._progress;
  }

  start(duration: number) {
    this.startTime = Date.now();
    this.duration = duration;
    // https://stackoverflow.com/questions/34726154/temporarily-bypass-a-css-transition
    const d = this.$inner.style.transitionDuration;
    this.$inner.style.transitionDuration = '0s';
    this.progress = 0;
    this.$inner.style.transitionDuration = '';
    this.$el.style.height = '';
    if (!this.ticking) {
      this.ticking = true;
      this.tick();
    }
  }

  tick() {
    this.progress = (Date.now() - this.startTime) / this.duration;
    if (this.progress >= 1) {
      this.complete();
    } else {
      this.requestFrame = requestAnimationFrame(this.tick.bind(this));
    }
  }

  stop() {
    if (this.ticking) {
      cancelAnimationFrame(this.requestFrame);
      this.ticking = false;
      this.$el.style.height = '0px';
    }
  }

  complete() {
    this.stop();
    this.triggerComplete();
  }
}
