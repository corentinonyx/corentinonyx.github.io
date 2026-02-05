// -------
// Gestion de la resolution


var mySelect = document.getElementById('resolutionSelect');
mySelect.onchange = (event) => {
    res_selector(event.target.value);
}


function res_selector(resolution) {
        
    if (resolution === "50") {
        console.log(resolution);
        change_to_50();
    } else if (resolution === "75") {
        console.log(resolution);
        change_to_75();
    } else if (resolution === "100") {
        console.log(resolution);
        change_to_100();
    } else if (resolution === "125") {
        console.log(resolution);
    } else if (resolution === "default") {
        console.log(resolution);
    } else {
        console.log("No Data");
        change_to_100();
    }
}




function change_to_50() {
    let counterContainer_75 = document.querySelectorAll('.counterContainer');
    counterContainer_75.forEach(function(element) {
    element.style.height = '200px';
    element.style.width = '200px';
    element.style.margin = '20px';
    });

    let input_timer_content_75 = document.querySelectorAll('.input_timer_content');
    input_timer_content_75.forEach(function(element) {
    element.style.height = '40px';
    element.style.width = '200px';
    });

    let label_timer_content_75 = document.querySelectorAll('.label_timer_content');
    label_timer_content_75.forEach(function(element) {
    element.style.height = '80px';
    element.style.width = '200px';
    });

    let button_timer_content_75 = document.querySelectorAll('.button_timer_content');
    button_timer_content_75.forEach(function(element) {
    element.style.height = '80px';
    element.style.width = '200px';
    element.style.marginTop = "5px";
    });

    let button_play_style_75 = document.querySelectorAll('.button_play_style');
    button_play_style_75.forEach(function(element) {
    element.style.fontSize = "15px";
    element.style.height = "75px";
    });

    // Cible toutes les balises <div>
    let inputs_75 = document.querySelectorAll('input'); // Ou document.getElementsByTagName('div')
    inputs_75.forEach(function(element) {
    element.style.fontSize = '13px';
    element.style.height = '35px';
    element.style.width = '200px';
    });

    let counterstyle_75 = document.querySelectorAll('.counterstyle');
    counterstyle_75.forEach(function(element) {
    element.style.fontSize = '25px';
    });

    // Gestion du Tableau
    let tables_50 = document.querySelectorAll('td'); // Ou document.getElementsByTagName('div')
    tables_50.forEach(function(element) {
    element.style.fontSize = '10px';
    });
}

function change_to_75() {
    let counterContainer_75 = document.querySelectorAll('.counterContainer');
    counterContainer_75.forEach(function(element) {
    element.style.height = '250px';
    element.style.width = '250px';
    element.style.margin = '20px';
    });

    let input_timer_content_75 = document.querySelectorAll('.input_timer_content');
    input_timer_content_75.forEach(function(element) {
    element.style.height = '45px';
    element.style.width = '250px';
    });

    let label_timer_content_75 = document.querySelectorAll('.label_timer_content');
    label_timer_content_75.forEach(function(element) {
    element.style.height = '100px';
    element.style.width = '250px';
    });

    let button_timer_content_75 = document.querySelectorAll('.button_timer_content');
    button_timer_content_75.forEach(function(element) {
    element.style.height = '100px';
    element.style.width = '250px';
    element.style.marginTop = "10px"
    });

    let button_play_style_75 = document.querySelectorAll('.button_play_style');
    button_play_style_75.forEach(function(element) {
    element.style.fontSize = "20px";
    element.style.height = "90px";
    });

    // Cible toutes les balises <div>
    let inputs_75 = document.querySelectorAll('input'); // Ou document.getElementsByTagName('div')
    inputs_75.forEach(function(element) {
    element.style.fontSize = '15px';
    element.style.height = '40px';
    element.style.width = '250px';
    });

    let counterstyle_75 = document.querySelectorAll('.counterstyle');
    counterstyle_75.forEach(function(element) {
    element.style.fontSize = '30px';
    });

    // Gestion du Tableau
    let tables_50 = document.querySelectorAll('td'); // Ou document.getElementsByTagName('div')
    tables_50.forEach(function(element) {
    element.style.fontSize = '12px';
    });
}

function change_to_100() {
    let counterContainer_75 = document.querySelectorAll('.counterContainer');
    counterContainer_75.forEach(function(element) {
    element.style.height = '300px';
    element.style.width = '300px';
    element.style.margin = '20px';
    });

    let input_timer_content_75 = document.querySelectorAll('.input_timer_content');
    input_timer_content_75.forEach(function(element) {
    element.style.height = '50px';
    element.style.width = '300px';
    });

    let label_timer_content_75 = document.querySelectorAll('.label_timer_content');
    label_timer_content_75.forEach(function(element) {
    element.style.height = '130px';
    element.style.width = '300px';
    });

    let button_timer_content_75 = document.querySelectorAll('.button_timer_content');
    button_timer_content_75.forEach(function(element) {
    element.style.height = '130px';
    element.style.width = '300px';
    element.style.marginTop = "0px"
    });

    let button_play_style_75 = document.querySelectorAll('.button_play_style');
    button_play_style_75.forEach(function(element) {
    element.style.fontSize = "25px"
    element.style.height = "100px";
    });

    // Cible toutes les balises <div>
    let inputs_75 = document.querySelectorAll('input'); // Ou document.getElementsByTagName('div')
    inputs_75.forEach(function(element) {
    element.style.fontSize = '20px';
    element.style.height = '50px';
    element.style.width = '300px';
    });

    let counterstyle_75 = document.querySelectorAll('.counterstyle');
    counterstyle_75.forEach(function(element) {
    element.style.fontSize = '35px';
    });

    // Gestion du Tableau
    let tables_50 = document.querySelectorAll('td'); // Ou document.getElementsByTagName('div')
    tables_50.forEach(function(element) {
    element.style.fontSize = '15px';
    });
}



