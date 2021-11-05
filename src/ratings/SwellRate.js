import { Item, MAX_DURATION } from './Item.js';
import { ItemsList } from './ItemsList.js';
import { rand } from './utils.js';
// import * as csv from '../../../node_modules/csvtojson';

export const config = {
  durationPercentMultiplier: 0,
  averageSecondsMultiplier: 0,
  averagePositionMultiplier: 0,
  totalListensMultiplier: 0,
};

export class SwellRate {
  $el = document.createElement('div');
  // items = Array.from(new Array(100)).map((e, i) => new Item({ duration: 100, listensLength: 10, averagePercent: i / 100 }));
  // items = Array.from(new Array(100)).map((e, i) => new Item({ index: i, duration: 100, listensLength: 10 * i, averagePercent: 0.5 }));
  items = Array.from(new Array(100)).map(
    (e, i) =>
      new Item({
        index: i, //
        duration: rand(MAX_DURATION),
        listensLength: rand(1000),
        averagePercent: rand(),
      })
  );
  list = new ItemsList(this.items);

  constructor() {
    this.loadConfig();
    const $controls = document.createElement('div');
    $controls.style.padding = '10px';
    $controls.innerHTML = `
    <div style="display:none;">
        <button id="export-btn">export</button>
        <button id="save-btn">save</button>
        <button id="load-btn">load</button>
        <button id="refresh-btn">refresh</button>
    </div>
    <div>
        <p>Grey bar: 5 minutes of audio. Blue bar: Duration of audio. Yellow Dot: Average point listened to in audio. Green bar is # of listeners out of 1000.</p>
    </div>
    <table  cellpadding="5" style="width:100%; text-align:left;">
        <tbody id="controls-table">
           
        </tbody>
    </table>
    `;

    const control1 = new ControlInput({
      value: config.durationPercentMultiplier,
      label: 'Total&nbsp;Duration',
      onInput: (val) => {
        config.durationPercentMultiplier = val;
        this.saveConfig();
        this.refresh();
      },
    });

    const control2 = new ControlInput({
      value: config.averageSecondsMultiplier,
      label: 'Seconds&nbsp;Listened',
      onInput: (val) => {
        config.averageSecondsMultiplier = val;
        this.saveConfig();
        this.refresh();
      },
    });

    const control3 = new ControlInput({
      value: config.averagePositionMultiplier,
      label: 'Percent&nbsp;Listened',
      onInput: (val) => {
        config.averagePositionMultiplier = val;
        this.saveConfig();
        this.refresh();
      },
    });

    const control4 = new ControlInput({
      value: config.totalListensMultiplier,
      label: 'Total&nbsp;Listens',
      onInput: (val) => {
        config.totalListensMultiplier = val;
        this.saveConfig();
        this.refresh();
      },
    });

    $controls.querySelector('#controls-table').appendChild(control1.$el);
    $controls.querySelector('#controls-table').appendChild(control2.$el);
    $controls.querySelector('#controls-table').appendChild(control3.$el);
    $controls.querySelector('#controls-table').appendChild(control4.$el);

    $controls.querySelector('#export-btn').addEventListener('click', () => {
      console.log(JSON.stringify(this.items.map((item) => item.export())));
    });

    $controls.querySelector('#save-btn').addEventListener('click', () => this.save());
    $controls.querySelector('#load-btn').addEventListener('click', () => this.load());
    $controls.querySelector('#refresh-btn').addEventListener('click', () => this.refresh());

    this.$el.appendChild($controls);

    this.list.sort();
    this.$el.appendChild(this.list.$el);

    this.import();
  }

  import() {
    let url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT5QQ_zIuzGqX14L9YNaqvkqaX9gUhx2r3wBUOsGH3g9UwA3A9EFOUF2ac8ikdnJSaJFGK8iipXkeuj/pub?output=csv';
    console.log('import', url);
    csv().fromFile(url).then(o => console.log(o));
    // fetch(url)
    //   .then((res) => res.text())
    //   .then((data) => console.log(data));
  }

  refresh() {
    this.items.forEach((item) => item.render());
    this.list.sort();
  }

  saveConfig() {
    window.localStorage.setItem('config', JSON.stringify(config));
  }

  loadConfig() {
    try {
      const raw = window.localStorage.getItem('config');
      const data = JSON.parse(raw);
      Object.assign(config, data);
      this.refresh();
    } catch (err) {
      console.log(err);
    }
  }

  save() {
    window.localStorage.setItem('data', JSON.stringify(this.items.map((item) => item.export())));
  }

  load() {
    try {
      const raw = window.localStorage.getItem('data');
      const data = JSON.parse(raw);
      this.items = data.map((item) => new Item(item));
      this.list.update(this.items);
    } catch (err) {
      console.log(err);
    }
  }

  render() {}
}

class ControlInput {
  $el = document.createElement('tr');
  label = 'label';
  value = 0;
  onInput = () => {};

  constructor(config) {
    Object.assign(this, config);
    this.render();
  }

  render(config) {
    this.$el.innerHTML = `
        <td width="1"><label>${this.label}</label></td>
        <td><input type="range" min="${0}" max="${1}" step="0.01" value="${this.value}" /></td>
        <td><span>${this.value.toFixed(2)}</span></td>
    `;
    this.$el.querySelector('input').addEventListener('input', (e) => {
      this.value = parseFloat(e.currentTarget.value);
      this.$el.querySelector('span').innerText = this.value.toFixed(2);
      this.onInput(this.value);
    });
  }
}
