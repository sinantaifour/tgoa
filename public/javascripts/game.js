var game = new function() {

  this.setup = function() {
    board.setup();
    this.setupPoller();
    board.loopOverBoard(function(i, u, e) {
      e.observe('click', this.onClick.bindAsEventListener(this, i, u));
    }.bind(this));
    moves.populateList();
    this.updateTurnLabel();
    board.render();
  };

  // ==== Events ====

  var move = [];

  this.onClick = function(ev, i, u) {
    ev.stop();
    if (!User.color) { return; }
    if (User.color != this.turn()) { return; }
    if (move.length == 0) {
      if (User.color == board.state[i][u]) {
        move[0] = [i, u];
        board.clearMarks();
        board.markLegal(i, u);
      }
    } else if (move.length == 1) {
      if (move[0][0] == i && move[0][1] == u) {
        move.clear();
        board.clearMarks();
      } else if (board.state[i][u] == User.color) {
        move[0] = [i, u];
        board.clearMarks();
        board.markLegal(i, u);
      } else if (board.state[i][u] == "m") {
        move[1] = [i, u];
        board.clearMarks(function() {
          board.moveCell(move[0], move[1], function() {
            board.markLegal(i, u);
          });
        }.bind(this));
      }
    } else if (move.length == 2) {
      if (board.state[i][u] == "m") {
        move[2] = [i, u];
        board.clearMarks(function() {
          board.setCell(i, u, "a");
        });
        this.sendMove(move);
        moves.appendMove(moves.moveArrayToString(move));
        this.updateTurnLabel();
        move.clear();
      }
    }
  };

  // ===== Information =====

  this.turn = function() {
    return moves.size() % 2 ? "b" : "w";
  };

  // ===== Communication =====

  this.sendMove = function(m) {
    // TODO: need to deal with errors
    var moveStr = moves.moveArrayToString(m);
    new Ajax.Request(window.location.pathname, {
      method: 'post',
      parameters: {'move': moveStr, 'ie': (new Date()).getTime()}
    });
  };

  this.setupPoller = function() { // (rewritten)
    new PeriodicalExecuter(function() {
      new Ajax.Request(window.location.pathname + "/" + moves.size(), {
        method: 'get', 
        onSuccess: function(transport) {
          this.updated(transport.responseText);
        }.bind(this)
      });
    }.bind(this), 3);
  };

  this.updated = function(responseText)  { // (rewritten)
    $A(responseText.evalJSON()).each(function(m) {
      moves.appendMove(m, true);
    }.bind(this));
    this.updateTurnLabel();
  };

  // ===== Rendering =====

  this.updateTurnLabel = function() { // TODO: move elsewhere?
    $('turnLabel').update("Turn : " + (this.turn() == "w" ? "White" : "Black" ));
  };

};
