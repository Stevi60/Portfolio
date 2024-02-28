
var languageButtons = document.getElementsByClassName("language_button");
var language = localStorage.getItem('_language');
var currentLanguage;

var englishList = document.getElementsByClassName("english");
var frenchList = document.getElementsByClassName("french");

if (language !== null) {
    language = atob(language);
    language = JSON.parse(language);
    currentLanguage = language;
    
    if (language === "english") { changeLanguage("english"); } 
    else { changeLanguage("french"); }
} else {
    console.log(localStorage.getItem('_language'));
    saveLanguage("english");
    changeLanguage("english")
}

function saveLanguage(name) {
    currentLanguage = name;
    language = name;
    language = JSON.stringify(language);
    language = btoa(language);
    localStorage.setItem('_language', language);
}

function changeLanguage(newLanguage) {
    /* Remove the "active" class for every button */
    for (button of languageButtons) { button.classList.remove("active"); }

    if (newLanguage === "english") {
        saveLanguage("english");
        languageButtons[0].classList.add("active");

        $.each(englishList, function() { $(this).show(); });
        $.each(frenchList, function() { $(this).hide(); });
        
    } else {
        saveLanguage("french");
        languageButtons[1].classList.add("active");
        
        $.each(englishList, function() { $(this).hide(); });
        $.each(frenchList, function() { $(this).show(); });
    }
}
