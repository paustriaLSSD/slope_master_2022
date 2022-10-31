const gameState = {
  MENU: 'menu',
  ROUND: 'round',
  END: 'end'
}

const inputState = {
  NONE: 'none',
  YINT: 'yint',
  SLOPE: 'slope'
}

const ASSET_MANIFEST = [
  { src:"Button_SM.png", id:"playButton", crossOrigin:true},
  { src:"Background_SM.jpg", id:"background", crossOrigin:true},
  { src:"Background_SM2.png", id:"backgroundDimmed", crossOrigin:true},
  { src:"Title_SM.png", id:"title", crossOrigin:true},
  { src:"Hit.png", id:"hit", crossOrigin:true},
  { src:"Miss.png", id:"miss", crossOrigin:true},
  { src:"game_over.wav", id:"game_overSFX", crossOrigin:true},
  { src:"hit.wav", id:"hitSFX", crossOrigin:true},
  { src:"line.wav", id:"lineSFX", crossOrigin:true},
  { src:"miss.wav", id:"missSFX", crossOrigin:true},
  { src:"loaded.wav", id:"loadedSFX", crossOrigin:true},
  { src:"start.wav", id:"startSFX", crossOrigin:true},
  { src:"timer_beep.wav", id:"timer_beepSFX", crossOrigin:true}
];

const PLAY_BUTTON_LOCATION_X_PROPORTION = 0.5;
const PLAY_BUTTON_LOCATION_Y_PROPORTION = 0.76;
const TITLE_LOCATION_X_PROPORTION = 0.55;
const TITLE_LOCATION_Y_PROPORTION = 0.36;
const GRID_WIDTH = 350;
const GRID_HEIGHT = 350;
const ROWS = 10
const COLUMNS = 10;
const GRID_PADDING_X = 65
const GRID_PADDING_Y = 190
const GRID_AXIS_EXTRA_LENGTH = 10
const UI_Y = 15;
const INTRO_DURATION = 1100;
const TIME = 60
const FIRST_INSTRUCTION = "Plot the Y intercept"
const FONT_FAMILY_EQUATION = "'Be Vietnam Pro', sans-serif"
const FONT_FAMILY_GAME = "'Press Start 2P', cursive"

class SlopeMaster {
  constructor(width, height, stage) {
    this.width = width
    this.height = height
    this.stage = stage

    this.frame = 0;
    this.startTime;
    this.timeRemaining;
    this.gameState = gameState.MENU;
    this.inputState = inputState.NONE;
    this.currentEquation;
    this.expectedYIntercept;
    this.expectedSlopeNumerator;
    this.expectedSlopeDenominator;
    this.score = 0;
    this.rightTaps = [];
    this.wrongTaps = [];
    this.currentStreak = 0;
  }

  init() {
    this.loadingLabel = createLabel(this.stage, "  Loading...", 20, "#ffffff", this.width / 2, this.height / 2, "center", FONT_FAMILY_GAME)
    this.stage.addChild(this.loadingLabel)

    this.loader = new createjs.LoadQueue(true);
    this.loader.installPlugin(createjs.Sound);
    var loader = this.loader

    loader.addEventListener("complete", function() {
      var playButton = new createjs.Bitmap(loader.getResult("playButton"));
      setAnchorPointCenter(playButton);
      playButton.x = this.width * PLAY_BUTTON_LOCATION_X_PROPORTION;
      playButton.y = this.height * PLAY_BUTTON_LOCATION_Y_PROPORTION;
      this.playButton = playButton;

      var background = new createjs.Bitmap(loader.getResult("background"));
      this.background = background;

      var backgroundDimmed = new createjs.Bitmap(loader.getResult("backgroundDimmed"));
      this.backgroundDimmed = backgroundDimmed;

      var title = new createjs.Bitmap(loader.getResult("title"));
      setAnchorPointCenter(title);
      title.x = this.width * TITLE_LOCATION_X_PROPORTION;
      title.y = this.height * TITLE_LOCATION_Y_PROPORTION;
      this.title = title;

      this.stage.removeChild(this.loadingLabel)

      const event = new Event('assetsLoaded');
      dispatchEvent(event);
    }.bind(this));

    loader.loadManifest(ASSET_MANIFEST, true, "./assets/");
  }

