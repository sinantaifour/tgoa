module Computers

  IDs = {"ai-tester" => "cFFSe8SJ", "ai-vandale" => "z0bSjz5f"}

  class ComputerError < StandardError; end

  class << self 

    def execute(game, name, color)
      id = IDs[name] # TODO: what if it doesn't exist?
      Thread.new do # TODO: need to join this thread somewhere
        ans = SafeCode.run(id, dump_info(game))
        p "*" * 100 # TODO: for debugging only, remove later
        p ans
        ans = computer_to_human(read_answer(ans))
        game.play(ans, color)
      end
    end

    def dump_info(game)
      h = {"" => "0", "a" => "1", "w" => "2", "b" => "3"}
      s = game.state.map { |a| a.map { |v| h[v] }.join("") }.join("\n") + "\n"
      s += game.moves.length.to_s + "\n"
      s += game.moves.map { |m| human_to_computer(m) }.join("\n")
    end

    def read_answer(ans)
      ans.split("\n").reject { |l| l.length == 0 || l[0].chr == "#" }[0]
    end

    def human_to_computer(h)
      m = h.downcase.match(/([a-j](10|[1-9]))-([a-j](10|[1-9]))\/([a-j](10|[1-9]))/)
      [1, 3, 5].map { |i| [m[i][0] - ?a, m[i][1..-1].to_i - 1] }.flatten.map(&:to_s).join
    end

    def computer_to_human(c)
      raise ComputerError, "Returned string is too short or too long" if c.length != 6
      raise ComputerError, "Returned string contains illegal characters" if !c.match(/\d{6}/)
      r = c.split("").zip((0..5).to_a).map do |n, i|
        (i % 2 == 0) ? (n.to_i + ?a).chr : (n.to_i + 1)
      end
      "#{r[0]}#{r[1]}-#{r[2]}#{r[3]}/#{r[4]}#{r[5]}"
    end

  end

end
