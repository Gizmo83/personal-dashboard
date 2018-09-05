$(function() {
    //Event Listeners

    // Popover
    $('[data-toggle="popover"]').popover({
        trigger: "hover"
    });

    // Menu toggle switches 
    $('input[type=checkbox]').change(function() {
        menuToggle($(this));
    });

    // Name input box
    $('#input-name-form').submit(function(event) {
        event.preventDefault();
        name = $('#name-input').val();
        //console.log(name);
        getTime();
        chrome.storage.sync.set({
            'name': name
        }, function() {
            checkStorage();
        });
    });

    // Name click edit
    $(document).on("click", "#name-delete", function() {
        chrome.storage.sync.clear(function() {
            location.reload();
        })
    });

    // Search input box
    $('#input-search-form').submit(function(event) {
        event.preventDefault();
        var searchTerm = $("#search-input").val();
        //console.log(searchTerm);
        $("#search-input").val("");
        window.open(`https://www.google.com/search?q=${searchTerm}`);
    });

    // Focus input box
    $(document).on("submit", "#focus-input-form", function(event) {
        event.preventDefault();
        focus = $("#focus-input").val();
        //console.log(focus);
        chrome.storage.sync.set({
            'focus': focus
        }, function() {
            checkFocus();
        })
    });

    // Focus btn
    $(document).on("click", "#focus-btn", function() {
        chrome.storage.sync.remove('focus', function() {
            checkFocus();
        })
    })

    // Pause button
    $('#pause-btn').on('click', function() {
        pauseWallpaper();            
    });

    // Next button
    $('#next-btn').on('click', function() {
        getWallpaper();
    });

    // Checks for name from Chrome Storage
    function checkStorage() {
        chrome.storage.sync.get('name', function(user) {
            name = user.name;
            //console.log(name)
            getTime();
            if (name) {
                $('#name').empty().html(`<span id="name-delete"> Name: ${name} <i id="name-btn" class="fas fa-minus-circle"></i></span>`);
                $("title").text(`${name}'s Minimal Start`)
            } else {
                return
            }
        });
    };

    var focus;

    // Checks for focus from Chrome Storage
    function checkFocus() {
        chrome.storage.sync.get('focus', function(item) {
            focus = item.focus;

            if (!focus) {
                $(".below-center").html(`
                    <h2>What is your main focus for today?</h2>
                    <form id="focus-input-form" autocomplete="off">
                        <input id="focus-input" type="text"/>
                    </form>`);
                
                $("#focus-input").focus();
            } else {
                $(".below-center").html(`
                    <h4>TODAY</h4>
                    <div class="loader"></div>
                    <h2 id="focus-text">${focus} <i id="focus-btn" class="fas fa-check-square"></i></h2>`)
            };
        });
    };

    //AJAX GET request from API to get wallpaper image 
    //https://unsplash.com/developers
    function getWallpaper() {

        if(paused) {
            timer = setInterval(getWallpaper, 3.6e+6);
            $("#pause-btn").css("display", "inline-block")
            paused = false;
        }

        var key = "d94076da3015d2b3f030f6e1ac31377f33212fa1943cad601d9e9769f6c2875f";
        $.ajax({
            url: "https://api.unsplash.com/photos/random?query=desktopwallpaper&client_id=" + key,
            method: "GET"
        }).then(function(response) {
            //console.log(response);
            $("body").css(`background-image`, `url(${response.urls.full})`);
            $("#wallpaper-artist").attr("href", `${response.user.links.html}?utm_source=personaldashboard&utm_medium=referral`).text(`${response.user.first_name} ${response.user.last_name}`);
        });            
    };

    var timer;
    var paused = false;

    function pauseWallpaper() {
        
        clearInterval(timer);
        $("#pause-btn").css("display", "none");
        paused = true;
        // if (!paused) {
        //     clearInterval(timer);
        //     paused = true;
        //     $("#pause-icon").removeClass("fa-pause").addClass("fa-play");
        //     $("#pause-btn").attr("data-content", "Start Slideshow");
        // }
        // else {
        //     timer = setInterval(getWallpaper, 3.6e+6);
        //     paused = false;
        //     $("#pause-icon").removeClass("fa-play").addClass("fa-pause");
        //     //$("#pause-btn").attr("data-content", "Like this image? Click and we'll keep it here.");
        // }
        //console.log(paused)
    };

    //AJAX GET request from API to get quote
    //https://quotes.rest/
    function getQuote() {
        $.ajax({
            url: "https://quotes.rest/qod?category=inspire",
            method: "GET"
        }).then(function(response) {
            //console.log(response)
            var quote = response.contents.quotes[0];
            $("#quote").text(`"${quote.quote}" - ${quote.author}`);
        })
    };

    var ready;
    var lat = "";
    var lon = "";

    //Get user location from built-in Navigator object
    var getLocation = new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(function(location) {
            //console.log(location);
            lat = location.coords.latitude;
            lon = location.coords.longitude;
            ready = true;

            if (ready) {
                resolve("done");
            } else {
                reject("error")
            }
        });
    });            

    var weatherText;
    var weatherTextRemove;
    //Send location to API to get weather
    //https://openweathermap.org/api
    function getWeather() {

        var key = "a3aab2839ff54737c5d2cdcc443fe979"
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=${lat}&lon=${lon}&appid=${key}`,
            method: "GET"
        }).then(function(response) {
            //console.log(response);
            weatherText = ` | ${response.weather[0].main} ${response.main.temp} &deg;F`
            weatherTextRemove = weatherText.replace(" | ", "");
            //console.log(weatherTextRemove)
            $("#weather").html(weatherText).attr("data-content", response.name);
            $("#toggle-weather").append(`<span>Current Location: ${response.name}</span>`)
        });
    };

    // Current Time function
    // Get date/time from built-in Date object

    var name = "";
    function getTime() {

        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var amPm;

        // condition to set greeting in placeholder
        if (h < 12) {
            $("#search-input").attr("placeholder", `Good morning${name ? `, ${name}.`: ""}`)
        }
        else if (h < 18) {
            $("#search-input").attr("placeholder", `Good afternoon${name ? `, ${name}.`: ""}`)
        }
        else {
            $("#search-input").attr("placeholder", `Good evening${name ? `, ${name}.`: ""}`)
        }

        // condition to add zero to minutes that are less than 10
        if (m < 10) {
            m = "0" + m
        }
        
        if (h < 12) {
            amPm = "am"
        }
        else {
            amPm = "pm"
        }
        // condition to convert 24 to 12 hours
        if (h === 0) {
            h = 12
        }
        else if (h > 12) {
            h = h - 12
        }

        $("#time").html(`${h}:${m}<span style="font-size: .25em;">${amPm}</span>`);
        var t = setTimeout(getTime, 55000);

        var dateStr = today.toDateString();
        $("#date").text(dateStr)

    };

    function menuToggle(widget) {
        var type = widget.val();
        var checked = widget[0].checked;

        switch (type) {
            case "search":
                if (checked) {
                    $("#input-search-form").css({"visibility": "visible","opacity": "1" });
                } else {
                    $("#input-search-form").css({"visibility": "hidden","opacity": "0" });
                }
                break;
            case "clock":
                if (checked) {
                    $("#time").css({"visibility": "visible","opacity": "1" });
                } else {
                    $("#time").css({"visibility": "hidden","opacity": "0" });
                }
                break;
            case "date":
                if (checked) {
                    $("#date").css("display", "inline-block");
                    $("#weather").html(weatherText);
                } else {
                    $("#date").css("display", "none");
                    $("#weather").html(weatherTextRemove)
                }
                break;
            case "weather":
                if (checked) {
                    $("#weather").css("display", "inline-block");
                } else {
                    $("#weather").css("display", "none");
                }
                break;
            case "quote":
                if (checked) {
                    $("#quote").css({"visibility": "visible","opacity": "1" });
                } else {
                    $("#quote").css({"visibility": "hidden","opacity": "0" });
                }
                break;
            case "focus":
                if (checked) {
                    $(".below-center").css({"visibility": "visible","opacity": "1" });
                } else {
                    $(".below-center").css({"visibility": "hidden","opacity": "0" });
                }
                break;
            default:
                return;
        }
    };

    //Page load initialization
    checkStorage();
    getWallpaper();
    getTime();
    getQuote();
    checkFocus();

    getLocation.then(function(fulfilled) {
        getWeather();
    })
    .catch(function(error) {
        console.log(error)
    });

    timer = setInterval(getWallpaper, 3.6e+6); //Invokes getWallpaper function to get new wallpaper 60min=3.6e+6
    setInterval(getWeather, 3.6e+6) //Updates weather every hour

});