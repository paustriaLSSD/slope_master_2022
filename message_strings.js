function getWinMessage(score) {
  if(score < 250) {
    return "Maybe try that again..."
  }
  else if(score < 500) {
    return "Not bad..."
  }
  else if(score < 750) {
    return "You're good at this."
  }
  else if(score < 1000) {
    return "Amazing!"
  }
  else if(score < 1500) {
    return "You're an expert!"
  }
  else if(score < 2000) {
    return "You have what it takes!"
  }
  else {
    return "You are the Slope Master."
  }
}

const CONGRATS_MESSAGES = [
  "NICE!",
  "AWESOME!",
  "COOL!",
  "CORRECT!",
  "YEAH!",
  "YES!",
  "YEP!",
  "WELL DONE!",
  "THAT'S RIGHT!",
  "YOU BET!"
];

function getCongratsMessage() {
  return CONGRATS_MESSAGES[Math.floor(Math.random() * CONGRATS_MESSAGES.length)];
}
