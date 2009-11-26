module Games

  Current = {}

  class GameError < StandardError; end

  class Game

    attr_reader :state # First coordinate for rows, second for columns, state[0][0] represents the upper left corner.
    attr_reader :turn, :moves
    attr_accessor :players

    def initialize
      @state = (0..9).map { (0..9).map { "" } }
      [[0, 3], [0, 6], [3, 0], [3, 9]].each { |t| @state[t[0]][t[1]] = "b" }
      [[6, 0], [6, 9], [9, 3], [9, 6]].each { |t| @state[t[0]][t[1]] = "w" }
      @turn = "w"
      @moves = []
      @players = {}
    end

    def play(move_str, color)
      # Check turn
      raise GameError, "Incorrect player turn" unless @turn == color
      # Parse string
      raise GameError, "Must pass move" unless move_str
      raise GameError, "Unable to parse move string" unless m = move_str.downcase.match(/([a-j](10|[1-9]))-([a-j](10|[1-9]))\/([a-j](10|[1-9]))/)
      move = [1, 3, 5].map { |i| [10 - m[i][1..-1].to_i, m[i][0] - ?a] } # move here contains an array of 3 points, with coordinates suitable for state.
      # Check move
      raise GameError, "Incorrect beginning of move" unless @state[move[0][0]][move[0][1]] == @turn
      raise GameError, "Invalid move" unless valid_pair(move[0], move[1]) and valid_pair(move[1], move[2], move[0])
      # Apply move
      @state[move[1][0]][move[1][1]] = @state[move[0][0]][move[0][1]]
      @state[move[0][0]][move[0][1]] = ""
      @state[move[2][0]][move[2][1]] = "a"
      @moves << move_str
      @turn = (["b", "w"] - [@turn]).first
    end

    private

    # A pair of points is valid if the two points lie inside the board, are on
    # a horizontal, vertical or diagonal line, and there are nothing between
    # the two points, including the destination.
    def valid_pair(p1, p2, ignoring = nil)
      return false unless [p1, p2].map { |p| p.length }.count(2) == 2
      return false unless [p1, p2].flatten.map { |c| (0..9).include? c }.all?
      d = p1.zip(p2).map { |t| t[1] - t[0] }
      return false unless (d[0] * d[1] == 0 and d[0] + d[1] != 0) or d[0].abs == d[1].abs
      d.map! { |v| v < 0 ? -1 : v == 0 ? 0 : 1 }
      pt = p1
      while pt != p2
        pt = pt.zip(d).map { |t| t[0] + t[1] }
        return false unless @state[pt[0]][pt[1]] == "" or pt == ignoring
      end
      return true
    end

  end

end
