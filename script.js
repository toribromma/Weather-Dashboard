var lat = "";
var lon = "";
var city = "";
var cityArray = [];

var oneDay = moment().add(1, "days").format("LL");
var twoDay = moment().add(2, "days").format("LL");
var threeDay = moment().add(3, "days").format("LL");
var fourDay = moment().add(4, "days").format("LL");
var fiveDay = moment().add(5, "days").format("LL");

var dayArray = [];
dayArray.push(oneDay, twoDay, threeDay, fourDay, fiveDay);

// allows for default location

function fahrenheit(kelvin) {
  var tempFahrenheit = kelvin * (9 / 5) - 459.67;
  tempFahrenheitRounded = Math.round(tempFahrenheit);
  return tempFahrenheitRounded;
}

function getUV(uvQuery) {
  $.ajax({
    url: uvQuery,
    method: "GET",
  }).then(function (response) {

    $("#uv-index").text("UV Index: " + response.current.uvi);
    $("#uv-index").addClass("uk-button uk-button-secondary");
  });
}

function getCurrentWeather(lat, lon, city) {

  if (city) {
    var currentCityWeatherQuery =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      city +
      "&appid=a9acfaa21c0aaee39652d9380bd3e5fe";
  } else {
    var currentCityWeatherQuery =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      lat +
      "&lon=" +
      lon +
      "&APPID=a9acfaa21c0aaee39652d9380bd3e5fe";
  }

  $.ajax({
    url: currentCityWeatherQuery,
    method: "GET",
  }).then(function (response) {

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }

    var today = mm + "/" + dd + "/" + yyyy;

    var cityName = $("#city").text(response.name + " (" + today + ")    ");

    var cityWeatherCondition = $("#weather-condition").attr(
      "src",
      "http://openweathermap.org/img/wn/" +
        response.weather[0].icon +
        ".png"
    );

    var cityTemperature = $("#temperature").text(
      "Temperature: " + fahrenheit(response.main.temp) + "°F"
    );

    var cityHumidity = $("#humidity").text(
      "Humidity: " + response.main.humidity + "%"
    );

    var cityWindSpeed = $("#wind-speed").text(
      "Wind Speed: " + response.wind.speed
    );

    var currentLat = response.coord.lat;
    var currentLon = response.coord.lon;

    var uvQuery =
      "https://api.openweathermap.org/data/2.5/onecall?appid=a9acfaa21c0aaee39652d9380bd3e5fe&lat=" +
      currentLat +
      "&lon=" +
      currentLon;

    getUV(uvQuery);
  });
}

function getFiveDayForecast(lat, lon, city) {

  if (city) {
    var currentFiveDayForecastQuery =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      city +
      "&appid=a9acfaa21c0aaee39652d9380bd3e5fe";
  } else {
    var currentFiveDayForecastQuery =
      "https://api.openweathermap.org/data/2.5/forecast?&lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=a9acfaa21c0aaee39652d9380bd3e5fe";
  }

  $.ajax({
    url: currentFiveDayForecastQuery,
    method: "GET",
  }).then(function (response) {
  
    var fiveDayForecastDiv = $("#fiveDayForecast");

    fiveDayForecastDiv.empty();

    var startingNum = -5;

    dayArray.forEach(day => {

      var mainDiv = $("<div>")
      var cardDiv = $("<div class='uk-card uk-card-default uk-card-body'>")
      var iconList = $("<div>");
      var iconImg = $("<img>");
      var dayList = $("<div>" + day + "</div>");

      startingNum += 8;

      iconImg.attr(
        "src",
        "https://openweathermap.org/img/wn/" +
          response.list[startingNum].weather[0].icon +
          ".png"
      );
          
      iconList.append(iconImg);
      weatherList = $("<div>").text(
        "Temperature: " + fahrenheit(response.list[startingNum].main.temp) + "°F"
      );
      humidityList = $("<div>").text(
        "Humidity: " + response.list[startingNum].main.humidity + "%"
      );

      cardDiv.append(dayList, iconList, weatherList, humidityList);
      mainDiv.append(cardDiv);
      fiveDayForecastDiv.append(mainDiv);

    });

  });
}

var input = document.getElementById("name-city");

function renderCities() {
  $("#list").empty();
  
  for (var i = 0; i < cityArray.length; i++) {
    var mainDiv = $("<li>")
    var eachCity = cityArray[i];
    var button = $("<button class='removeButton uk-button-small uk-button uk-button-default'>")
    button.text("x");
    button.attr("data-name", cityArray[i]);
    citySpan = $("<span class='uk-margin-small-right'>");
    citySpan.text(eachCity);
    mainDiv.append(citySpan, button);

    $("#list").append(mainDiv);
  }
}

  function initiateList() {
    var storedCities = JSON.parse(localStorage.getItem("cities"));

    if (storedCities !== null) {
      cityArray = storedCities;
    }

    renderCities();
  }

  function storeCities() {
    localStorage.setItem("cities", JSON.stringify(cityArray));
  }
  

// Initate local storage for list of Cities

  initiateList();

// Allows for creation of list of Cities

$("#search-city").on("click", function (event) {
  event.preventDefault();

  city = $("#name-city").val().trim();

  if (city === "") {
    return;
  }

  cityArray.push(city);

  storeCities();
  renderCities();
  getCurrentWeather(null, null, city);
  getFiveDayForecast(null, null, city);
});


$("#list").on("click", function (event) {
  var element = event.target;

  if(element.matches("button") === true || element.matches("li") === true ) {
    return null;
  }
  if (element.matches("span") === true) {
    city = $(element).text();
  }

  getCurrentWeather(null, null, city);
  getFiveDayForecast(null, null, city);
});

function getPosition() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject)
  );
}

getPosition()
  .then((position) => {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    getCurrentWeather(lat, lon);
    getFiveDayForecast(lat, lon);

  })
  .catch((err) => {
    console.error(err.message);
  });

  var removeCity = (event) => {
    event.preventDefault()
    // console.log(event)
    var element = event.target;
    console.log(element)
    var dataName = $(element).attr("data-name");
    console.log(dataName)
    console.log(cityArray)
    if(cityArray.indexOf(dataName) === -1) {
      console.log("it doesn't exist in this array")
    } else {
      var index = cityArray.indexOf(dataName);
      console.log(index);
      cityArray.splice(index, 1);
      storeCities();
      initiateList();
    }

  }
$(document).ready(function() {
  $(document).on("click", ".removeButton", removeCity);
})
