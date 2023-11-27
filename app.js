document.getElementById('reloadBtn').addEventListener('click', function () {
  getLocation();
});

const getLocation = () => {
  if ('geolocation' in navigator) {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('prayer').style.display = 'none';
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = 'Geolocation is not available in this browser.';
  }
};

function successCallback(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const date = dateNow();

  document.getElementById('latlong').textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;

  getapi(`https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=11`);
}

function errorCallback(error) {
  const resultDiv = document.getElementById('result');
  if (error.code === error.PERMISSION_DENIED) {
    resultDiv.textContent = 'Geolocation permission denied. Please allow access in your browser settings.';
  } else {
    resultDiv.textContent = 'Error getting location: ' + error.message;
  }
}

function dateNow() {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();

  today = dd + '-' + mm + '-' + yyyy;
  return today;
}

async function getapi(url) {
  const response = await fetch(url);

  var res = await response.json();

  console.log(res.data);
  if (response) {
    document.getElementById('date').textContent = res.data.date.readable;

    const resultDiv = document.getElementById('result');

    let tab = `
    <tr><th>Fajr</th><td> : ${res.data.timings.Fajr}</td></tr>
    <tr><th>Dhuhr</th><td> : ${res.data.timings.Dhuhr}</td></tr>
    <tr><th>Asr</th><td> : ${res.data.timings.Asr}</td></tr>
    <tr><th>Maghrib</th><td> : ${res.data.timings.Maghrib}</td></tr>
    <tr><th>Isha</th><td> : ${res.data.timings.Isha}</td></tr>`;

    resultDiv.innerHTML = tab;

    document.getElementById('loading').style.display = 'none';
    document.getElementById('prayer').style.display = 'block';
  }
}

(function () {
  getLocation();
})();