  showTitle() {
    var stage = this.stage
    stage.addChild(this.background);

    var title = this.title
    stage.addChild(title);
    var titleOriginY = title.y
    var titleDestinationY = title.y - 5
    createjs.Tween.get(title, { loop: true }).to({y:titleDestinationY}, 2000, createjs.Ease.sineInOut).to({y:titleOriginY}, 1000, createjs.Ease.elasticOut);

    stage.addChild(this.playButton);

    this.playButton.addEventListener("click", function(event) {
      this.handlePlayButtonClick();
    }.bind(this));

    var text = createLabel(stage, "Made for Cavelero Mid High School by Mr. Austria", 9, "#ff66ff", this.width * 0.5, 490, "center", FONT_FAMILY_GAME);

    createjs.Sound.play("loadedSFX");
  }

  tearDownTitle() {
    this.playButton.removeAllEventListeners();
    this.stage.removeAllEventListeners();
    this.stage.removeAllChildren();
  }

  screenToCoord(x, y) {
    var cellWidth = (GRID_WIDTH / ROWS);
    var cellHeight = (GRID_HEIGHT / COLUMNS);
    var coordX = -5 + Math.ceil((x / this.stage.scaleX - GRID_PADDING_X - cellWidth/2) / cellWidth);
    var coordY = 5 + -1 * Math.ceil((y / this.stage.scaleY - GRID_PADDING_Y - cellHeight/2) / cellHeight);

    return [coordX, coordY];
  }

  coordToScreen(x, y) {
    var cellWidth = (GRID_WIDTH / ROWS);
    var cellHeight = (GRID_HEIGHT / COLUMNS);
    var screenX = GRID_PADDING_X + ((5 + x) * cellWidth);
    var screenY = GRID_PADDING_Y + ((-5 + y) * -cellHeight);

    return [screenX, screenY];
  }

  initGame() {
    this.startTime = new Date();
    this.score = 0;
    this.currentStreak = 0;
  }

