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
  
  @visitor = false
  @player = "visitor"
  if ! @game.white_exists || request.cookies["game#{k}"] == "w"
    @player = "w"
    set_cookie("game#{k}", "w")
    @game.white_exists = true

  elsif ! @game.black_exists || request.cookies["game#{k}"] == "b"
    @player = "b"
    set_cookie("game#{k}", "b")
    @game.black_exists = true

  else
    @visitor = true
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
