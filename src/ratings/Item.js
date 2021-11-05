import { rand, formatDuration } from './utils.js';
import { config } from './SwellRate.js';

export const MAX_DURATION = 60 * 5;

export class Item {
  $el = document.createElement('tr');
  title = '-';
  created = new Date();
  duration = rand(60 * 5);
  listensLength = 0;
  averagePosition = Math.random();
  rating = 0;
  index = 0;

  constructor(props) {
    Object.assign(this, props ?? {});
    this.render();
  }

  export() {
    return { listensLength: this.listensLength, averagePercent: this.averagePosition, duration: this.duration };
  }

  render() {
    this.$el.className = 'item';
    this.$el.innerHTML = `
    <td>${this.index}</td>
    <td style="text-align:left;">${this.title}</td>
    <td style="color:blue">${this.rating.toFixed(2)}</td>
    <td>${formatDuration(this.duration)}</td>
    <td>${this.listensLength}</td>
    <td>${this.averagePosition.toFixed(2)}</td>
    <td>
      <div class="vis-bar">
        <div class="vis-duration" style="width:${(this.duration / MAX_DURATION) * 100}%">
          <div class="vis-position" style="left:${this.averagePosition * 100}%"></div>
        </div>
      </div>
      <div class="vis-listensLength" style="width:${(100 * this.listensLength) / 1000}%;" />
    </td>`;
  }
}
