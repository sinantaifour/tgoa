require 'rubygems'
require 'sinatra'
require 'erb'
require 'game'
require 'json'

Games::Current[nil] = Games::Game.new

get '/' do
  @next_game = (rand * 10 ** 10).to_i.to_s(36) while Games::Current.keys.include?(@next_game)
  erb :index
end

get /\/boards\/(\w+)\/(\d+)/ do |k, r|
  raise Sinatra::NotFound unless Games::Current.keys.include?(k)
  @game = Games::Current[k]
  return (@game.moves[r.to_i..-1] || []).to_json
end

get /\/boards\/(\w+)/ do |k|
  Games::Current[k] = Games::Game.new unless Games::Current.keys.include?(k)
  @game = Games::Current[k]

  # TODO: move this to a helper
  if request.cookies["identifier"]
    identifier = request.cookies["identifier"]
  else
    identifier = (rand * 10 ** 10).to_i.to_s(36)
    response.set_cookie("identifier", identifier)
  end

  @player = @game.players[identifier]
  if @player.nil? and @game.players.values.compact.length < 2
    @player = @game.players[identifier] = (["w", "b"] - @game.players.values.compact).first
  end

  erb :board
end

post /\/boards\/(\w+)/ do |k|
  # TODO: authenticate the user
  # TODO: need to deal with possible exceptions
  raise Sinatra::NotFound unless Games::Current.keys.include?(k)
  @game = Games::Current[k]
  @game.play(params[:move], @game.turn) # TODO: assumes correct color always, fix with user authentication
  return ""
end
