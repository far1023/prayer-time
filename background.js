const fetchCity = () => {
  return fetch('storage/city.json')
    .then((response) => response.json())
    .then((data) => {
      // Store data in chrome.storage.local
      chrome.storage.local.set({ storageCityList: data }, function () {
        console.log('city list has been stored:', data);
      });
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
};

const dateNow = () => {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();

  today = dd + '-' + mm + '-' + yyyy;

  chrome.storage.local.set({ storageDate: today }, function () {
    console.log('Date has been stored:', today);
  });
};

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.clear(function () {
    console.log('xxxxxxx Local storage cleared xxxxxxx ON INSTALL');
  });

  dateNow();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'fetchCity') {
    fetchCity();
  }

  if (request.action === 'generateDate') {
    chrome.storage.local.clear(function () {
      console.log('xxxxxxx Local storage cleared xxxxxxx ON GENERATING DATE...');
    });

    dateNow();
  }
});
