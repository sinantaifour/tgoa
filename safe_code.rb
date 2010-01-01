require 'json'
require 'net/http'
require 'cgi'

class SafeCode

  class SafeCodeError < StandardError; end

  LANGUAGES = {:ruby => 17, :python => 4, :c => 11}

  class << self

    def save(lang, code)
      raise SafeCodeError, "Invalid language" unless LANGUAGES.keys.include?(lang)
      Net::HTTP.post_form(URI.parse("http://ideone.com/ideone/Index/submit/"), {'lang' => LANGUAGES[lang], 'run' => 0, 'file' => code }).header['location'][1..-1]
    end

    def run(id, input)
      res = JSON.load(Net::HTTP.post_form(URI.parse("http://ideone.com/submit/parent/#{id}"),{'input' => input}).body)
      raise SafeCodeError, "Posting of input failed." if res['status'] != 'ok'
      loc = res['link']
      i = 0
      begin
        sleep 1 if i > 0
        res = JSON.load(Net::HTTP.post_form(URI.parse("http://ideone.com/ideone/Index/view/id/#{loc}/ajax/1"),{}).body)
        i += 1
      end while res['result'] != "15" and i < 4
      raise SafeCodeError, "Timed out while waiting for code result." if i == 4
      err = res['inouterr'].match(/<label>stderr:<\/label>.*?<pre.*?>(.*?)<\/pre>/m)
      if err
        err[1]
      else
        out = res['inouterr'].match(/<label>output:<\/label>.*?<pre.*?>(.*?)<\/pre>/m)
        raise SafeCodeError, "Error parsing output." unless out
        out[1]
      end
    end

  end
end
