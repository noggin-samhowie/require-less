define(['require'], function(require) {
  
  var lessAPI = {};
  var lessRequirements = [];
  
  lessAPI.pluginBuilder = './less-builder';
  
  if (typeof window == 'undefined') {
    lessAPI.load = function(n, r, load) { load(); };
    return lessAPI;
  }
  
  lessAPI.normalize = function(name, normalize) {
    if (name.substr(name.length - 5, 5) == '.less'){
      name = name.substr(0, name.length - 5);
    }

    name = normalize(name);

    return name;
  };
  
  var head = document.getElementsByTagName('head')[0];

  var base = document.getElementsByTagName('base');
  base = base && base[0] && base[0] && base[0].href;
  var pagePath = (base || window.location.href.split('#')[0].split('?')[0]).split('/');
  pagePath[pagePath.length - 1] = '';
  pagePath = pagePath.join('/');

  var styleCnt = 0;
  var curStyle;
  lessAPI.inject = function(css) {
    if (styleCnt < 31) {
      curStyle = document.createElement('style');
      curStyle.type = 'text/css';
      head.appendChild(curStyle);
      styleCnt++;
    }
    if (curStyle.styleSheet) {
      curStyle.styleSheet.cssText += css;
    } else {
      curStyle.appendChild(document.createTextNode(css));
    }
  };

  lessAPI.load = function(lessId, req, load, config) {
    window.less = config.less || {
      relativeUrls: true
    };
    window.less.env = 'development';
    window.lessRequirements = lessRequirements;

    require(['./normalize'], function(normalize) {

      var fileUrl = req.toUrl(lessId + '.less');
      fileUrl = normalize.absoluteURI(fileUrl, pagePath);
      var requirement = fileUrl;
      if (lessRequirements.indexOf(requirement) === -1) {
        lessRequirements.push(requirement);
      }
      load();

    });
  };

  lessAPI.bootstrap = function() {
    require(['./lessc', './normalize'], function(lessc, normalize) {

      var base = document.getElementsByTagName('base');
      base = base && base[0] && base[0] && base[0].href;
      var pagePath = (base || window.location.href.split('#')[0].split('?')[0]).split('/');
      pagePath[pagePath.length - 1] = '';
      pagePath = pagePath.join('/');

      var toParse = window.lessRequirements.reduce(function(out, fileUrl) {
          return out += '@import "' + fileUrl + '";';
      }, '');

      var parser = new lessc.Parser(window.less);
      parser.parse(toParse, function(err, tree) {
        var css;
          if (err) {
              console.warn(err);
              console.log(toParse);
              return;
          }
          css = tree.toCSS(window.less);
          lessAPI.inject(css);
          console.log('pagePath: ', pagePath);
      });

    });
  };
  
  return lessAPI;
});
