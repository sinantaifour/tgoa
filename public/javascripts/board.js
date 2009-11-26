/*
  The board is responsible for rendering the board with the correct images, and
  creating the related animations. The images are preloaded for better
  performance.
*/
var board = new function() {

  this.state; // First coordinate for row, second for column

  this.setup = function() {
    this.cells = $R(0, 9).map(function(i) { // Cache references to all cells in table
      return $R(0, 9).map(function(u) {
        return $("cell" + ("0" + i).slice(0, 2) + ("0" + u).slice(0, 2));
      });
    });
    this.images = $A(["m", "w", "b", "a"]).inject({}, function(h, i) { // Create a pool of preloaded images
      h[i] = $R(0, {'m': 39, 'w': 3, 'b': 3, 'a': 99}[i]).map(function() {
        var img = new Image();
        img.src = "/images/" + i + ".png";
        img.rel = i;
        return img;
      });
      return h;
    });
  }

  this.loopOverBoard = function(f) {
    $R(0, 9).each(function(i) {
      $R(0, 9).each(function(u) {
        (f.bind(this))(i, u, this.cells[i][u]);
      }.bind(this));
    }.bind(this));
  };

  this.setCell = function(i, u, c, onComplete) {
    this.state[i][u] = c; // Set state before animating
    if (c) {
      this.cells[i][u].update(this.images[c].pop());
      var img = this.cells[i][u].childNodes[0];
      (new Fx.Opacity(img, {
        transition: Fx.Transitions.quadOut,
        onComplete: function() {
          if (onComplete) { onComplete(); }
        }
      })).set(0).toggle();
    } else {
      var img = this.cells[i][u].childNodes[0];
      if (!img) { return; }
      (new Fx.Opacity(img, {
        transition: Fx.Transitions.quadOut,
        onComplete: function() {
          img.remove();
          this.images[img.rel].push(img); // Return the image to the pool
          if (onComplete) { onComplete(); }
        }.bind(this)
      })).set(1).toggle();
    }
  };

  this.moveCell = function(f, t, onComplete) {
    if (!this.state[f[0]][f[1]] || this.state[t[0]][t[1]]) { return; }
    this.state[t[0]][t[1]] = this.state[f[0]][f[1]]; // Set state before animating
    this.state[f[0]][f[1]] = "";
    var img = this.cells[f[0]][f[1]].childNodes[0];
    img.setStyle({'position': 'relative'});
    var dirs = {};
    if (f[0] != t[0]) { dirs['top'] = [0, (t[0] - f[0]) * 44]; }
    if (f[1] != t[1]) { dirs['left'] = [0, (t[1] - f[1]) * 44]; }
    (new Fx.Styles(img, {
      transition: Fx.Transitions.quadOut,
      onComplete: function() {
        img.remove();
        img.setStyle({'top': '0px', 'left': '0px'});
        this.cells[t[0]][t[1]].update(img);
        if (onComplete) { onComplete(); }
      }.bind(this)
    })).custom(dirs);
  };

  this.markLegal = function(i, u) {
    var oi = i, ou = u;
    $A([-1, 0, 1]).each(function(di) {
      $A([-1, 0, 1]).each(function(du) {
        if (di == 0 && du == 0) { return; }
        i = oi; u = ou;
        while($R(0, 9).include(i+=di) && $R(0, 9).include(u+=du) && this.state[i][u] == "") {
          this.setCell(i, u, "m");
        }
      }.bind(this));
    }.bind(this));
  };

  this.clearMarks = function(onComplete) {
    var toClear = 0;
    var cleared = 0;
    this.loopOverBoard(function(i, u, e) {
      if (this.state[i][u] == "m") {
        toClear++;
        this.setCell(i, u, "", function() {
          cleared++;
          if (cleared == toClear && onComplete) { onComplete(); }
        });
      }
    });
  };

  this.render = function() {
    this.loopOverBoard(function(i, u, e) {
      var img = e.childNodes[0];
      if (img) {
        img.remove();
        this.images[img.rel].push(img); // Return the image to the pool
      }
      var content = this.state[i][u] ? this.images[this.state[i][u]].pop() : '';
      e.update(content);
    }.bind(this));
  };

};
