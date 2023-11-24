const errorMessage = document.querySelector('.errorMessage');
const map = document.getElementById('map');
const weatherContainer = document.getElementById('weather__container');
const weatherForm = document.getElementById('form__box');
const formWrapper = document.getElementById('form');
const cityName = document.querySelector('h1');
const btnOpenForm = document.getElementById('openForm');
const locationMy = document.getElementById('location__my');

locationMy.addEventListener('click', getLocation);
weatherForm.addEventListener('submit', handleFormSubmit);

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			getMyLocation,
			showMyLocationError
		);
	} else {
		errorMessage.textContent = 'Ошибка, невозможно определить геолокацию';
	}
};

function toggleForm() {
	formWrapper.classList.contains('hideElement')
		? formWrapper.classList.remove('hideElement')
		: formWrapper.classList.add('hideElement');
};

async function getMyLocation(position) {
	const { longitude, latitude } = position.coords;
	const response = await fetchData(latitude, longitude);
	if (!response) {
		return null;
	}
	initApp(response);
};

function showMyLocationError() {
	errorMessage.textContent = 'Ошибка, невозможно определить геолокацию';
};

async function fetchData(latitude, longitude) {
	try {
		const result = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=660a957307f0aaa593d5b44d21947e95`
		);
		return await result.json();
	} catch (error) {
		errorMessage.textContent = 'Возникла непредвиденная ошибка';
	}
};

function serializeForm(formNode) {
	return new FormData(formNode);
}

async function handleFormSubmit(event) {
	event.preventDefault();
	const dataForm = serializeForm(event.target);
	const response = await fetchData(
		dataForm.get('latitude'),
		dataForm.get('longitude')
	);
	if (!response) {
		return null;
	}
	initApp(response);
}

function getTime(data) {
	let sunrise = data.sys.sunrise;
	let sunset = data.sys.sunset;
	let now = Date.now() - data.timezone;
	return now > sunrise * 1000 && now < sunset * 1000;
};

const generateWeatherPropertiesList = (response) => {
	return `<div class="weather__inner">
  <h2 class="weather__temperature_title">Температура</h2>
  <div class="weather__temperature_info">
    <p class="weather__temperature_number">
      <span id="temperature"
        >${Math.floor(response.main.temp - 273)}</span
      >&deg
    </p>
    <img
      class="weather__icon"
      src="https://openweathermap.org/img/w/${response.weather[0].icon}.png"
      alt="Картинка погоды"
    />
  </div>
</div>
<ul class="weather-info__list">
  <li class="weather-info__item">
    <span>Давление:</span>
    <p>${response.main.pressure} мм рт. ст.</p>
  </li>
  <li class="weather-info__item">
    <span>Влажность:</span>
    <p>${response.main.humidity + ' %'}</p>
  </li>
  <li class="weather-info__item">
    <span>Облачность:</span>
    <p>${response.clouds.all + ' %'}</p>
  </li>
  <li class="weather-info__item">
    <span>Время суток:</span>
    <p>${getTime(response) ? 'День' : 'Ночь'}</p>
  </li>
</ul>`;
};

const initMap = (data) => {
	map.innerHTML = '';
	const init = () => {
		let myMap = new ymaps.Map(
				'map',
				{
					center: [data.coord.lat, data.coord.lon],
					zoom: 15,
				},
				{
					searchControlProvider: 'yandex#search',
				}
			),
			placemark = new ymaps.Placemark(
				myMap.getCenter(),
				{
					hintContent: 'Метка расположения',
				},
				{
					iconLayout: 'default#image',
					iconImageHref: 'icons/map-pin-black.png',
					iconImageSize: [30, 30],
					iconImageOffset: [-15, -30],
				}
			);
		myMap.geoObjects.add(placemark);
	};
	ymaps.ready(init);
};

function initApp(response) {
	weatherContainer.innerHTML = generateWeatherPropertiesList(response);
	cityName.textContent = response.name;
	initMap(response);
};
