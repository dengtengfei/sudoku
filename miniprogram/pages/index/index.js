//index.js
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    data: undefined,
    deviceInfo: null,
    boxSize: 30,
    fontSize: Number,
    guessBoxSize: Number,
    guessFontSize: Number,
    currCheckedIndex: '1',
    isGuessMode: false,
    isSingleNumMode: false,
    currSelectedBoxInSingleMode: -1,
    sideSize: 0,
    inputCount: undefined,
    showModal: false
  },
  id: '2',
  dbName: 'sudokuBase',
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
      sideSize: (deviceInfo.windowHeight - deviceInfo.windowWidth),
    })
  },

  initData() {
    wx.showLoading({
      title: '加载中',
    });
    let data = new Array(9);
    for (let i = 0; i < 9; i++) {
      data[i] = new Array(9);
    }
    this.setData({data: data});
    let _this = this;
    db.collection(_this.dbName).doc(_this.id).get().then(res => {
      // res.data 包含该记录的数据
      
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          data[i][j] = {
            value: res.data.data[i][j].value,
            guess: [],
            type: res.data.data[i][j].type,
          }
        }
      }
      
      let inputCount = new Array(10);
      for (let i = 0; i < 10; ++i) {
        inputCount[i] = 0;
      }
      for (let i = 0; i < 9; ++i) {
        for (let j = 0; j < 9; ++j) {
          if (data[i][j].value > 0) {
            ++inputCount[data[i][j].value];
          }
        }
      }
      _this.setData({
        data: data,
        inputCount: inputCount
      });
      wx.hideLoading();
    })
    .catch(function (err) {
      wx.hideLoading();
      wx.showToast({
        title: '获取数独失败',
        icon : 'error',
        duration: 3000
      })
      console.error(err);
    });
  },

  tapBox(e) {
    const x = e.currentTarget.dataset.x;
    const y = e.currentTarget.dataset.y;
    let data = this.data.data, inputCount = this.data.inputCount;
    this.setData({currSelectedBoxInSingleMode: x * 9 + y});
    // base box, can not changed value
    if (data[x][y].type === 0) {
      return;
    }
    if (this.data.currCheckedIndex === '10') {
      if (data[x][y].value > 0) {
        --inputCount[data[x][y].value];
        data[x][y].value = '0';
        this.check(data, x, y);
      }
      data[x][y].guess = [];
    } else {
      // single mode, the inputing action is in btn taped
      if (this.data.isSingleNumMode) {
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
          --inputCount[this.data.currCheckedIndex];
        } else {
          if (data[x][y].value != undefined) {
            --inputCount[data[x][y].value];
          }
          data[x][y].value = this.data.currCheckedIndex;
          ++inputCount[this.data.currCheckedIndex];
        }
        this.check(data, x, y);
        this.checkFinish(data);
      }
    }
    this.setData({
      data: data,
      inputCount: inputCount
    });
  },

  tapBtn(e) {
    const index = e.currentTarget.dataset.index;
    // clear <== 10
    if (index <= 10) {
      const x = Math.floor(this.data.currSelectedBoxInSingleMode / 9), y = this.data.currSelectedBoxInSingleMode % 9;
      let data = this.data.data, inputCount = this.data.inputCount;
      // single mode、num btn clicked、 box has not ever clicked、not base box
      if (this.data.isSingleNumMode && index < 10 && this.data.currSelectedBoxInSingleMode >= 0 && data[x][y].type !== 0) {
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
            data[x][y].value = '0';
            --inputCount[index];
          } else {
            if (data[x][y].value != undefined) {
              --inputCount[data[x][y].value];
            }
            data[x][y].value = index;
            ++inputCount[index];
          }
          this.check(data, x, y);
          this.checkFinish(data);
        }
        this.setData({
          data: data,
          inputCount: inputCount
        });
      }
      this.setData({currCheckedIndex: index});
    } else if (index === 'G') {
      this.setData({isGuessMode: !this.data.isGuessMode});
    } else if (index === 'M') {
      this.setData({isSingleNumMode: !this.data.isSingleNumMode});
    }
  },

  check(data, x, y) {
    data[x][y].duplicate = false;
    // check 9 square
    const square = this.bigBox[Math.floor(x / 3) * 3 + Math.floor(y / 3)];
    square.forEach(element => {
      const a = Math.floor(element / 9), b = Math.floor(element % 9);
      if (x !== a && y !== b) {
        data[a][b].duplicate = false;
      }
      square.forEach(anotherElement => {
        if (element != anotherElement) {
          const p = Math.floor(anotherElement / 9), q = anotherElement % 9;
          if (data[a][b].value === data[p][q].value) {
            data[a][b].duplicate = true;
            data[p][q].duplicate = true;
          }
        }
      })
    });

    // check row
    for (let b = 0; b < 9; ++b) {
      if (b != y) {
        data[x][b].duplicate = false;
      }
      for (let q = 0; q < 9; ++q) {
        if (b !== q && data[x][b].value === data[x][q].value) {
          data[x][b].duplicate = true;
          data[x][q].duplicate = true;
        }
      }
    }

    // check column
    for (let a = 0; a < 9; ++a) {
      if (a != x) {
        data[a][y].duplicate = false;
      }
      for (let p = 0; p < 9; ++p) {
        if (a !== p && data[a][y].value === data[p][y].value) {
          data[a][y].duplicate = true;
          data[p][y].duplicate = true;
        }
      }
    }
    this.setData({data: data});
  },

  checkFinish(data) {
    for (let i = 1; i < 10; ++i) {
      if (this.data.inputCount[i] != 9){
        return false;
      }
    }
    for (let i = 0; i < 9; ++i) {
      for (let j = 0; j < 9; ++j) {
        if (data[i][j].duplicate) {
          return false;
        }
      }
    }
    wx.showModal({
      title: '干的漂亮',
      content: '用时' + this.data.time,
      showCancel: false,
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } 
      }
    })
    return true;
  },

  showModal() {
    this.setData({showModal: true});
  },

  tapLast() {
    if (this.id > 1) {
      this.id = Math.floor(this.id) - 1 + '';
      this.initData();
    }
  },

  tapNext() {
    if (this.id < 4000) {
      this.id = Math.floor(this.id) + 1 + '';
      this.initData();
    }
  }
})