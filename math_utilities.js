const SUPER_MAP = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹'
}

const SUB_MAP = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉'
}

function reduce(numerator,denominator)
{
  var gcd = function gcd(a,b){
    return b ? gcd(b, a%b) : a;
  };
  gcd = gcd(numerator,denominator);
  return [numerator/gcd, denominator/gcd];
}

function randomInt(minVal, maxVal)
{
    return Math.round(Math.random() * (maxVal - minVal) + minVal);
}

function getFormattedEquation(numerator, denominator, yIntercept)
{
  var isSlopeNegative = ((numerator < 0) && (denominator > 0)) ||
                        ((numerator > 0) && (denominator < 0))

  var isSlopeWhole = Math.abs(denominator == 1)

  var m = "";

  if(isSlopeNegative)
  {
    m += "-";
  }

  if (isSlopeWhole)
  {
    if (Math.abs(numerator) != 1)
    {
      m += Math.abs(numerator);
    }
  }
  else
  {
    var numeratorSuperscript = this.toMappedCharacter(Math.abs(numerator), SUPER_MAP)
    var denominatorSubscript = this.toMappedCharacter(Math.abs(denominator), SUB_MAP)

    m += numeratorSuperscript + "⁄" + denominatorSubscript;
  }

  var sign = "+";
  if(yIntercept < 0)
  {
      sign = "-";
  }

  var b =  sign + " " + Math.abs(yIntercept)
  if(yIntercept == 0)
  {
    b = ""
  }

  if(numerator == 0)
  {
    if(yIntercept == 0)
    {
      return "y = 0"
    }
    else if(yIntercept > 0)
    {
      return "y = " + Math.abs(yIntercept);
    }
    else
    {
      return "y = -" + Math.abs(yIntercept);
    }
  }
  else
  {
    return "y = " + m + " x " + b;
  }
}

function toMappedCharacter(value, map) {
  return value.toString().replace(/[0123456789]/g, function(match) {
      return map[match];
  });
}
