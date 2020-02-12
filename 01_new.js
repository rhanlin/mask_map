
//設定一個地圖，把地圖定位在 #map
//先訂位center座標，zoom定位在16
var map = L.map('map', {
  center: [24.9838876,121.4899229],
  zoom: 16
});
//加入使用的圖資
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function getData(){
  return new Promise(function(resolve, reject){
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET","https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
    xhr.onload = function(){
      var data = JSON.parse(xhr.responseText).features
      resolve(data)
      // console.log(data);
    }
    xhr.onerror = function(){
      reject("error!")
    }
    xhr.send();
  })
}

let dataPromise = getData();
dataPromise.then(function(data){
  var markers = new L.MarkerClusterGroup().addTo(map);
  for(let i =0;data.length>i;i++){
    markers.addLayer(
      L.marker(
      [data[i].geometry.coordinates[1],data[i].geometry.coordinates[0]], {icon: greenIcon}
      )
      .bindPopup(`
        <h1>${data[i].properties.name}</h1>
        <p>成人口罩：${data[i].properties.mask_adult}<br>
        兒童口罩:${data[i].properties.mask_child}</p>
        `
      )
    );
    // add more markers here...
    // L.marker().addTo(map)
    //   )
  }
  map.addLayer(markers);
}).catch(function(error){
  alert(error)
})
