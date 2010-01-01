require 'pstore'

class Store

  @@store = PStore.new("store.db")

  class << self

    def set(k, v)
      @@store.transaction { @@store[k] = v }
    end

    def get(k)
      @@store.transaction { @@store[k] }
    end

  end
end
