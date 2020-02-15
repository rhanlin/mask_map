
//設定一個地圖，把地圖定位在 #map
//先訂位center座標，zoom定位在16
var map = L.map('map', {
  center: [24.9838876,121.4899229],
  zoom: 30
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
    
    // var xhr = new XMLHttpRequest();
    // xhr.open("GET","https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
    // xhr.onload = function(){
    //   var data = JSON.parse(xhr.responseText).features
    //   resolve(data)
    //   // console.log(data);
    // }
    // xhr.onerror = function(){
    //   reject("error!")
    // }
    // xhr.send();
    fetch('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')
        .then(res=>res.json())
        .then(json=>resolve(json.features))
        .catch(err=>console.log(err))
  })
}

let dataPromise = getData();
dataPromise.then(function(data){
  console.log(data);
  
  var markers = new L.MarkerClusterGroup().addTo(map);
  for(let i =0;data.length>i;i++){
    markers.addLayer(
      L.marker(
      [data[i].geometry.coordinates[1],data[i].geometry.coordinates[0]], {icon: greenIcon}
      )
      .bindPopup(`
        <div class="info_title">
          <h3>${data[i].properties.name}</h3>
          <p>約 752m</p>
        </div>
        <div class="info">
          <p>${data[i].properties.address}</p>
        </div>
        <div class="info">
          <p>${data[i].properties.phone}</p>
        </div>
        <div class="info">
          <p>${data[i].properties.note}</p>
        </div>
        <div class="mask_status">
          <div class="adult ${data[i].properties.mask_adult ? '' : 'no_mask'}">成人口罩 <span>${data[i].properties.mask_adult}</span></div>
          <div class="child ${data[i].properties.mask_child ? '' : 'no_mask'}">兒童口罩 <span>${data[i].properties.mask_child}</span></div>
        </div>
        <p>最後更新 | ${data[i].properties.updated ? data[i].properties.updated : '暫無資料'}</p>
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


function getDateInfo(){
  const dayInfo = ['日', '一', '二', '三', '四', '五', '六'];
  let day = new Date().getDay();
  document.getElementById('day').innerText = dayInfo[day];
  document.getElementById('buyInfo').innerHTML = day === 0 
  ? '全部<span>皆</span>可購買' 
  : day % 2 === 0 
  ? '身分證末碼為<span>2,4,6,8</span>可購買'
  : '身分證末碼為<span>1,3,5,7,9</span>可購買'
}

getDateInfo();