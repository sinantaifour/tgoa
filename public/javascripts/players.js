var players = new function() {

  this.info;
  this.myColor;

  this.render = function() {
    var content;
    $A(["w", "b"]).each(function(c) {
      if (this.info.include(c)) {
        if (this.myColor == c) {
          content = "You";
        } else {
          content = "Someone";
        }
      } else {
        content = new Element("a");
        content.href = "#";
        content.innerHTML = "(Join)";
        content.observe("click", function(ev){
          new Ajax.Request(window.location.pathname + "/join/" + c, {
            method: 'get'
          });
          ev.stop();
        });
      }
      $("player" + c).update(content);
    }.bind(this));
  };

  this.iHaveTurn = function() {
    return this.myColor && (this.myColor == (moves.size() % 2 ? "b" : "w"));
  };

};
