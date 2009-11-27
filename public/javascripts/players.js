var players = new function() {

  this.info;
  this.myColor;
  this.winner;

  this.render = function() {
    var content;
    $A(["w", "b"]).each(function(c) {
      if (this.info.include(c)) {
        if (this.myColor == c) {
          content = new Element("a");
          content.href = "#";
          content.innerHTML = "(Leave)";
          content.observe("click", function(ev) {
            new Ajax.Request(window.location.pathname + "/leave", {
              method: 'get'
            });
            $("player" + c).update("...");
            ev.stop();
          });
        } else {
          content = "Occupied";
        }
      } else {
        if (this.myColor) {
          content = "Empty";
        } else {
          content = new Element("a");
          content.href = "#";
          content.innerHTML = "(Join)";
          content.observe("click", function(ev){
            new Ajax.Request(window.location.pathname + "/join/" + c, {
              method: 'get'
            });
            $("player" + c).update("...");
            ev.stop();
          });
        }
      }
      $("player" + c).update(content);
    }.bind(this));
    $$("#players .hasTurn").invoke("removeClassName", "hasTurn");
    if (this.winner) {
      $("player" + this.winner).addClassName("playerWinner");
      $("player" + $A(["w", "b"]).without(this.winner).first()).addClassName("playerLoser");
    } else {
      $("player" + this.turn()).addClassName("hasTurn");
    }
  };

  this.iHaveTurn = function() {
    return !this.winner && this.myColor && (this.myColor == this.turn());
  };

  this.turn = function() {
    return this.winner ? "" : (moves.size() % 2 ? "b" : "w");
  };

};
