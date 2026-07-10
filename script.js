async function loadGallery(){

try{

const response=await fetch("gallery.json?"+Date.now());

const data=await response.json();

document.getElementById("eventName").innerHTML=data.event;

let html="";

data.photos.reverse().forEach(photo=>{

html+=`
<div class="card">

<img src="${photo.url}" loading="lazy">

<a href="${photo.url}" download>

Download

</a>

</div>
`;

});

document.getElementById("gallery").innerHTML=html;

}catch(e){

console.log(e);

}

}

loadGallery();

setInterval(loadGallery,5000);