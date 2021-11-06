import { RateConfig } from '../interface/IApp';
import { ControlInput } from './ControlInput';

export class RateControls {
  config: RateConfig = {
    maxScore: 0,
    durationPercentMultiplier: 0,
    averageSecondsMultiplier: 0,
    percentListenedMultiplier: 0,
    totalListensMultiplier: 0,
    ageDecayMultiplier: 0,
  };

  $el = document.createElement('div');
  onChange: (info: RateConfig) => void;
  saveConfigDelay: NodeJS.Timeout;
  changeDelay: NodeJS.Timeout;

  constructor(options: { onChange: (info: RateConfig) => void }) {
    if (options.onChange) this.onChange = options.onChange;
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
      value: this.config.durationPercentMultiplier,
      label: 'Total&nbsp;Duration',
      onInput: (val: number) => {
        this.config.durationPercentMultiplier = val;
        this.saveConfig();
        this.refresh();
      },
    });

    const control2 = new ControlInput({
      value: this.config.averageSecondsMultiplier,
      label: 'Seconds&nbsp;Listened',
      onInput: (val: number) => {
        this.config.averageSecondsMultiplier = val;
        this.saveConfig();
        this.refresh();
      },
    });

    const control3 = new ControlInput({
      value: this.config.percentListenedMultiplier,
      label: 'Percent&nbsp;Listened',
      onInput: (val: number) => {
        this.config.percentListenedMultiplier = val;
        this.saveConfig();
        this.refresh();
      },
    });

    const control4 = new ControlInput({
      value: this.config.totalListensMultiplier,
      label: 'Total&nbsp;Listens',
      onInput: (val: number) => {
        this.config.totalListensMultiplier = val;
        this.saveConfig();
        this.refresh();
      },
    });

    const control5 = new ControlInput({
      value: this.config.ageDecayMultiplier,
      label: 'Age&nbsp;Decay',
      onInput: (val: number) => {
        this.config.ageDecayMultiplier = val;
        this.saveConfig();
        this.refresh();
      },
    });

    $controls.querySelector('#controls-table').appendChild(control1.$el);
    $controls.querySelector('#controls-table').appendChild(control2.$el);
    $controls.querySelector('#controls-table').appendChild(control3.$el);
    $controls.querySelector('#controls-table').appendChild(control4.$el);
    $controls.querySelector('#controls-table').appendChild(control5.$el);

    this.$el.appendChild($controls);
  }

  refresh() {
    this.doRefresh();
  }

  doRefresh() {
    this.config.maxScore =
      this.config.durationPercentMultiplier + //
      this.config.averageSecondsMultiplier +
      this.config.percentListenedMultiplier +
      this.config.totalListensMultiplier +
      this.config.ageDecayMultiplier;

    this.onChange(this.config);
  }

  saveConfig() {
    if (this.saveConfigDelay) clearTimeout(this.saveConfigDelay);
    this.saveConfigDelay = setTimeout(() => this.doSaveConfig(), 1000);
  }

  doSaveConfig() {
    window.localStorage.setItem('config', JSON.stringify(this.config));
  }

  loadConfig() {
    try {
      const raw = window.localStorage.getItem('config');
      const data = JSON.parse(raw);
      Object.assign(this.config, data);
      this.refresh();
    } catch (err) {
      console.log(err);
    }
  }

  save() {
    window.localStorage.setItem('data', JSON.stringify(this.config));
  }
}
