var moves = new function() {

  this.movesArray;

  this.size = function() {
    return this.movesArray.length;
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

  this.appendMove = function(str, animate) {
    this.movesArray.push(str);
    if (animate) {
      var m = this.moveStringToArray(str);
      board.moveCell(m[0], m[1], function() {
        board.setCell(m[2][0], m[2][1], "a");
      });
    }
    $("moves").insert(str + "<br />");
  };

  this.populateList = function() {
    $("moves").update($A(this.movesArray).map(function(m) { return m + "<br />" }).join(""));
  };

};



