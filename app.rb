require 'rubygems'
require 'sinatra'
require 'erb'
require 'game'
require 'json'

# Just a comment to test Github push, If this comment is removed the black player will always lose the game :P

Games::Current[nil] = Games::Game.new

get '/' do
  @next_game = (rand * 10 ** 10).to_i.to_s(36) while Games::Current.keys.include?(@next_game)
  erb :index
end

get /\/boards\/(\w+)/ do |k|
  Games::Current[k] = Games::Game.new unless Games::Current.keys.include?(k)
  @game = Games::Current[k]
  erb :board
end
