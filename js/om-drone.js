/*
  A synthesized, mild ambient "Om" drone — not a vocal recording (none was
  available/licensed), just a soft sustained tone built from a low
  fundamental plus a couple of quiet harmonics, gentle vibrato, and a slow
  volume "breath" swell.

  Plays by default, no toggle button — but browsers block audio until the
  visitor has interacted with the page at least once, so call start() on
  load (builds the graph, silently if the browser suspends it) and call
  resume() from the very first click/key/touch/scroll anywhere on the page
  to actually unlock sound. See the wiring in index.html.
*/
(function(){
  "use strict";

  var FUNDAMENTAL = 136.1; // conventional "Om" tone used in meditation/sound apps
  var BASE_GAIN = 0.035;   // deliberately quiet — "mild"
  var FADE = 1.4;          // seconds

  var ctx = null, nodes = null, playing = false;

  function build(){
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    var master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.connect(master);

    var harmonics = [
      { mult: 1, gain: 0.5 },
      { mult: 2, gain: 0.18 },
      { mult: 3, gain: 0.08 }
    ].map(function(h){
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = FUNDAMENTAL * h.mult;
      var g = ctx.createGain();
      g.gain.value = h.gain;
      osc.connect(g); g.connect(filter);
      return { osc: osc, gain: g };
    });

    // gentle vibrato on the fundamental
    var vibrato = ctx.createOscillator();
    vibrato.type = 'sine';
    vibrato.frequency.value = 0.18;
    var vibratoDepth = ctx.createGain();
    vibratoDepth.gain.value = 1.1;
    vibrato.connect(vibratoDepth);
    vibratoDepth.connect(harmonics[0].osc.frequency);

    // slow breathing swell on the master volume
    var breath = ctx.createOscillator();
    breath.type = 'sine';
    breath.frequency.value = 0.125; // ~8s breath cycle
    var breathDepth = ctx.createGain();
    breathDepth.gain.value = BASE_GAIN * 0.4;
    breath.connect(breathDepth);
    breathDepth.connect(master.gain);

    harmonics.forEach(function(h){ h.osc.start(); });
    vibrato.start();
    breath.start();

    master.gain.linearRampToValueAtTime(BASE_GAIN, ctx.currentTime + FADE);

    nodes = { master: master, harmonics: harmonics, vibrato: vibrato, breath: breath };

    // Most browsers create this suspended (silently) unless start() was
    // itself called from a user gesture. This attempt is harmless either
    // way; resume() below is what actually unlocks it on first interaction.
    if(ctx.state === 'suspended') ctx.resume().catch(function(){});
  }

  function teardown(deadCtx, deadNodes){
    if(!deadNodes) return;
    var toStop = deadNodes.harmonics.map(function(h){ return h.osc; }).concat([deadNodes.vibrato, deadNodes.breath]);
    toStop.forEach(function(o){ try{ o.stop(); }catch(e){} });
    if(deadCtx) deadCtx.close();
  }

  function start(){
    if(playing) return;
    playing = true;
    build();
  }

  function stop(){
    if(!playing) return;
    playing = false;
    var deadCtx = ctx, deadNodes = nodes;
    ctx = null; nodes = null;
    if(deadNodes){
      deadNodes.master.gain.cancelScheduledValues(deadCtx.currentTime);
      deadNodes.master.gain.setValueAtTime(deadNodes.master.gain.value, deadCtx.currentTime);
      deadNodes.master.gain.linearRampToValueAtTime(0, deadCtx.currentTime + 1);
    }
    setTimeout(function(){ teardown(deadCtx, deadNodes); }, 1100);
  }

  function resume(){
    if(ctx && ctx.state === 'suspended') ctx.resume().catch(function(){});
  }

  window.OmDrone = {
    start: start,
    stop: stop,
    resume: resume,
    toggle: function(){ playing ? stop() : start(); },
    isPlaying: function(){ return playing; }
  };
})();
