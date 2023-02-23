'use strict'
let coords;
const sunriseOut = document.getElementById('sunrise')
const sunsetOut = document.getElementById('sunset')
const maxTempOut = document.getElementById('maxTemp')
const minTempOut = document.getElementById('minTemp')

const precipitationOut = document.getElementById('precipitation')
const humidityOut = document.getElementById('humidity')
const tempOut = document.getElementById('temp')
// Получить время (YYYY-MM-DD)
function getDateNow(date){
    let month = date.getMonth()+1 < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1
    let year = date.getFullYear()
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    return `${year}-${month}-${day}`
}

// При загрузке карты идет её иницилизация
ymaps.ready(init);
function init(){
    let date = new Date()

    let myMap = new ymaps.Map("map", {
        // Центр карты
        center: [55.75, 37.62],
        // Уровень приближения
        zoom: 7
    });
    // Запрос к метео Api и Прорисовка данных на сайте
    function getMeteoData(){
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords[0]}&longitude=${coords[1]}&hourly=temperature_2m,relativehumidity_2m,precipitation,weathercode,windspeed_10m,winddirection_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&windspeed_unit=ms&timezone=auto&start_date=${getDateNow(date)}&end_date=${getDateNow(date)}`)
            .then(response => response.json())
            .then(data => {
                // Суточные показатели
                sunriseOut.innerHTML = data.daily.sunrise[0].slice(-5)
                sunsetOut.innerHTML = data.daily.sunset[0].slice(-5)
                maxTempOut.innerHTML = data.daily.temperature_2m_max[0] + '°C'
                minTempOut.innerHTML = data.daily.temperature_2m_min[0] + '°C'

                precipitationOut.innerHTML = data.hourly.precipitation[date.getHours()] + ' mm'
                humidityOut.innerHTML = data.hourly.relativehumidity_2m[date.getHours()] + '%'
                tempOut.innerHTML = data.hourly.temperature_2m[date.getHours()] + '°C'
            })
    }

    // Клик по карте
    myMap.events.add('click', function (e) {

        // Получение координат клика
       coords = e.get('coords');

        // Удаление всех меток
        myMap.geoObjects.removeAll()

        // Создание метки с координатами клика
        myMap.geoObjects.add(new ymaps.Placemark(coords))

        getMeteoData()

    });
}


