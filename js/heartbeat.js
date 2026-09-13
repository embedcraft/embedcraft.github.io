/* Shared heartbeat-style pulse curve — a quick "lub-dub" double beat followed
   by a rest, repeating every HEARTBEAT_PERIOD ms. Used to drive the hero
   particle network's pulse; kept separate from any audio timing since a real
   chant breath cycle is much slower than a resting heart rate. */
window.HEARTBEAT_PERIOD = 1100;

window.heartbeatPulse = function(tMs, periodMs){
  periodMs = periodMs || window.HEARTBEAT_PERIOD;
  var phase = (tMs % periodMs) / periodMs;
  function bump(center, width, height){
    var d = phase - center;
    if(d > 0.5) d -= 1;
    if(d < -0.5) d += 1;
    var x = d / width;
    return height * Math.exp(-x * x * 4);
  }
  return bump(0.05, 0.055, 1.0) + bump(0.19, 0.08, 0.55);
};
