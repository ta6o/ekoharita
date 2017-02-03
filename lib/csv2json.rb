require 'csv'
require 'json'
require 'pp'

header = []
result = {}
cins = {"Toplam"=>0,"Erkek"=>2,"Kız"=>1}

CSV.open("./example.csv").each_with_index do |row, ind|
  if ind == 0
    header = row.map &:strip
  else
    result[row[0]] = {} unless result.has_key?(row[0])
    result[row[0]][cins[row[2]]] = {}
    row.each_with_index do |cell, i|
      next if i < 3
      result[row[0]][cins[row[2]]][i] = row[i]
    end
  end
end
result["H"] = header

puts result.to_json.gsub(/"([\d\.]+)",/,'\1,').gsub(/"([\d\.]+)"}/,'\1}')
#puts JSON.pretty_generate(result)
