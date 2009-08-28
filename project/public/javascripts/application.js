var Game = new function() {

  this.setup = function() {
    $R(0, 9).each(function(i) {
      $R(0, 9).each(function(u) {
        this.getElement(i, u).observe('click', this.onClick.bindAsEventListener({'i': i, 'u': u}));
      }.bind(this));  
    }.bind(this));
  };

  this.render = function() {
    $A(this.state).each(function(r, i) {
      $A(r).each(function(c, u) {
        if (c) { this.getElement(i, u).update('<img src="/images/' + c + '.png" />'); }
      }.bind(this));
    }.bind(this));
  };

  this.getElement = function(i, u) {
    return $("cell" + ("0" + i).slice(0, 2) + ("0" + u).slice(0, 2));
  };

  this.onClick = function(ev) {
    alert(this.i + " " + this.u);
  };

};
