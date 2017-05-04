var map;
var index;
var overlays = {};
var overids = {};
var fitBoundOpts = {animate:true};

function initMap(markerdata) {
  //console.log(markerdata)
  maxBounds = new L.LatLngBounds(new L.LatLng(30,10), new L.LatLng(52,52))
  map = L.map('map',{
    maxBounds: maxBounds
  })

  map.removeControl(map.zoomControl)
  L.control.zoom({position: 'topright'}).addTo(map);
  map.removeControl(map.attributionControl)
  L.control.attribution({position: 'bottomright',prefix: '<strong>ekoharita.org</strong> | <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'}).addTo(map);
  map.setMaxBounds(maxBounds);

  terrain.addTo(map)
  var lControl = L.control.layers(baseMaps, {}, {collapsed:true, position:"bottomright"}).addTo(map);

  var HomeButton = L.Control.extend({
    options: { position: 'topright' }, 
    onAdd: function (map) {
      var container = L.DomUtil.create('div', 'home-button leaflet-bar leaflet-control');
      L.DomEvent.addListener(container, 'click', getBack);
      return container;
    }
  });
  map.addControl(new HomeButton());
  $('.home-button').html('<div class=""><span/></div>')

  index = lunr(function () {
    this.field('name', {boost: 10})
    this.field('tags')
    this.field('description')
    this.ref('id')
  })

  markerLayer = L.featureGroup().addTo(map);
  polygonLayer = L.featureGroup().addTo(map);
  lineLayer = L.featureGroup().addTo(map);
  markers = {};
  $.each(markerdata, function(i,mark){
    index.add({id:i, name:mark.name, tags:mark.tags, description:mark.description})
    img = "<div style='height:0px'>&nbsp;</div>"
    if (mark.logo.length > 0){
      img = "<div style='float:left;max-width:200px;'><img src='"+mark.logo+"' style='max-width:100%;width:auto;height:100px;margin-right:12px'></div>"
    }
    url = "";
    if (mark.url.length > 0){
      url = "<a target='_blank' href='"+mark.url+"' style='text-decoration:none;'>Daha fazla bilgi</a> &nbsp; ";
    }
    popcontent = "<div class='clearfix'>"+img+"<div class='mod' data-slug='"+mark.slug+"'><h4 class='maplink' style='margin-top:0;'>"+mark.name+"</h4><p>"+mark.description.split(".")[0]+"...</p></div><br/><div style='position:absolute;bottom:10px;right:12px;font-size:11px;cursor: pointer;'>"+url+"<a class='zom' onclick='zom("+mark.id+")' data-slug='"+mark.id+"'>Yakınlaştır</a> &nbsp; <a class='gmaps' href='http://www.google.com/maps/place/"+mark.latitude+","+mark.longitude+"' target='_blank'>&nbsp; &nbsp; &nbsp;</a></div>";
    popcontent += '';
    var marker = L.marker([mark.latitude, mark.longitude],{
      icon: L.icon({iconUrl:"/harita/img/"+mark.icon+".svg",iconSize: [32,32]}),
      riseOnHover: true,
    }).addTo(markerLayer);
    marker.id = mark.id;
    marker.name = mark.name;
    marker.slug = mark.slug;
    marker.slug_en = mark.slug_en;
    marker.types = mark.types;
    pop = L.popup({autoPanPaddingTopLeft:[300,24]}).setContent(popcontent);
    marker.bindPopup(pop);
    //$(dom).find('a.zom').on('click tap',zom);
    markers[marker.id] = marker;
  });
  setTimeout(100,showAll);
  $('#cats').jScrollPane();
  resize();
}

function showAll() {
  map.fitBounds(markerLayer.getBounds());
}

function resize() {
  hh = parseInt($("#itms .cata").css("height"))+24;
  $("#itms").css("height",Math.min(window.innerHeight,hh));
  $('#cats, #itms > .cata').data("jsp").reinitialise();
}

$(window).on("resize",function(){resize();});

$("#cats li.cat").on("mouseenter",function(){$("#cats").css("width",340)});
$("#cats li.cat").on("mouseleave",function(){$("#cats").css("width",96)});
$(".cat").on("click tap",function(){
  slug = $(this).attr("id").replace(/^cat_/,"");
  title = $(this).find(".title").text().trim();
  if (slug=="arama") {
    html = "<div class='cata cat_"+slug+"'><a onclick='closeItems()' class='close-button'>x</a><p style='margin-top:5px;margin-bottom:6px;color:#455a64'>Arama</p><input type='text' id='search' style='width:114px;margin-right:-2px;padding-left:6px;margin-bottom:8px;'></input><button class='btn ara'>&gt;</button><br/><ul>"
  } else {
    html = "<div class='cata cat_"+slug+"'><a onclick='closeItems()' class='close-button'>x</a><h4>"+title+"</h4><hr/><ul>"
  }
  $.each($cats[slug],function(i,e) {
    item = $content[parseInt(e)-1];
    if (typeof item != "undefined") {
      html += "<li><a data-id='"+item.id+"' onclick='show("+item.id+");'>"+item.name+"</a></li>"
    }
  })
  html += "</ul></div>"
  $(this).find(".title").css("max-width",8).css("background-color","#efefef")
  $(this).find(".num").css("background-color","#efefef")
  $("#itms").hide();
  $("#itms").html(html);
  map.closePopup();
  $("#itms").slideDown(function(){
    hh = parseInt($("#itms .cata").css("height"))+24;
    $("#itms").css("height",Math.min(window.innerHeight,hh));
  });
  //$('#itms .cata').jScrollPane();
})

$("#itms").on("mouseenter",".cata li a",function(){
    $(markers[$(this).data("id")]._icon).addClass("hover");
})

$("#itms").on("mouseleave",".cata li a",function(){
  $("img.leaflet-marker-icon").removeClass("hover");
})

$("#itms").on("keyup",".cata.cat_arama",function(e){if (e.keyCode == 13) {search()}})
$("#itms").on("click tap",".cata.cat_arama .ara",function(){search()})

function search() {
  box = $("#itms .cata.cat_arama input")
  if (box.length > 0) {
    $("#itms .cata.cat_arama ul").html("");
    $.each(index.search(box.val()),function(i,e){
      item = $content[(e.ref)]
      $("#itms .cata.cat_arama ul").append("<li><a data-id='"+item.id+"' onclick='show("+item.id+")'>"+item.name+"</li>")
    })
    hh = parseInt($("#itms .cata").css("height"))+24;
    $("#itms").css("height",Math.min(window.innerHeight,hh));
  }
}

function zom(id){
  m = markers[id];
  map.setView(m._latlng,12,{animate:true});
}

function show(id) {
  //map.fitBounds(markerLayer.getBounds());
  map.setView(markers[id]._latlng,9)
  markers[id].openPopup();
  //map.panBy([0,$(".leaflet-popup").height() * -0.75])
  //$("#itms").slideUp();
}

function closeItems() {
  $("#itms").slideUp();
}

function getBack() {
  //map.fitBounds(vectorLayer.getBounds(),fitBoundOpts);
  map.fitBounds(markerLayer.getBounds());
}

function popUp(marker) {
  marker.openPopup();
  //window.location = "#"+marker.slug;
}