  showGame() {
    var stage = this.stage

    // Hacked
    stage.removeAllChildren();
    stage.removeAllEventListeners();
    this.background.removeAllEventListeners();
    this.backgroundDimmed.removeAllEventListeners();

    var background = this.backgroundDimmed
    stage.addChild(background);

    var scoreLabel = createLabel(stage, "Score:", 16, "#ff66ff", 20, UI_Y, "left", FONT_FAMILY_GAME);
    this.scoreLabel = scoreLabel;

    var scoreCounter = createLabel(stage, "0", 16, "#ff66ff", 120, UI_Y, "left", FONT_FAMILY_GAME);
    this.scoreCounter = scoreCounter;

    var timeLabel = createLabel(stage, "Time:", 16, "#ff66ff", 340, UI_Y, "left", FONT_FAMILY_GAME);
    this.timeLabel = timeLabel;

    var timeCounter = createLabel(stage, "-", 16, "#ff66ff", 430, UI_Y, "left", FONT_FAMILY_GAME);
    this.timeCounter = timeCounter;

    var equationLabel = createLabel(stage, "-", 28, "#ff66ff", this.width * 0.5, this.height * 0.14, "center", FONT_FAMILY_EQUATION);
    equationLabel.visible = false;
    this.equationLabel = equationLabel;

    var instructionLabel = createLabel(stage, FIRST_INSTRUCTION, 12, "#ff66ff", this.width * 0.5, this.height * 0.24, "center", FONT_FAMILY_GAME);
    instructionLabel.visible = false;
    this.instructionLabel = instructionLabel;

    createjs.Tween.get(instructionLabel, {loop:true}).to({color:"#ffaaff"}, 50, createjs.Ease.sineInOut)
                                                     .wait(100)
                                                     .to({color:"#ff66ff"}, 200, createjs.Ease.sineInOut)
                                                     .wait(1000);

    var plane = new createjs.Shape();
    plane.graphics.setStrokeStyle(2).beginStroke("rgba(80,80,60,1)");
    for (var x = 0; x <= GRID_WIDTH; x += GRID_WIDTH / COLUMNS) {
       plane.graphics.moveTo(GRID_PADDING_X + x, GRID_PADDING_Y);
       plane.graphics.lineTo(x + GRID_PADDING_X, GRID_HEIGHT + GRID_PADDING_Y);
    }
    for (var y = 0; y <= GRID_HEIGHT; y += GRID_HEIGHT / ROWS) {
       plane.graphics.moveTo(GRID_PADDING_X, y + GRID_PADDING_Y);
       plane.graphics.lineTo(GRID_WIDTH + GRID_PADDING_X, y + GRID_PADDING_Y);
    }
    plane.graphics.endStroke();
    stage.addChild(plane);

    var axes = new createjs.Shape();
    axes.graphics.setStrokeStyle(3).beginStroke("rgba(220, 220, 100, 1)");
    axes.graphics.moveTo(this.width * 0.5, GRID_PADDING_Y - GRID_AXIS_EXTRA_LENGTH);
    axes.graphics.lineTo(this.width * 0.5, GRID_HEIGHT + GRID_PADDING_Y + GRID_AXIS_EXTRA_LENGTH);

    axes.graphics.moveTo(GRID_PADDING_X - GRID_AXIS_EXTRA_LENGTH, GRID_PADDING_Y + GRID_HEIGHT * 0.5);
    axes.graphics.lineTo(GRID_PADDING_X + GRID_WIDTH + GRID_AXIS_EXTRA_LENGTH, GRID_PADDING_Y + GRID_HEIGHT * 0.5);
    axes.graphics.endStroke();
    stage.addChild(axes);

    plane.rotation = 1;
    plane.regX = GRID_WIDTH * 0.5;
    plane.regY = GRID_HEIGHT * 0.5;
    plane.x = GRID_WIDTH * 0.5;
    plane.y = GRID_HEIGHT * 0.5;
    createjs.Tween.get(plane).to({rotation:0}, INTRO_DURATION, createjs.Ease.elasticOut);

    axes.rotation = 5;
    axes.regX = GRID_WIDTH * 0.5;
    axes.regY = GRID_HEIGHT * 0.5;
    axes.x = GRID_WIDTH * 0.5;
    axes.y = GRID_HEIGHT * 0.5;
    createjs.Tween.get(axes).to({rotation:0}, INTRO_DURATION, createjs.Ease.elasticOut).call(function() {
      this.stage.addEventListener("stagemousedown", function(event) {
        var stageX = event.stageX
        var stageY = event.stageY

        var coords = this.screenToCoord(stageX, stageY);
        var coordX = coords[0];
        var coordY = coords[1];

        if ((coordX >= -5) && (coordX <= 5) && (coordY >= -5) && (coordY <= 5)) {
          if(this.inputState == inputState.YINT) {
              this.handleYInterceptSubmit(coordX, coordY);
          }
          else if(this.inputState == inputState.SLOPE) {
              this.handleSlopeSubmit(coordX, coordY);
          }
        }
      }.bind(this))

      this.prepareNextRound();
      this.startRound();
    }, null, this);
  }

  tearDownGame() {
    this.stage.removeAllEventListeners();
    this.stage.removeAllChildren();
    this.inputState = inputState.NONE
  }

  prepareNextRound() {
    this.expectedYIntercept = randomInt(-5, 2);

    var numerator = randomInt(-3, 3);
    var denominator = randomInt(1, 4);

    if (this.score < 200) {
      numerator = 1
      denominator = randomInt(2, 4);
      this.expectedYIntercept = randomInt(-2, -1);
    }

    var reduced = reduce(numerator, denominator)
    this.expectedSlopeNumerator = reduced[0]
    this.expectedSlopeDenominator = reduced[1]

    this.currentEquation = getFormattedEquation(this.expectedSlopeNumerator, this.expectedSlopeDenominator, this.expectedYIntercept)

    this.wrongTaps.forEach(function(missSprite) {
      this.stage.removeChild(missSprite);
    }.bind(this))

    this.rightTaps.forEach(function(hitSprite) {
      this.stage.removeChild(hitSprite);
    }.bind(this))

    this.stage.removeChild(this.line)

    this.wrongTaps = [];
    this.rightTaps = [];
  }

