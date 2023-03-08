'use strict'
let coords;
const sunriseOut = document.getElementById('sunrise')
const sunsetOut = document.getElementById('sunset')
const maxTempOut = document.getElementById('maxTemp')
const minTempOut = document.getElementById('minTemp')
const weatherInfoDailyOut = document.getElementById('weatherInfoDaily')

const precipitationOut = document.getElementById('precipitation')
const humidityOut = document.getElementById('humidity')
const tempOut = document.getElementById('temp')
const pressureOut = document.getElementById('pressure')
const windSpeedOut = document.getElementById('windSpeed')
const windDirectionOut = document.getElementById('windDirection')
const weatherInfoHourlyOut = document.getElementById('weatherInfoHourly')

//Wmo codes
const wmoCodes = {
    0:'Ясное небо',
    1:'Преимущественно ясно',
    2:'Переменная облачность',
    3:'Пасмурно',
    45:'Туман',
    48:'Осаждающий инейный туман',
    51:'Легкая морось',
    53:'Умеренная морось',
    55:'Плотная морось',
    56:'Легкая ледяная морось',
    57:'Плотная ледяная морось',
    61:'Слабый дождь',
    63:'Умеренный дождь',
    65:'Сильный дождь',
    66:'Легкий ледяной дождь',
    67:'Сильный ледяной дождь',
    71:'Легкий снегопад',
    73:'Умеренный снегопад',
    75:'Сильный снегопад',
    77:'Снежная крупа',
    80:'Слабый ливень',
    81:'Умеренный ливень',
    82:'Сильный ливень',
    85:'Слабый снег',
    86:'Сильный снег',
    95:'Умеренная гроза',
    96:'Гроза со слабым градом',
    99:'Гроза с сильным градом',
}

function getWeatherDirection(degrees){
    if (degrees >= 338 || degrees <= 22){
        return "С"
    } else if ( degrees >= 23 && degrees <= 67){
        return "СВ"
    }else if ( degrees >= 68 && degrees <= 112){
        return "В"
    }else if ( degrees >= 113 && degrees <= 157){
        return "ЮВ"
    }else if ( degrees >= 158 && degrees <= 202){
        return "Ю"
    }else if ( degrees >= 203 && degrees <= 247){
        return "ЮЗ"
    }else if ( degrees >= 248 && degrees <= 292){
        return "З"
    }else if ( degrees >= 293 && degrees <= 337){
        return "СЗ"
    }
}
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
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords[0]}&longitude=${coords[1]}&hourly=temperature_2m,relativehumidity_2m,precipitation,weathercode,pressure_msl,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&windspeed_unit=ms&timezone=auto&start_date=${getDateNow(date)}&end_date=${getDateNow(date)}`)
            .then(response => response.json())
            .then(data => {
                // Суточные показатели
                sunriseOut.innerHTML = data.daily.sunrise[0].slice(-5)
                sunsetOut.innerHTML = data.daily.sunset[0].slice(-5)
                maxTempOut.innerHTML = data.daily.temperature_2m_max[0] + '°C'
                minTempOut.innerHTML = data.daily.temperature_2m_min[0] + '°C'
                weatherInfoDailyOut.innerHTML = wmoCodes[data.daily.weathercode[0]]

                // Часовые показатели
                precipitationOut.innerHTML = data.hourly.precipitation[date.getHours()] + ' мм'
                humidityOut.innerHTML = data.hourly.relativehumidity_2m[date.getHours()] + '%'
                tempOut.innerHTML = data.hourly.temperature_2m[date.getHours()] + '°C'
                pressureOut.innerHTML = Math.round(data.hourly.pressure_msl[date.getHours()]/1.333) + ' мм'
                windSpeedOut.innerHTML = Math.round(data.hourly.windspeed_10m[date.getHours()]) + ' м/с'
                windDirectionOut.innerHTML = getWeatherDirection(data.hourly.winddirection_10m[date.getHours()]) + ` <img id="arrow" src="../images/wind-duration.png" alt="">`
                document.getElementById('arrow').style.transform = `rotate(${data.hourly.winddirection_10m[date.getHours()]}deg)`
                weatherInfoHourlyOut.innerHTML = wmoCodes[data.hourly.weathercode[0]]

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


