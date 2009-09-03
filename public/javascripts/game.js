var Game = new function() {

  this.move = [];

  this.setup = function() {
    this.loopOverBoard(function(i, u, e) {
      e.observe('click', this.onClick.bindAsEventListener(this, i, u));
    });
  };

  this.onClick = function(ev, i, u) {
    ev.stop();
    if (!User.color) { return; }
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

  // ===== Communication =====

  this.sendMove = function() {
    // TODO: need to deal with errors
    new Ajax.Request(window.location.pathname, {
      method: 'post',
      parameters: {'move': this.moveArrayToString(this.move), 'ie': (new Date()).getTime()}
    });
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
    // TODO: implement me
  };

};
