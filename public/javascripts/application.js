var Game = new function() {

  this.setup = function() {
    this.loopOverBoard(function(i, u, e) {
      e.observe('click', this.onClick.bindAsEventListener(this, i, u));
    });
  };

  this.render = function() {
    this.loopOverBoard(function(i, u, e) {
      var content = this.state[i][u] ? ('<img src="/images/' + this.state[i][u] + '.png" />') : '';
      if ((new Element("div").update(content.toString())).innerHTML != e.innerHTML) {
        e.update(content.toString());
      }
    });
  };

  this.onClick = function(ev, i, u) {
    this.removeMarks();
    this.markLegal(i, u);
    ev.stop();
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
      if (this.state[i][u] == "m") { this.state[i][u] = ""; }
    });
    this.render();
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

};
