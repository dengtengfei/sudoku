//index.js
const app = getApp()

Page({
  data: {
    deviceInfo: null,
    boxSize: 30,
    fontSize: Number,
    guessBoxSize: Number,
    guessFontSize: Number,
    currCheckedIndex: '1',
    isGuessMode: false,
    isSignalNumMode: false,
    currSelectedBoxInSignalMode: -1,
    sideSize: 0,
  },

  onLoad: function () {
    this.initSize();
    this.initData();
  },
  bigBox: [
    [0, 1, 2, 9, 10, 11, 18, 19, 20],
    [3, 4, 5, 12, 13, 14, 21, 22, 23],
    [6, 7, 8, 15, 16, 17, 24, 25, 26],
    [27, 28, 29, 36, 37, 38, 45, 46, 47],
    [30, 31, 32, 39, 40, 41, 48, 49, 50],
    [33, 34, 35, 42, 43, 44, 51, 52, 53],
    [54, 55, 56, 63, 64, 65, 72, 73, 74],
    [57, 58, 59, 66, 67, 68, 75, 76, 77],
    [60, 61, 62, 69, 70, 71, 78, 79, 80]
  ],

  initSize() {
    let deviceInfo = app.deviceInfo;
    let boxSize = (deviceInfo.windowWidth - 14) / 9.0;
    let guessBoxSize = boxSize / 3;
    let fontSize = boxSize;
    let guessFontSize = guessBoxSize * 0.8;
    this.setData({
      deviceInfo: deviceInfo,
      boxSize: boxSize,
      fontSize: fontSize,
      guessBoxSize: guessBoxSize,
      guessFontSize: guessFontSize,
      sideSize: (deviceInfo.windowHeight - deviceInfo.windowWidth) / 2,
    })
  },

  initData() {
    let array = new Array(9)
    for (let i = 0; i < 9; i++) {
      array[i] = new Array(9)
      for (let j = 0; j < 9; j++) {
        if (Math.floor(Math.random() * 10 + 1) % 2 === 1) {
          array[i][j] = {
            value: j + 1 + '',
            guess: [],
            type: 0,
          }
        } else {
          array[i][j] = {
            value: '0',
            guess: ['' + Math.floor(Math.random() * 10 + 1)],
            type: 1,
          }
        }
      }
    }
    this.setData({
      data: array
    })
  },

  tapBox(e) {
    const x = e.currentTarget.dataset.x;
    const y = e.currentTarget.dataset.y;
    let data = this.data.data;
    this.setData({
      currSelectedBoxInSignalMode: x * 9 + y
    })
    // base box, can not changed value
    if (data[x][y].type === 0) {
      return;
    }
    if (this.data.currCheckedIndex === '10') {
      data[x][y].value = '0';
      data[x][y].guess = [];
    } else {
      // signal mode, the inputing action is in btn taped
      if (this.data.isSignalNumMode) {
        return;
      }
      if (this.data.isGuessMode) {
        if (data[x][y].guess.indexOf(this.data.currCheckedIndex) === -1) {
          data[x][y].guess.push(this.data.currCheckedIndex);
        } else {
          for (let i = 0; i < data[x][y].guess.length; ++i) {
            if (data[x][y].guess[i] === this.data.currCheckedIndex) {
              data[x][y].guess.splice(i, 1);
              break;
            }
          }
        }
      } else {
        if (data[x][y].value === this.data.currCheckedIndex) {
          data[x][y].value = '0';
        } else {
          data[x][y].value = this.data.currCheckedIndex;
        }
        this.check(data, x, y);
      }
    }
    this.setData({
      data: data
    })
  },

  tapBtn(e) {
    const index = e.currentTarget.dataset.index;
    // clear <== 10
    if (index <= 10) {
      const x = Math.floor(this.data.currSelectedBoxInSignalMode / 9), y = this.data.currSelectedBoxInSignalMode % 9;
      let data = this.data.data;
      // signal mode、num btn clicked、 box has not ever clicked、not base box
      if (this.data.isSignalNumMode && index < 10 && this.data.currSelectedBoxInSignalMode >= 0 && data[x][y].type === 1) {
        if (this.data.isGuessMode) {
          if (data[x][y].guess.indexOf(index) === -1) {
            data[x][y].guess.push(index);
          } else {
            for (let i = 0; i < data[x][y].guess.length; ++i) {
              if (data[x][y].guess[i] === index) {
                data[x][y].guess.splice(i, 1);
                break;
              }
            }
          }
        } else {
          if (data[x][y].value === index) {
            data[x][y].value = 0;
          } else {
            data[x][y].value = index;
          }
          this.check(data, x, y);
        }
        this.setData({data: data});
      }
      this.setData({currCheckedIndex: index});
    } else if (index === 'G') {
      this.setData({isGuessMode: !this.data.isGuessMode});
    } else if (index === 'M') {
      this.setData({isSignalNumMode: !this.data.isSignalNumMode});
    }
  },

  check(data, x, y) {
    // data.forEach(row => {
    //   row.forEach(item => {
    //     item.duplicate = false;
    //   })
    // })
    // check 9 square
    const square = this.bigBox[Math.floor(x / 3) * 3 + Math.floor(y / 3)];
    square.forEach(element => {
      square.forEach(anotherElement => {
        if (element != anotherElement) {
          x = Math.floor(element / 9), y = Math.floor(element % 9);
          const p = Math.floor(anotherElement / 9), q = anotherElement % 9;
          if (data[x][y].value === data[p][q].value) {
            data[x][y].duplicate = true;
            data[p][q].duplicate = true;
          }
        }
      })
    });
    this.setData({
      data: data
    })
  }
})