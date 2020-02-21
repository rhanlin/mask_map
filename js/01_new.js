(async function(){
  let [latitude, longitude] = await getPosition();//存目前位置座標
  let findMeBtn = document.querySelector('.return_position');//找到目前位置按鈕
  let maskInfo = await getMaskData();//口罩api資料
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const container = document.querySelector('.side_nav_container')
  let markers = {};
  let sideInfo;

  const map = L.map('map', {
    center: [latitude,longitude],
    zoom: 16
  });
  const userIcon = L.icon({
    iconUrl: './img/dot.svg',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
  })
  L.marker([latitude, longitude], {icon: userIcon}).addTo(map);
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

  findMeBtn.addEventListener('click', findMe);
  searchInput.addEventListener('keyup', searchCustomStore);
  searchBtn.addEventListener('click', searchCustomStore);

  //將自己定位置中
  function findMe(){
    searchInput.value = "";
    map.panTo([latitude, longitude], 16);
    markers = showNearStore(latitude, longitude);
    // console.log(markers);
    
    getMarkers(markers);
    getSildInfo(markers);
  }

  //輸出側邊欄位的藥局資訊
  function getSildInfo(maskInfo){
    sideInfo = document.querySelectorAll('.side_nav_info')
    if(sideInfo.length){
      console.log('t');
      sideInfo.forEach(child => container.removeChild(child))
    }
    maskInfo.forEach(data => {
      let div = document.createElement('div');
      div.className = 'side_nav_info';
      div.innerHTML = `
      <div class="info_title">
        <h3>${data.properties.name}</h3>
        <p>約 752m</p>
      </div>
      <div class="info">
        <img src="./img/place-24px.svg" alt="place">
        <p>${data.properties.address}</p>
      </div>
      <div class="info">
        <img src="./img/local_phone-24px.svg" alt="phone">
        <p>${data.properties.phone}</p>
      </div>
      <div class="info">
        <img src="./img/access_time-24px.svg" alt="time">
        <p>${data.properties.note}</p>
      </div>
      <div class="mask_status">
        <div class="adult ${data.properties.mask_adult ? '' : 'no_mask'}">成人口罩 <span>${data.properties.mask_adult}</span></div>
        <div class="child ${data.properties.mask_child ? '' : 'no_mask'}">兒童口罩 <span>${data.properties.mask_child}</span></div>
      </div>
      `;
      container.appendChild(div)
    })
    
  }
  //介接口罩api
  function getMaskData(){
    // return new Promise(resolve=>{
    //   fetch('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')
    //     .then(res=>res.json())
    //     .then(json=>resolve(json.features))
    //     .catch(err=>console.log(err))
    // })
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
  function showNearStore(lat, lon){
    //我的當前座標
    lat = Math.floor(lat * 10) / 10;
    lon = Math.floor(lon * 10) / 10;
    //撈出我周圍的藥局
    return maskInfo.filter( maskInfo => Math.floor(maskInfo.geometry.coordinates[1] * 10) / 10 == lat && Math.floor(maskInfo.geometry.coordinates[0] * 10) / 10 == lon)
  }
  //取得目前位置
  function getPosition(){
    return new Promise(resolve=>{
      navigator.geolocation.getCurrentPosition(position => {
        resolve([position.coords.latitude, position.coords.longitude])
      });
    })
  }

  //搜尋結果顯示出該地資料
  function searchCustomStore(e){
    if(e.keyCode === 13 || e.type === "click"){
      let value = searchInput.value.trim();
      if(value){
        markers = filterMaskType(value);
        getMarkers(markers);
      }    
    }
  }

  // 渲染藥局資訊
  function getMarkers(data){
    var markers = new L.MarkerClusterGroup().addTo(map);
    for(let i =0 ; data.length>i ; i++){
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
          <p>座標 | ${data[i].geometry.coordinates[1]}, ${data[i].geometry.coordinates[0]}</p>
          `
        )
      );
      // add more markers here...
      // L.marker().addTo(map)
      //   )
    }
  }
  // maskInfo.then(function(data){
  //   // console.log(data);
  //   var markers = new L.MarkerClusterGroup().addTo(map);
  //   for(let i =0 ; data.length>i ; i++){
  //     markers.addLayer(
  //       L.marker(
  //       [data[i].geometry.coordinates[1],data[i].geometry.coordinates[0]], {icon: greenIcon}
  //       )
  //       .bindPopup(`
  //         <div class="info_title">
  //           <h3>${data[i].properties.name}</h3>
  //           <p>約 752m</p>
  //         </div>
  //         <div class="info">
  //           <p>${data[i].properties.address}</p>
  //         </div>
  //         <div class="info">
  //           <p>${data[i].properties.phone}</p>
  //         </div>
  //         <div class="info">
  //           <p>${data[i].properties.note}</p>
  //         </div>
  //         <div class="mask_status">
  //           <div class="adult ${data[i].properties.mask_adult ? '' : 'no_mask'}">成人口罩 <span>${data[i].properties.mask_adult}</span></div>
  //           <div class="child ${data[i].properties.mask_child ? '' : 'no_mask'}">兒童口罩 <span>${data[i].properties.mask_child}</span></div>
  //         </div>
  //         <p>最後更新 | ${data[i].properties.updated ? data[i].properties.updated : '暫無資料'}</p>
  //         `
  //       )
  //     );
  //     // add more markers here...
  //     // L.marker().addTo(map)
  //     //   )
  //   }
  //   map.addLayer(markers);
  // }).catch(function(error){
  //   alert(error)
  // })


  //取出搜尋地區藥局資料
 
  function filterMaskType(info){
    console.log(info);
    return maskInfo.filter( maskInfo => maskInfo.properties.county == info)
  }
  //取得今天日期
  function getDateInfo(){
    const dayInfo = ['日', '一', '二', '三', '四', '五', '六'];
    let day = new Date().getDay();
    var Today=new Date();
// 　  document.write("今天日期是 " + Today.getFullYear()+ " 年 " + (Today.getMonth()+1) + " 月 " + Today.getDate() + " 日");
    document.getElementById('day').innerText = dayInfo[day];
    document.getElementById('date').innerText = `${Today.getFullYear()}-${Today.getMonth()+1}-${Today.getDate()}`;
    document.getElementById('buyInfo').innerHTML = day === 0 
    ? '大家<span>都</span>可購買' 
    : day % 2 === 0 
    ? '身分證末碼為<span>2,4,6,8</span>可購買'
    : '身分證末碼為<span>1,3,5,7,9</span>可購買'
  }
  
  getDateInfo();
  findMe();
})()