  startRound() {
    this.gameState = gameState.ROUND;
    this.inputState = inputState.YINT

    this.equationLabel.text = this.currentEquation;
    this.equationLabel.visible = true;

    this.instructionLabel.text = FIRST_INSTRUCTION;
    this.instructionLabel.visible = true;
  }

  increaseScore(delta) {
    this.score += delta
    this.scoreCounter.text = this.score
    this.scoreCounter.color = "#ff22ff"
    createjs.Tween.get(this.scoreCounter).to({color:"#ff66ff"}, 50, null)
                                         .to({color:"#ffffff"}, 50, null)
                                         .to({color:"#ff66ff"}, 50, null)
                                         .to({color:"#00ff00"}, 50, null)
                                         .to({color:"#ff66ff"}, 50, null)
  }

  handleYInterceptSubmit(x, y) {
    if(x != 0 || y != this.expectedYIntercept) {
        this.currentStreak = 0;

        var missMessage = "miss"
        if (this.wrongTaps.length >= 2) {
          missMessage = "check the b value..."
        }

        this.wrongTaps.push(this.addMissSprite(x, y, missMessage));

        createjs.Sound.play("missSFX");
    }
    else {
        this.inputState = inputState.SLOPE;
        this.increaseScore(10);

        this.rightTaps.push(this.addHitSprite(x, y));
        this.wrongTaps.forEach(function(missSprite) {
          this.stage.removeChild(missSprite);
        }.bind(this))

        createjs.Sound.play("hitSFX");

        this.instructionLabel.text = "Plot another point on the line."
    }
  }

  handleSlopeSubmit(x, y) {
    if(this.isOnTheLine(x, y)) {
      this.inputState = inputState.NONE;

      this.rightTaps.push(this.addHitSprite(x, y, false));
      this.wrongTaps.forEach(function(missSprite) {
        this.stage.removeChild(missSprite);
      }.bind(this))

      this.instructionLabel.visible = false;

      createjs.Sound.play("lineSFX");

      this.drawTheLine()

      var streakBonus = Math.round(this.currentStreak * 10);
      this.increaseScore(100 + streakBonus)
      this.currentStreak += 1;

      var screenCoords = this.coordToScreen(x, y);
      if (this.currentStreak >= 3) {
        this.addFlyaway(screenCoords[0], screenCoords[1] - 50, "COMBO x" + this.currentStreak, "#ffffff")
      }

      this.addFlyaway(screenCoords[0], screenCoords[1] - 30, getCongratsMessage(), "#55ff55", function() {
        if(this.gameState == gameState.ROUND && this.timeRemaining > 0) {
          this.prepareNextRound();
          this.startRound();
        }
      }.bind(this));
    }
    else {
      this.currentStreak = 0;
      var missMessage = "miss"
      if (this.wrongTaps.length >= 2) {
        missMessage = "check the rise and the run..."
      }
      this.wrongTaps.push(this.addMissSprite(x, y, missMessage));

      createjs.Sound.play("missSFX");
    }
  }

  addFlyaway(x, y, message, color, onComplete=null) {
    var flyaway = createLabel(this.stage, message, 12, color, x, y, "center", FONT_FAMILY_GAME);

    var originalColor = color
    var flashColor = "#ffffff"

    createjs.Tween.get(flyaway).to({color:flashColor}, 50, null)
                               .wait(50)
                               .to({color:originalColor}, 50, null)
                               .wait(50)
                               .to({color:flashColor}, 50, null)
                               .wait(50)
                               .to({color:originalColor}, 50, null)
                               .wait(50);

    createjs.Tween.get(flyaway).to({y:flyaway.y - 25}, 1500, createjs.Ease.quadOut).call(function() {
        this.stage.removeChild(flyaway);

        if (onComplete) {
          onComplete();
        }
    }, null, this);
  }

