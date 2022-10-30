var Game = function (pCanvasID) {
    // 'constants'
    this.STAGE_WIDTH = 480;
    this.STAGE_HEIGHT = 560;
    this.STAGE_ASPECT_RATIO = this.STAGE_WIDTH / this.STAGE_HEIGHT;

    // properties
    this.canvas = document.getElementById(pCanvasID);
    this.stage = new createjs.Stage(this.canvas);
    this.resizeNeeded = false;

    window.addEventListener("resize",function () {
        this.resizeNeeded = true;
    }.bind(this));

    // setup easeljs ticker
    this.tickerListener = createjs.Ticker.on('tick', this.update, this);
    createjs.Ticker.framerate = 24;
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

    this.resize();

    addEventListener("assetsLoaded", function(e) {
      this.slopeMaster.showTitle()
    }.bind(this))

    this.init()
};

Game.prototype.init = function() {
  this.slopeMaster = new SlopeMaster(this.STAGE_WIDTH, this.STAGE_HEIGHT, this.stage);
  this.slopeMaster.init()
}

Game.prototype.update = function (pEvent) {
    if (this.resizeNeeded) {
        this.resize();
    }

    if (this.slopeMaster) {
      this.slopeMaster.update();
    }

    this.stage.update();
}

Game.prototype.resize = function () {
    // get aspect ratio of containing element (window)
    var containerWidth = window.innerWidth;
    var containerHeight = window.innerHeight;
    var containerAspectRatio = containerWidth / containerHeight;

    // container is too wide
    if (containerAspectRatio > this.STAGE_ASPECT_RATIO) {
        // use full height for canvas
        this.stage.canvas.height = containerHeight;
        this.stage.canvas.width = containerHeight * this.STAGE_ASPECT_RATIO;
    // container is too tall
    } else {
        // use full width for canvas
        this.stage.canvas.width = containerWidth;
        this.stage.canvas.height = containerWidth / this.STAGE_ASPECT_RATIO;
    }

    // scale stage to fit canvas
    var scale = this.stage.canvas.width / this.STAGE_WIDTH;
    this.stage.scaleX = scale;
    this.stage.scaleY = scale;
    this.stage.update();

    this.resizeNeeded = false;
};
