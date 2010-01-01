require 'rubygems'
require 'sinatra'
require 'erb'
require 'json'
require 'safe_code'
require 'store'
require 'game'

Games::Current[nil] = Games::Game.new

helpers do 
  def identifier
    if request.cookies["identifier"]
      res = request.cookies["identifier"]
    else
      res = (rand * 10 ** 10).to_i.to_s(36)
      response.set_cookie("identifier", res)
    end
    res
  end
end

get '/' do
  @game_count = Games::Current.keys.length
  erb :index
end

get '/boards/new' do
  next_game = (rand * 10 ** 10).to_i.to_s(36) while Games::Current.keys.include?(next_game)
  redirect "/boards/#{next_game}"
end

get /\/boards\/(\w+)$/ do |k|
  Games::Current[k] = Games::Game.new unless Games::Current.keys.include?(k)
  @game = Games::Current[k]
  @identifier = identifier
  @game.housekeeping(@identifier)
  erb :board
end

post /\/boards\/(\w+)$/ do |k|
  raise Sinatra::NotFound unless Games::Current.keys.include?(k)
  @game = Games::Current[k]
  @player = @game.players.find { |k, v| v == identifier }.to_a[0]
  @game.play(params[:move], @player)
  @game.set_winner
  return ""
end

get /\/boards\/(\w+)\/(\d+)/ do |k, r| # TODO: a hash is sent at each request. Only send when necessary
  raise Sinatra::NotFound unless Games::Current.keys.include?(k)
  @game = Games::Current[k]
  @game.housekeeping(identifier)
  moves = @game.moves[r.to_i..-1] || []
  my_color = @game.players.find { |k, v| v == identifier }.to_a[0]
  return {:moves => moves, :players => @game.players.keys, :myColor => my_color, :winner => @game.winner}.to_json
end

get /\/boards\/(\w+)\/join\/(w|b)/ do |k, c| # TODO: can't join in both places, can't join if alreayd joined
  raise Sinatra::NotFound unless Games::Current.keys.include?(k)
  @game = Games::Current[k]
  @game.join(c, identifier)
  return ""
end

get /\/boards\/(\w+)\/leave/ do |k|
  raise Sinatra::NotFound unless Games::Current.keys.include?(k)
  @game = Games::Current[k]
  @game.leave(identifier)
  return ""
end
