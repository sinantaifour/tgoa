module Games

  Current = {}

  def self.retrieve(id)
    res = Current[id]
    res ||= Store.get("game_#{id}")
    Current[id] = res
  end

  class GameError < StandardError; end

  class Game

    attr_reader :state # First coordinate for rows, second for columns, state[0][0] represents the upper left corner.
    attr_reader :turn, :moves
    attr_reader :winner
    attr_accessor :players

    def initialize(id)
      @id = id
      @state = (0..9).map { (0..9).map { "" } }
      [[0, 3], [0, 6], [3, 0], [3, 9]].each { |t| @state[t[0]][t[1]] = "b" }
      [[6, 0], [6, 9], [9, 3], [9, 6]].each { |t| @state[t[0]][t[1]] = "w" }
      @turn = "w"
      @moves = []
      @players = {}
      @last_update = {}
      @winner = nil
    end

    def join(color, identifier)
      raise GameError, "Seat is not empty" if @players[color]
      raise GameError, "Player already in the game" if identifier[0..2] != "ai-" and @players.values.include?(identifier)
      @players[color] = identifier
      @last_update.delete(color)
      if @players[@turn][0..2] == "ai-"
        Computers.execute(self, @players[@turn], @turn)
      end
    end

    def leave(identifier)
      @players.reject! { |k, v| v == identifier }  
    end

    def housekeeping(identifier) # TODO: might need a lock here
      @players.reject! { |k, v| @last_update[k] and (@last_update[k] + 20 < Time.now) and @players[k][0..2] != "ai-" }
      @players.each { |k, v| @last_update[k] = Time.now if v == identifier }
    end

    def play(move_str, color)
      raise GameError, "Game is over" if @winner
      # Check turn
      raise GameError, "Incorrect player turn" unless @turn == color
      # Parse string
      raise GameError, "Must pass move" unless move_str
      raise GameError, "Unable to parse move string" unless m = move_str.downcase.match(/([a-j](10|[1-9]))-([a-j](10|[1-9]))\/([a-j](10|[1-9]))/)
      move = [1, 3, 5].map { |i| [m[i][1..-1].to_i - 1, m[i][0] - ?a] } # move here contains an array of 3 points, with coordinates suitable for state.
      # Check move
      raise GameError, "Incorrect beginning of move" unless @state[move[0][0]][move[0][1]] == @turn
      raise GameError, "Invalid move" unless valid_pair(move[0], move[1]) and valid_pair(move[1], move[2], move[0])
      # Apply move
      @state[move[1][0]][move[1][1]] = @state[move[0][0]][move[0][1]]
      @state[move[0][0]][move[0][1]] = ""
      @state[move[2][0]][move[2][1]] = "a"
      @moves << move_str
      @turn = (["b", "w"] - [@turn]).first
      if @players[@turn][0..2] == "ai-"
        Computers.execute(self, @players[@turn], @turn)
      end
      @turn
    end

    def set_winner
      @winner = who_won?
    end

    (self.instance_methods - Object.new.methods).each do |im|
      alias_method :"#{im}_old", im.to_sym
      define_method im.to_sym do |*args|
        r = send(:"#{im}_old", *args)
        Store.set("game_#{@id}", self)
        r
      end
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

    # Divides the board into a set of totally separate regions. Returns an array
    # of hashes, each hash counts the instances of piece in that region.
    def regionize
      empty = (0..9).map { |i| (0..9).map { |u| [i, u] } }.flatten(1).reject { |(i, u)| @state[i][u] == "a" }.inject({}) { |h, e| h[e] = true; h }
      regions = []
      until empty.keys.empty? do
        region = {"" => 0, "w" => 0, "b" => 0}
        to_check = []
        to_check << empty.keys[0]
        empty.delete(to_check.last)
        until to_check.empty? do
          current_cell = to_check.pop
          temp = neighbors(current_cell).select { |p| empty[p] }
          temp.each { |p| empty.delete(p) }
          to_check.concat(temp)
          region[@state[current_cell[0]][current_cell[1]]] += 1
        end
        regions << region
      end
      regions
    end

    # Give a point, this function returns and array of points that are inside
    # the board.
    def neighbors(p)
      [-1, 0, 1].inject([]) do |res, i|
        [-1, 0, 1].inject(res) do |res, u|
          next res if i == 0 and u == 0
          if p[0] + i >= 0 and p[0] + i <= 9 and p[1] + u >= 0 and p[1] + u <= 9
            res << [p[0] + i, p[1] + u]
          end
          res
        end
      end
    end

    def who_won?
      # Check out if any player can't do moves anymore
      positions = (0..9).inject({"w" => [], "b" => []}) do |ha, i|
        (0..9).inject(ha) do |h, u|
          h[@state[i][u]] << [i, u] if ["w", "b"].include?(@state[i][u])
          h
        end
      end
      ["w", "b"].each do |c|
        if positions[c].map { |p| neighbors(p) }.flatten(1).select { |p| @state[p[0]][p[1]] == "" }.empty?
          return (["w", "b"] - [c]).first
        end
      end
      # Check out if the game is divided into clear regions ending the game
      regions = regionize
      tally = {"w" => 0, "b" => 0}
      regions.each do |r|
        return nil if r["w"] > 0 and r["b"] > 0
        tally["w"] += r[""] if r["w"] > 0
        tally["b"] += r[""] if r["b"] > 0
      end
      if tally["w"] > tally["b"]
        "w"
      elsif tally["b"] > tally["w"]
        "b"
      else
        ["w", "b"] - [@turn]
      end
    end

  end

end
