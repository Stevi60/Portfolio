var slideButtons = document.getElementsByClassName("slide_button");
var slidesEn = document.querySelectorAll('[id*=slideEn-]');
var slidesFr = document.querySelectorAll('[id*=slideFr-]');
var slider = document.querySelector(".tab_slider");
var scrollTimer;

function changeSlide() {
    for (slideButton of slideButtons) { slideButton.classList.remove("active_slide"); }

    for (let i = 0; i < slideButtons.length; i++) {
        if (event.currentTarget === slideButtons[i]) {
            slideButtons[i].classList.add("active_slide");

            if (currentLanguage === "english") {
                var targetEn = document.getElementById("slideEn-" + i);
                targetEn.scrollIntoView(false);
                targetEn.scrollIntoView({block: 'nearest'});
            } else {
                var targetFr = document.getElementById("slideFr-" + i);
                targetFr.scrollIntoView(false);
                targetFr.scrollIntoView({block: 'nearest'});
            }
        }
    }
}

// Call the matchslide funciton when the slider is being scrolled
if (slider !== null) {
    slider.addEventListener('scroll', function() { 
        clearTimeout(scrollTimer); 
        scrollTimer = setTimeout(matchSlide, 25); 
    });    
}

for (slide of slidesEn) {
    slide.addEventListener('hover', function() { 
        clearTimeout(scrollTimer); 
        scrollTimer = setTimeout(matchSlide, 25); 
    });
}

for (slide of slidesFr) {
    slide.addEventListener('hover', function() { 
        clearTimeout(scrollTimer); 
        scrollTimer = setTimeout(matchSlide, 25); 
    });
}

function matchSlide() {
    if (slider !== null) { var sliderRect = slider.getBoundingClientRect(); }

    if (currentLanguage === "english") {
        for (let i = 0; i < slidesEn.length; i++) {
            var slideRect = slidesEn[i].getBoundingClientRect();
            
            if (Math.abs(slideRect.left - sliderRect.left) < sliderRect.width / 2) {
                for (slideButton of slideButtons) { slideButton.classList.remove("active_slide"); }
                slideButtons[i].classList.add("active_slide");
            }
        }
    } else {
        for (let i = 0; i < slidesFr.length; i++) {
            var slideRect = slidesFr[i].getBoundingClientRect();
            
            if (Math.abs(slideRect.left - sliderRect.left) < sliderRect.width / 2) {
                for (slideButton of slideButtons) { slideButton.classList.remove("active_slide"); }
                slideButtons[i].classList.add("active_slide");
            }
        }
    }
}
