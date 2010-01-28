require 'rubygems'
require 'sinatra'
require 'erb'
require 'json'
require 'safe_code'
require 'store'
require 'game'

Games::Current[nil] = Games::Game.new(nil) # TODO: might be no longer needed

helpers do 
  def identifier
    if request.cookies["identifier"]
      res = request.cookies["identifier"]
    else
      res = "ai-"
      res = (rand * 10 ** 10).to_i.to_s(36) while res[0..2] == "ai-"
      response.set_cookie("identifier", res)
    end
    res
  end
  def filter_players(ps)
    ps.map { |k, v| [k, (v[0..2] == "ai-") ? v[3..-1] : ""] }.inject({}) { |h, (k, v)| h[k] = v; h }
  end
end

get '/' do
  @game_count = Games::Current.keys.length
  erb :index
end

get '/boards/new' do
  next_game = (rand * 10 ** 10).to_i.to_s(36) while Games.retrieve(next_game)
  redirect "/boards/#{next_game}"
end

get /\/boards\/(\w+)$/ do |k|
  @game = Games.retrieve(k)
  @game = Games::Current[k] = Games::Game.new(k) unless @game
  @identifier = identifier
  @game.housekeeping(@identifier)
  erb :board
end

post /\/boards\/(\w+)$/ do |k|
  @game = Games.retrieve(k)
  raise Sinatra::NotFound unless @game
  @player = @game.players.find { |k, v| v == identifier }.to_a[0]
  @game.play(params[:move], @player)
  @game.set_winner
  return ""
end

get /\/boards\/(\w+)\/(\d+)/ do |k, r| # TODO: a hash is sent at each request. Only send when necessary
  @game = Games.retrieve(k)
  raise Sinatra::NotFound unless @game
  @game.housekeeping(identifier)
  moves = @game.moves[r.to_i..-1] || []
  my_color = @game.players.find { |k, v| v == identifier }.to_a[0]
  return {:moves => moves, :players => filter_players(@game.players), :myColor => my_color, :winner => @game.winner}.to_json
end

post /\/boards\/(\w+)\/join\/(w|b)\/?(\w+)?/ do |k, c, ai|
  @game = Games.retrieve(k)
  raise Sinatra::NotFound unless @game
  @game.join(c, ai ? "ai-" + ai : identifier)
  return ""
end

post /\/boards\/(\w+)\/leave/ do |k|
  @game = Games.retrieve(k)
  raise Sinatra::NotFound unless @game
  @game.leave(identifier)
  return ""
end
