var Game = new function() {

  this.move = [];

  this.setup = function() {
    this.setupPoller();
    this.loopOverBoard(function(i, u, e) {
      e.observe('click', this.onClick.bindAsEventListener(this, i, u));
    });
    $(this.moves).each(function(m) { this.appendMove(m); }.bind(this));
    this.render();
    this.updateTurnLabel();
  };

  this.onClick = function(ev, i, u) { // TODO: cleanup
    ev.stop();
    if (!User.color) { return; }
    if (User.color != this.turn()) { return; }
    if (this.move.length == 0) {
      if (User.color == this.state[i][u]) {
        this.move[0] = [i, u];
        this.removeMarks();
        this.markLegal(i, u);
      }
    } else if (this.move.length == 1) {
      if (this.move[0][0] == i && this.move[0][1] == u) {
        this.move.clear();
        this.removeMarks();
      } else if (this.state[i][u] == User.color) {
        this.move[0] = [i, u];
        this.removeMarks();
        this.markLegal(i, u);
      } else if (this.state[i][u] == "m") {
        this.move[1] = [i, u];
        this.state[i][u] = this.state[this.move[0][0]][this.move[0][1]];
        this.state[this.move[0][0]][this.move[0][1]] = "";
        this.removeMarks();
        this.markLegal(i, u);
        this.renderSpecific(this.move);
      }
    } else if (this.move.length == 2) {
      if (this.state[i][u] == "m") {
        this.move[2] = [i, u];
        this.state[i][u] = "a";
        this.removeMarks();
        this.renderSpecific(this.move);
        this.sendMove();
        this.move.clear();
      }
    }
  };

  // ===== Information =====

  this.turn = function() {
    return this.moves.length % 2 ? "b" : "w";
  };

  // ===== Communication =====

  this.sendMove = function() {
    // TODO: need to deal with errors
    var moveStr = this.moveArrayToString(this.move);
    new Ajax.Request(window.location.pathname, {
      method: 'post',
      parameters: {'move': moveStr, 'ie': (new Date()).getTime()}
    });
    this.moves.push(moveStr);
    this.appendMove(moveStr);
    this.updateTurnLabel();
  };

  this.setupPoller = function() {
    new PeriodicalExecuter(function() {
      new Ajax.Request(window.location.pathname + "/" + this.moves.length, {
        method: 'get', 
        onSuccess: function(transport) {
          var moves = transport.responseText.evalJSON();
          $A(moves).each(function(m) {
            this.moves.push(m);
            this.appendMove(m);
            var move = this.moveStringToArray(m);
            this.animateMove(move);
          }.bind(this));
          this.updateTurnLabel();
        }.bind(this)
      });
    }.bind(this), 3);
  };

  // ===== Rendering =====

  this.render = function() { // Renders the whole board, avoid using when possible.
    this.loopOverBoard(function(i, u, e) {
      var content = this.state[i][u] ? ('<img src="/images/' + this.state[i][u] + '.png" />') : '';
      e.update(content.toString());
    });
  };

  this.renderSpecific = function(arr) {
    $(arr).each(function(p) {
      var content = this.state[p[0]][p[1]] ? ('<img src="/images/' + this.state[p[0]][p[1]] + '.png" />') : '';
      this.getElement(p[0], p[1]).update(content.toString());
    }.bind(this));
  };

  this.appendMove = function(move) {
    $("moves").insert(move + "<br />");
  };

  this.animateMove = function(move) {
    this.state[move[1][0]][move[1][1]] = this.state[move[0][0]][move[0][1]];
    this.state[move[0][0]][move[0][1]] = "";
    this.state[move[2][0]][move[2][1]] = "a";
    var img = this.getElement(move[0][0], move[0][1]).childNodes[0];
    img.setStyle({'position': 'relative'});
    var dirs = {};
    if (move[0][0] != move[1][0]) {
      dirs['top'] = [0, (move[1][0] - move[0][0]) * 44];
    }
    if (move[0][1] != move[1][1]) {
      dirs['left'] = [0, (move[1][1] - move[0][1]) * 44];
    }
    (new Fx.Styles(img, {
      transition: Fx.Transitions.quadOut,
      onComplete: function() {
        this.renderSpecific([move[0], move[1]]);
        var img = this.getElement(move[2][0], move[2][1]).update('<img src="/images/a.png" />').childNodes[0];
        (new Fx.Opacity(img, {
          transition: Fx.Transitions.quadOut,
          onComplete: function() {
            this.renderSpecific([move[2]]);
          }.bind(this)
        })).set(0).toggle();
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
          this.state[i][u] = "m";
          this.getElement(i, u).update('<img src="/images/m.png" />');
        }
      }.bind(this));
    }.bind(this));
  };

  this.removeMarks = function() {
    this.loopOverBoard(function(i, u, e) {
      if (this.state[i][u] == "m") {
        this.state[i][u] = "";
        e.update("");
      }
    });
  };

  this.updateTurnLabel = function() {
    $('turnLabel').update("Turn : " + (this.turn() == "w" ? "White" : "Black" ));
  };

  // ===== Helpers =====

  this.loopOverBoard = function(f) {
    $R(0, 9).each(function(i) {
      $R(0, 9).each(function(u) {
        (f.bind(this))(i, u, this.getElement(i, u));
      }.bind(this));
    }.bind(this));
  };

  this.getElement = function(i, u) {
    return $("cell" + ("0" + i).slice(0, 2) + ("0" + u).slice(0, 2));
  };

  this.moveArrayToString = function(arr) {
    var sep = ["-", "/", ""]
    var coordinate = function(p) {
      return String.fromCharCode(p[1] + 97) + String(10 - p[0]);
    };
    return $A(arr).map(function(p) { return coordinate(p) + sep.shift(); }).join("");
  };

  this.moveStringToArray = function(str) {
    var m = str.match(/([a-j](10|[1-9]))-([a-j](10|[1-9]))\/([a-j](10|[1-9]))/);
    if (!m) { return; }
    return $A([1, 3, 5]).map(function(i) {
      return [10 - parseInt(m[i].substr(1), 10), m[i].charCodeAt(0) - 97];
    });
  };

};
