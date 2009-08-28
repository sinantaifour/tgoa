module Games

  Current = {}

  class Game

    attr_reader :state

    def initialize
      @state = (0..9).map { (0..9).map { "" } }
      [[0, 3], [0, 6], [3, 0], [3, 9]].each { |t| @state[t[0]][t[1]] = "b" }
      [[6, 0], [6, 9], [9, 3], [9, 6]].each { |t| @state[t[0]][t[1]] = "w" }
    end

  end

end
