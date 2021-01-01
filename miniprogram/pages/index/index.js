//index.js
const app = getApp()

Page({
  data: {
    deviceInfo: null,
    boxSize: 30,
    fontSize: Number,
    guessBoxSize: Number,
    guessFontSize: Number,
    currCheckedIndex: 1,
    isGuessMode: false,
    isSignalNumMode: false,
    sideSize: 0,
  },

  onLoad: function () {
    this.initSize();
    this.initData();
  },

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
            value: j + 1,
            guess: [],
            type: 0,
          }
        } else {
          array[i][j] = {
            value: 0,
            guess: [Math.floor(Math.random() * 10 + 1)],
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
    if (data[x][y].value > 0) {
      data[x][y].value = 0;
    } else {
      data[x][y].value = this.data.currCheckedIndex;
    }
    this.setData({
      data: data
    })
  },

  tapBtn(e) {
    const index = e.currentTarget.dataset.index;
    // clear <== 10
    if (index <= 10) {
      this.setData({
        currCheckedIndex: index
      })
    } else if (index === 11) {
      this.setData({
        isGuessMode: !this.isGuessMode
      })
    } else if (index === 12) {
      isSignalNumMode: !this.isSignalNumMode
    }
  }
})
