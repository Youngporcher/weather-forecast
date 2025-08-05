'use strict'
let coords;
let graphSelect = 'temperature_2m'
let date = new Date()
let data;

const loader = document.getElementById('loader')
const modal = document.getElementById('modal')
const backdrop = document.getElementById('backdrop')
//asidebar
const searchBtn = document.getElementById('search-btn')
const addressOut = document.getElementById('address')
const timeOut = document.getElementById('time')
const weekdayOut = document.getElementById('weekday')
const dateOut = document.getElementById('date')
const wmoImageOut = document.getElementById('wImg"')
const tempOut = document.getElementById('temp')
const wmoOut = document.getElementById('wmo')
const aTempOut = document.getElementById('aTemp')

//statistics
const windOut = document.getElementById('wind')
const precipitationOut = document.getElementById('precipitations')
const humidityOut = document.getElementById('humidity')

const pressureOut = document.getElementById('pressure')
const tMaxOut = document.getElementById('tMax')
const tMinOut = document.getElementById('tMin')

const uvIndexOut = document.getElementById('uv-index')
const sunriseOut = document.getElementById('sunrise')
const sunsetOut = document.getElementById('sunset')

// Wmo codes
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

// Задается время в сайдбаре
function setTime() {
    let month = date.getMonth()+1
    let day = date.getDate()
    let year = date.getFullYear()
    let hour = date.getHours()
    let minute = date.getMinutes()
    timeOut.innerHTML = `${hour}:${minute < 10 ? '0' + minute : minute}`
    weekdayOut.innerHTML = getWeekDay(date)
    dateOut.innerHTML = `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`
}
// Градусы направление ветра в буквенное
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

// Перевод из численного дня недели в буквенный
function getWeekDay(date){
    const days = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота']
    return days[date.getDay()]
}

// Построение графика
function createGraph(data){
    new Chartist.Line('.chart1', {
        labels: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
        series: [
            data.hourly[graphSelect]
        ]
    }, {
        showArea: true,
        fullWidth: true
    });
}

// Запрос к метео Api и Прорисовка данных на сайте
function initMeteoData(){
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords[0]}&longitude=${coords[1]}&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation,weathercode,pressure_msl,windspeed_10m,winddirection_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&windspeed_unit=ms&timezone=auto&start_date=${getDateNow(date)}&end_date=${getDateNow(date)}`)
        .then(response => response.json())
        .then(datas => {
            data = datas
            data.hourly.pressure_msl = data.hourly.pressure_msl.map(num => num/1.333)
            //asidebar
            wmoImageOut.src = `images/w${data.hourly.weathercode[date.getHours()]}.png`
            tempOut.innerHTML = `${Math.round(data.hourly.temperature_2m[date.getHours()])}°C`
            wmoOut.innerHTML= wmoCodes[data.hourly.weathercode[date.getHours()]]
            aTempOut.innerHTML = `${Math.round(data.hourly.apparent_temperature[date.getHours()])}°C`

            createGraph(data)
            //statistics
            windOut.innerHTML = `${Math.round(data.hourly.windspeed_10m[date.getHours()])} м/с ${getWeatherDirection(data.hourly.winddirection_10m[date.getHours()])}`
            precipitationOut.innerHTML = `${data.hourly.precipitation[date.getHours()]} ММ`
            humidityOut.innerHTML = `${data.hourly.relativehumidity_2m[date.getHours()]}%`

            pressureOut.innerHTML = `${Math.round(data.hourly.pressure_msl[date.getHours()])} ММ`
            tMaxOut.innerHTML = Math.round(data.daily.temperature_2m_max[0]) + '°C'
            tMinOut.innerHTML = Math.round(data.daily.temperature_2m_min[0]) + '°C'

            uvIndexOut.innerHTML = Math.round(data.hourly.uv_index[date.getHours()])
            sunriseOut.innerHTML = data.daily.sunrise[0].slice(-5)
            sunsetOut.innerHTML = data.daily.sunset[0].slice(-5)
        })
}

// При загрузке карты идет её иницилизация
function initMap(){
    let myMap = new ymaps.Map("map", {
        // Центр карты
        center: [55.75, 37.62],
        // Уровень приближения
        zoom: 7
    });
    // Удаление не нужный элементов карты
    myMap.controls.remove('trafficControl');

    // Получение первичных данных(погода в центре мск)
    coords = [55.75,37.62]
    setGetAddress()
    initMeteoData()


    // Клик по карте
    myMap.events.add('click', function (e) {
        // Получение координат клика
        coords = e.get('coords');

        // Удаление всех меток
        myMap.geoObjects.removeAll()

        // Создание метки с координатами клика
        myMap.geoObjects.add(new ymaps.Placemark(coords))
        setGetAddress()

        // Закрытие модального окна и получение данных
        setTimeout(() => modal.style.display = 'none',200)
        initMeteoData()

    });
}

// Получаение адреса из координат, и задаем его в html
function setGetAddress() {
    ymaps.geocode(coords).then(function (res) {
        var firstGeoObject = res.geoObjects.get(0);
        addressOut.innerHTML = [
            firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
            firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
        ].filter(Boolean).join(', ')
    });
}

window.onload = () => loader.style.display = "none"

// Клик по темной области в режиме открытой карты
backdrop.addEventListener('click',()=> modal.style.display ="none")


setTime()

// Клик на кнопку указания местоположения
searchBtn.addEventListener('click', () => modal.style.display = 'flex')

// Кнопки графика
document.addEventListener('click', e => {
    if(e.target.className == "graph-btn"){
        document.getElementById(graphSelect).classList.remove("graphselect")
        graphSelect = e.target.id
        e.target.classList.add("graphselect")
        createGraph(data)
    }
})

ymaps.ready(initMap);