  addHitSprite(x, y, useFlyaway=true) {
    var hitSprite = new createjs.Bitmap(this.loader.getResult("hit"));
    hitSprite.scaleX = 0.6;
    hitSprite.scaleY = 0.6;
    setAnchorPointCenter(hitSprite);
    var screenCoords = this.coordToScreen(x, y);
    hitSprite.x = screenCoords[0];
    hitSprite.y = screenCoords[1];

    this.stage.addChild(hitSprite);

    createjs.Tween.get(hitSprite).to({scaleX: 0.4, scaleY: 0.4}, 100, createjs.Ease.sineInOut)
                                 .to({scaleX: 0.5, scaleY: 0.5}, 100, createjs.Ease.sineInOut)

    if (useFlyaway) {
      this.addFlyaway(screenCoords[0] + 30, screenCoords[1] - 10, "hit", "#00ff00")
    }

    return hitSprite
  }

  addMissSprite(x, y, missMessage) {
    var missSprite = new createjs.Bitmap(this.loader.getResult("miss"));
    missSprite.scaleX = 0.25;
    missSprite.scaleY = 0.25;
    missSprite.rotation = 15;
    setAnchorPointCenter(missSprite);
    var screenCoords = this.coordToScreen(x, y);
    missSprite.x = screenCoords[0];
    missSprite.y = screenCoords[1];

    this.stage.addChild(missSprite);

    createjs.Tween.get(missSprite).to({scaleX: 0.5, scaleY: 0.5, rotation: 0}, 100, createjs.Ease.sineInOut)

    this.addFlyaway(screenCoords[0] + 30, screenCoords[1] - 10, missMessage, "#ff0000")

    return missSprite
  }

  update() {
    var stage = this.stage

    if(stage) {
      if(this.gameState == gameState.ROUND) {
        this.timeRemaining = TIME - parseInt((new Date() - this.startTime)/1000);

        var oldText = this.timeCounter.text;
        var newText = this.timeRemaining - 1;

        this.timeCounter.text = newText

        if (this.timeRemaining < 6) {
          this.timeCounter.color = "#ff0000";

          if (oldText != newText && oldText != "0") {
            createjs.Sound.play("timer_beepSFX");
          }
        }
      }

      if(this.gameState == gameState.ROUND && this.timeRemaining <= 0) {
        this.gameState = gameState.END
        this.inputState = inputState.NONE
        this.tearDownGame()
        this.showResultScreen(this.score);
      }

      stage.update();
    }
  }

  showResultScreen(score) {
    createjs.Sound.play("game_overSFX");

    var stage = this.stage

    var backgroundDimmed = this.backgroundDimmed
    stage.addChild(backgroundDimmed)

    var gameOverLabel = createLabel(stage, "Game Over", 42, "#ff66ff", this.width * 0.5, this.height * 0.3, "center", FONT_FAMILY_GAME);
    var gameOverOriginY = gameOverLabel.y
    var gameOverDestinationY = gameOverLabel.y - 5
    createjs.Tween.get(gameOverLabel, {loop: true}).to({y:gameOverDestinationY}, 1000, createjs.Ease.sineInOut).to({y:gameOverOriginY}, 1000, createjs.Ease.sineInOut);

    var finalScoreLabel = createLabel(stage, "Final Score", 18, "#00ff00", this.width * 0.5, this.height * 0.5, "center", FONT_FAMILY_GAME);
    var finalScoreCounter = createLabel(stage, score, 28, "#00ff00", this.width * 0.5, this.height * 0.58, "center", FONT_FAMILY_GAME);

    createjs.Tween.get(finalScoreCounter, { loop: true }).to({color:"#88cc88"}, 200, createjs.Ease.sineInOut)
                                                         .wait(50)
                                                         .to({color:"#00ff00"}, 200, createjs.Ease.sineInOut)
                                                         .wait(500);

    var messageLabel = createLabel(stage, getWinMessage(score), 12, "#ffff00", this.width * 0.5, this.height * 0.83, "center", FONT_FAMILY_GAME);
    messageLabel.alpha = 0;

    var instructionLabel = createLabel(stage, "- Click to try again -", 12, "#ffff00", this.width * 0.5, this.height * 0.9, "center", FONT_FAMILY_GAME);
    instructionLabel.alpha = 0;

    createjs.Tween.get(messageLabel).to({alpha:1.0}, 2000, createjs.Ease.sineInOut)
    createjs.Tween.get(instructionLabel).wait(2000).to({alpha:1.0}, 300, createjs.Ease.sineInOut).call(function() {
        this.waitForResultClick(backgroundDimmed)
    }, null, this);
  }

