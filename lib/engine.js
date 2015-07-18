/* jshint node:true, browser:true */
/* global flowplayer */
"use strict";

var id3 = require('id3js');

var engine, engineName = 'audio',
    common = flowplayer.common,
    t = common.createElement('audio', {className: 'the-engine'}),
    bean = flowplayer.bean;

var ui = common.createElement('div', {className: 'fp-engine fp-audio-engine'}),
    artist = common.createElement('p', {className: 'fp-artist'}),
    track = common.createElement('p', {className: 'fp-track'}),
    album = common.createElement('p', {className: 'fp-album'}),
    info = common.createElement('div', {className: 'fp-info'});
info.appendChild(artist);
info.appendChild(track);
info.appendChild(album);
ui.appendChild(info);
ui.appendChild(t);

engine = function(api, root) {
  var self = {};

  self.engineName = engineName;

  self.pick =  function(sources) {
    return sources.filter(function(one) {
      return engine.canPlay(one.type);
    })[0];
  };

  self.volume = function(level) {
    t.volume = level;
  };

  self.resume = function() {
    t.play();
  };

  self.pause = function() {
    t.pause();
  };

  self.seek = function(to) {
    t.currentTime = to;
  };

  self.load = function(video) {
    bean.off(t,'.ae');
    common.prepend(common.find('.fp-player', root)[0], ui);

    bean.on(t, 'loadeddata.ae', function() {
      video.duration = t.duration;
      api.trigger('ready', [api, video]);
    });

    bean.on(t, 'volumechange.ae', function() {
      api.trigger('volume', [api, t.volume]);
    });

    bean.on(t, 'playing.ae', function() {
      api.trigger('resume', [api]);
    });

    bean.on(t, 'pause.ae', function() {
      api.trigger('pause', [api]);
    });

    bean.on(t, 'timeupdate.ae', function() {
      console.log('tt', t.currentTime);
      api.trigger('progress', [api, t.currentTime]);
    });

    bean.on(t, 'seeked.ae', function() {
      console.log('t', t.currentTime);
      api.trigger('seek', [api, t.currentTime]);
    });

    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.addEventListener('load', function() {
      id3({
        file: this.response,
        type: id3.OPEN_FILE
      }, function(err, metadata) {
        if (!metadata) return;
        if (metadata.v2 && metadata.v2.image && metadata.v2.image.data) {
          var reader = new FileReader();
          reader.onloadend = function() {
            common.css(ui, 'background-image', 'url(' + reader.result + ')');
          };
          reader.readAsDataURL(new Blob([metadata.v2.image.data], {type: metadata.v2.image.mime}));
        }
        artist.innerHTML = metadata.artist;
        track.innerHTML = metadata.title;
        album.innerHTML = metadata.album;
      });
      t.src = video.src;
    });
    xhr.open('get', video.src, true);
    xhr.send();
  };

  return self;
};

engine.engineName = engineName;

engine.canPlay = function(type) {
  return !!t.canPlayType && t.canPlayType(type);
};

flowplayer.engines.push(engine);
