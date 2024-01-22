var slideButtons = document.getElementsByClassName("slide_button");
var slides = document.getElementsByClassName("slide");
var slider = document.querySelector(".slider");
var scrollTimer;

function changeSlide() {
    for (slideButton of slideButtons) { slideButton.classList.remove("active_slide"); }

    for (let i = 0; i < slideButtons.length; i++) {
        if (event.currentTarget === slideButtons[i]) {
            slideButtons[i].classList.add("active_slide");

            var target = document.getElementById("slide-" + i);
            target.scrollIntoView(false);
            target.scrollIntoView({block: 'nearest'});
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

for (slide of slides) {
    slide.addEventListener('hover', function() { 
        clearTimeout(scrollTimer); 
        scrollTimer = setTimeout(matchSlide, 25); 
    });
}

function matchSlide() {
    if (slider !== null) { var sliderRect = slider.getBoundingClientRect(); }

    for (let i = 0; i < slides.length; i++) {
        var slideRect = slides[i].getBoundingClientRect();
        
        if (Math.abs(slideRect.left - sliderRect.left) < sliderRect.width / 2) {
            for (slideButton of slideButtons) { slideButton.classList.remove("active_slide"); }
            slideButtons[i].classList.add("active_slide");
        }
    }
}