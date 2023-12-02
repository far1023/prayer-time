document.getElementById('reloadBtn').addEventListener('click', function () {
  chrome.storage.local.clear(function () {
    console.log('xxxxxxx Local storage cleared xxxxxxx ON RELOADING...');
  });

  generatePrayerTime();
});

const generatePrayerTime = () => {
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
  console.log('coordinate found');

  chrome.storage.local.get(['storageDate'], function (result) {
    date = result.storageDate;
  });

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  getapi(`https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=20`);
  getCityName(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&zoom=10&format=json`);
}

function errorCallback(error) {
  const resultDiv = document.getElementById('result');
  if (error.code === error.PERMISSION_DENIED) {
    resultDiv.textContent = 'Geolocation permission denied. Please allow access in your browser settings.';
  } else {
    resultDiv.textContent = 'Error getting location: ' + error.message;
  }

  console.error(error.message);
}

async function getapi(url) {
  console.log('fetching prayer time...');

  const response = await fetch(url);

  var res = await response.json();

  if (response) {
    console.log('prayer time stored');

    chrome.storage.local.set({ storagePrayerTime: res.data });

    showPrayerTime(res.data);
  } else {
    console.error('failed fetching prayer time');
  }
}

async function getCityName(url) {
  console.log('fetching city name...');

  // Make a GET request to the Nominatim API
  await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Check if the response contains address information
      if (data) {
        // Extract the city name
        const cityName = data.name;

        if (cityName) {
          console.log('city name stored');

          chrome.storage.local.set({ storageCityName: cityName });

          showCity(cityName);
        } else {
          console.log('City name not found.');
        }
      } else {
        console.log('Address information not found.');
      }
    })
    .catch((error) => console.error('Error fetching geocoding data:', error));
}

const showCity = (cityName) => {
  document.getElementById('cityName').textContent = cityName;
};

const showPrayerTime = (prayerTime) => {
  document.getElementById('date').textContent = prayerTime.date.readable;

  const resultDiv = document.getElementById('result');

  let tab = `
    <tr><th>Fajr</th><td> : ${prayerTime.timings.Fajr}</td></tr>
    <tr><th>Dhuhr</th><td> : ${prayerTime.timings.Dhuhr}</td></tr>
    <tr><th>Asr</th><td> : ${prayerTime.timings.Asr}</td></tr>
    <tr><th>Maghrib</th><td> : ${prayerTime.timings.Maghrib}</td></tr>
    <tr><th>Isha</th><td> : ${prayerTime.timings.Isha}</td></tr>`;

  resultDiv.innerHTML = tab;

  document.getElementById('loading').style.display = 'none';
  document.getElementById('prayer').style.display = 'block';
};

(function () {
  chrome.storage.local.get(null, function (result) {
    const prayerTime = result.storagePrayerTime;
    const cityName = result.storageCityName;
    const date = result.storageDate;

    if (prayerTime && prayerTime.date.gregorian.date == date) {
      console.log('Prayer time retrieved from storage:', prayerTime);
      console.log('City retrieved from storage:', cityName);

      showPrayerTime(prayerTime);
      showCity(cityName);
    } else {
      console.log('No prayer time found in storage, GENERATE NEW ONE.');

      if (!date) {
        chrome.runtime.sendMessage({ action: 'generateDate' });
      }

      generatePrayerTime();
    }
  });
})();
