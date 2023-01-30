import {Component, OnInit} from '@angular/core';
import {Power0, Power1, Power4, TimelineMax} from 'gsap';

interface Reward {
  name: string;
  probability: number; // 0-100
  color: string;
  startAngle: number | undefined;
  endAngle: number | undefined;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'lucky-money-wheel';
  wheel = document.getElementById('wheel');
  indicator = new TimelineMax();
  spinWheel = new TimelineMax();
  currentReward: Reward = null;
  activeAngle = 360 * 0.17;
  slots = []
  rewards: Reward[] = [
    {
      name: '10k',
      probability: 50,
      color: 'tomato',
      startAngle: undefined,
      endAngle: undefined
    }, {
      name: '20k',
      probability: 45,
      color: 'green', startAngle: undefined,
      endAngle: undefined
    }, {
      name: '100k',
      probability: 1,
      color: 'blue', startAngle: undefined,
      endAngle: undefined
    }, {
      name: '50k',
      probability: 4,
      color: 'yellow', startAngle: undefined,
      endAngle: undefined
    }, {
      name: '1k',
      probability: 0,
      color: 'red', startAngle: undefined,
      endAngle: undefined
    }, {
      name: '2k',
      probability: 0,
      color: 'orange', startAngle: undefined,
      endAngle: undefined
    }, {
      name: '5k',
      probability: 0,
      color: 'purple', startAngle: undefined,
      endAngle: undefined
    }
  ];
  private rotationAngle = 0;

  constructor() {
    const openAngle = 360 / this.rewards.length;
    this.rewards = this.rewards.map(reward => {
      reward.startAngle = this.rewards.indexOf(reward) * openAngle;
      reward.endAngle = reward.startAngle + openAngle;
      return reward;
    });

    // có 100 slot, fill vào mảng, mỗi slot là 1 phần trăm, với mỗi slot priority là 1 phần trăm
    this.rewards.forEach(reward => {
      for (let i = 0; i < reward.probability; i++) {
        this.slots.push(reward);
      }
    });
  }

  ngOnInit(): void {
    const sectorsElement = document.getElementById('sectors');
    this.wheel = document.getElementById('wheel');
    this.rewards.forEach((reward, index) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('id', `_${index + 1}`);
      const openAngle = 360 / this.rewards.length;
      const startAngle = index * openAngle;

      const endAngle = startAngle + openAngle;
      const radius = 365;
      const start = this.polarToCartesian(radius, radius, radius, startAngle);
      const end = this.polarToCartesian(radius, radius, radius, endAngle);
      const d = [
        'M', radius, radius,
        'L', start.x, start.y,
        'A', radius, radius, 0, 0, 1, end.x, end.y,
        'Z'
      ].join(' ');

      path.setAttribute('d', d);
      path.setAttribute('transform', `translate(0)`);
      path.setAttribute('fill', reward.color);
      path.setAttribute('stroke', 'white');

      // set name of reward as text in center of path
      const center_x = (start.x + end.x) / 2 - openAngle / 2;
      const center_y = (start.y + end.y) / 2 - openAngle / 2;

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', center_x.toString());
      text.setAttribute('y', center_y.toString());

      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '20');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('transform', `translate(0)`);
      text.innerHTML = reward.name;

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(0)`);
      group.appendChild(path);
      group.appendChild(text);
      sectorsElement.appendChild(group);
    });
  }

  onSpinClick() {
    this.wheel = document.getElementById('wheel');
    const activeElement = document.getElementById('active');
    this.indicator = new TimelineMax();
    this.spinWheel = new TimelineMax();
    const duration = 1;
    this.indicator.to(activeElement, .13, {
      rotation: -10,
      transformOrigin: '65% 36%',
      // ease: Power1.easeNone,
    }).to(activeElement, .13, {
      rotation: 3,
      transformOrigin: '65% 36%',
      // ease: Power4.easeNone,
    }).add('end');
    const minRolls = 5;
    this.rotationAngle = 360 * minRolls + this.randomWithProbability();
    // this.rotationAngle = 3089;
    this.spinWheel.to(this.wheel, duration, {
      rotation: this.rotationAngle.toString() + 'deg',
      transformOrigin: '50% 50%',
      // ease: Power0.easeNone,
      onComplete: this.onSpinComplete.bind(this),
    });
  }

  getRewardByAngle(angle: number): Reward {
    console.log(angle);
    const rotatedRewards = this.rewards.map(reward => {
      let startAngle = reward.startAngle + angle % 360;
      let endAngle = reward.endAngle + angle % 360;
      if (startAngle > 360) {
        startAngle = startAngle % 360;
      }
      if (endAngle > 360) {
        endAngle = endAngle % 360;
      }
      return {
        ...reward,
        startAngle,
        endAngle
      };
    });
    return rotatedRewards.find(reward => {
      if (reward.startAngle < reward.endAngle) {
        return this.activeAngle >= reward.startAngle && this.activeAngle <= reward.endAngle;
      }
      return this.activeAngle >= reward.startAngle || this.activeAngle <= reward.endAngle;
    });
  }

  onSpinComplete() {

    const reward = this.getRewardByAngle(this.rotationAngle);


    console.log('spin complete', reward);
    // wait 1 seconds
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // display reward
    alert('Chúc mừng bạn được Pé Hòa lì xì ' + reward.name);

    this.wheel = document.getElementById('wheel');
    // reset wheel
    this.spinWheel = new TimelineMax();
    this.spinWheel.to(this.wheel, 1, {
      rotation: 0,
      transformOrigin: '50% 50%',
      ease: Power0.easeNone
    });
  }

  private polarToCartesian(number: number, number2: number, number3: number, startAngle: number) {
    const angle = (startAngle - 90) * Math.PI / 180;
    return {
      x: number + (number3 * Math.cos(angle)),
      y: number2 + (number3 * Math.sin(angle))
    };
  }

  private randomWithProbability() {
    const randomSlot = Math.floor(Math.random() * this.slots.length);
    const slotReward = this.slots[randomSlot];
    const minAngle = slotReward.startAngle - this.activeAngle;
    const maxAngle = slotReward.endAngle;
    const randomAngle = Math.floor(Math.random() * (maxAngle - minAngle + 1)) + minAngle;
    return randomAngle;
  }
}