  tearDownResultScreen() {
    this.background.removeAllEventListeners()
    this.stage.removeAllChildren()
    this.stage.removeAllEventListeners()
  }

  handlePlayButtonClick() {
    this.tearDownTitle()
    this.initGame();
    this.showGame();

    createjs.Sound.play("startSFX");
  }

  waitForResultClick(background) {
    background.addEventListener("click", function(event) {
      this.tearDownResultScreen()
      this.showTitle()
    }.bind(this));
  }

  isOnTheLine(x, y) {
      var penX = 0;
      var penY = this.expectedYIntercept;

      // check one way
      while(penX <= 5 && penX >= -5 && penY <=5 && penY >= -5) {
          penX += this.expectedSlopeDenominator;
          penY += this.expectedSlopeNumerator;

          if(penX == x && penY == y) {
              return true;
          }
      }

      // check the other way
      penX = 0;
      penY = this.expectedYIntercept;

      while(penX <= 5 && penX >= -5 && penY <=5 && penY >= -5) {
          penX -= this.expectedSlopeDenominator;
          penY -= this.expectedSlopeNumerator;

          if(penX == x && penY == y) {
              return true;
          }
      }

      return false;
  }

  drawTheLine() {
    var stage = this.stage
    var line = new createjs.Shape();
    var command = line.graphics.setStrokeStyle(4).beginStroke("#00ff00").command;

    var startCoords = [this.rightTaps[0].x, this.rightTaps[0].y];
    var endCoords = [this.rightTaps[1].x, this.rightTaps[1].y];

    var deltaX = endCoords[0] - startCoords[0];
    var deltaY = endCoords[1] - startCoords[1];

    var repeatCount = 8
    line.graphics.moveTo(startCoords[0] - repeatCount * deltaX, startCoords[1] - repeatCount * deltaY);
    line.graphics.lineTo(endCoords[0] + repeatCount * deltaX, endCoords[1] + repeatCount * deltaY);
    line.alpha = 0;
    line.graphics.endStroke();

    stage.addChild(line)
    this.line = line;

    stage.setChildIndex(this.rightTaps[0], stage.numChildren - 1);
    stage.setChildIndex(this.rightTaps[1], stage.numChildren - 1);

    createjs.Tween.get(line).to({alpha:1}, 200, createjs.Ease.sineInOut)
                            .to({alpha:0.1}, 100, createjs.Ease.sineInOut)
                            .to({alpha:1.0}, 100, createjs.Ease.sineInOut)
                            .to({alpha:0.1}, 100, createjs.Ease.sineInOut)
                            .to({alpha:1.0}, 100, createjs.Ease.sineInOut)
                            .wait(800)
                            .to({alpha:0}, 200, createjs.Ease.sineInOut)
  }
}

function setAnchorPointCenter(obj) {
  var bounds = obj.getBounds();
  obj.regX = bounds.width / 2;
  obj.regY = bounds.height / 2;
}

function createLabel(stage, text, fontSize, color, x, y, alignment, fontFamily) {
  var label = new createjs.Text(text, fontSize + "px " + fontFamily, color)
  label.x = x
  label.y = y
  label.textAlign = alignment
  stage.addChild(label)

  return label
}
