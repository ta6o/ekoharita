#coding: utf-8

require 'sinatra'
require 'unidecoder'
require 'json'
require 'haml'
require 'csv'
require 'pp'
require 'net/ftp'

def fetch_content
  require "google_drive"
  api_id = "753249404251-c0gce19t01sgikh28uspc98g7cfl7oqf.apps.googleusercontent.com"
  api_key = "sLs8OOc_zcsPyWWllTMItH4L"
  session = GoogleDrive.saved_session("./stored_token.json", nil, api_id, api_key)
  file = session.spreadsheet_by_key("12mVbD5X1N9E2H5LDvscpxSOIossxI3j6Mnin5QbieCk")
  file.worksheets.each do |ws|
    CSV.open("#{Dir.pwd}/lib/#{ws.title}.csv","w") do |csv|
      ws.rows.each do |row|
        csv << row
      end
    end
  end
  parse_content
  html = Haml::Engine.new(IO.read("#{Dir.pwd}/views/index.haml")).render
  File.open("#{Dir.pwd}/public/index.html","w") {|f| f << html}
  ftp = Net::FTP.new("ekoharita.org")
  ftp.passive = true
  ftp.login("dunya2017ocak@ekoharita.org", "~=.#^PU~7waBebKXm4")
  ftp.puttextfile("#{Dir.pwd}/public/index.html")
  #ftp.puttextfile("#{Dir.pwd}/public/javascripts/app.js")
  ftp.close
  true
end

def parse_content
  file = File.read("#{Dir.pwd}/lib/places.csv")
  file.gsub! /(\u00a0|_x000d_)/, ' '
  csv = CSV.parse file
  header = csv.shift
  slugs = []
  $content = []
  $cats = {"ekolojik-yerleske"=>[],"kent-bostani"=>[],"kolektif-inisiyatif"=>[],"ekolojik-pazar-gida-toplulugu"=>[],"botanik-bahce"=>[],"alternatif-okul-egitim"=>[],"ciftlik-eko-girisim"=>[],"stk"=>[],"alternatif-ekonomiler"=>[],"bilgi-bankasi-blog"=>[],"balkon-bahce"=>[],"muze"=>[],"milli-park"=>[],"ekolojik-mimari"=>[],"ekoturizm-kamp"=>[]}
  csv.each_with_index do |row,ind|
    row.map! &:strip
    x = {}
    row.each_with_index do |c,i|
      x[header[i]] = c
    end
    $cats[x["category"].slug] << x["id"]
    x["icon"] = x["category"].to_ascii.downcase.gsub(/(-|\s|&|_)+/,"_")
    x["id"] = ind+1
    $content << x
  end
  nil
end

get "/?" do 
  index = haml :index
  File.open("#{Dir.pwd}/public/index.html","w") {|f| f << index}
  return index
end

get "/update-me" do 
  if fetch_content
    return "tamam"
  else
    return "sorun oldu"
  end
end

not_found do 
  redirect to "/"
end

error do 
  return haml :error
end

class String
  def slug
    self.strip.to_ascii.downcase.gsub(/('|\([^\)]+\))+/,"").gsub(/\W+/,"-").sub(/(\d|\s|,)+$/,"").gsub(/(^-|-$)/,"")
  end
end

$content = []
$cats = {}
$cnms = {"ekolojik-yerleske"=>"Ekolojik yerleşke","kent-bostani"=>"Kent bostanı","kolektif-inisiyatif"=>"Kolektif & İnisiyatif","ekolojik-pazar-gida-toplulugu"=>"Ekolojik pazar & Gıda topluluğu","botanik-bahce"=>"Botanik bahçe","alternatif-okul-egitim"=>"Alternatif okul & Eğitim","ciftlik-eko-girisim"=>"Çiftlik & Eko-girişim","stk"=>"STK","alternatif-ekonomiler"=>"Alternatif ekonomiler","bilgi-bankasi-blog"=>"Bilgi bankası & Blog","balkon-bahce"=>"Balkon - Bahçe","muze"=>"Müze","milli-park"=>"Milli park","ekolojik-mimari"=>"Ekolojik mimari","ekoturizm-kamp"=>"Ekoturizm - Kamp"}
$title = "Ekoloji Haritası"
$siteurl = "https://www.ekoharita.org"
$description = "Türkiye'nin ekoloji haritası"

parse_content

