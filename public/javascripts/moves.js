var moves = new function() {

  this.movesArray;

  this.size = function() {
    return this.movesArray.length;
  };

  this.moveArrayToString = function(arr) {
    var sep = ["-", "/", ""]
    var coordinate = function(p) {
      return String.fromCharCode(p[1] + 97) + String(p[0] + 1);
    };
    return $A(arr).map(function(p) { return coordinate(p) + sep.shift(); }).join("");
  };

  this.moveStringToArray = function(str) {
    var m = str.match(/([a-j](10|[1-9]))-([a-j](10|[1-9]))\/([a-j](10|[1-9]))/);
    if (!m) { return; }
    return $A([1, 3, 5]).map(function(i) {
      return [parseInt(m[i].substr(1), 10) - 1, m[i].charCodeAt(0) - 97];
    });
  };

  this.appendMove = function(str, animate) {
    this.movesArray.push(str);
    if (animate) {
      var m = this.moveStringToArray(str);
      board.moveCell(m[0], m[1], function() {
        board.setCell(m[2][0], m[2][1], "a");
      });
    }
    this.addToMovesList(str);
  };

  this.addToMovesList = function(str) {
    var div = new Element("div");
    div.innerHTML = str;
    div.observe("mouseover", function(ev) {
      var m = this.moveStringToArray(str);
      board.cells[m[0][0]][m[0][1]].addClassName("highlightedCell");
      board.cells[m[1][0]][m[1][1]].addClassName("highlightedCell");
      board.cells[m[2][0]][m[2][1]].addClassName("highlightedCell");
      ev.stop();
    }.bind(this));
    div.observe("mouseout", function(ev) {
      $$(".highlightedCell").invoke("removeClassName", "highlightedCell");
      ev.stop();
    });
    $("moves").insert(div);
    $("moves").scrollTop = $("moves").scrollHeight
  };

  this.populateList = function() {
    $("moves").update("");
    $A(this.movesArray).each(function(m) {
      this.addToMovesList(m);
    }.bind(this));
  };

};



