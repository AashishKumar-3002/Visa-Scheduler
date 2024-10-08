// Make selectedCitiesOrder globally accessible
var selectedCitiesOrder = [];

document.getElementById('toggleCheckbox').addEventListener('change', function() {
    var singleSelect = document.getElementById('singleSelect');
    var multiSelect = document.getElementById('multiSelect');
    var textElement = document.getElementById('toggleText');
  
    if (this.checked) {
        singleSelect.style.display = 'none';
        multiSelect.style.display = 'block';
    } else {
        singleSelect.style.display = 'block';
        multiSelect.style.display = 'none';

        // Clear all selections in multiSelect when switching to single selection
        var checkboxes = multiSelect.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
            checkbox.checked = false;
        });

        // Clear the selectedCitiesOrder array
        selectedCitiesOrder = [];
        console.log('Selected Cities in Order:', selectedCitiesOrder);
    }
});

document.querySelectorAll('#multiSelect input[type="checkbox"]').forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            selectedCitiesOrder.push(this.value);
        } else {
            selectedCitiesOrder = selectedCitiesOrder.filter(city => city !== this.value);
        }
        console.log('Selected Cities in Order:', selectedCitiesOrder);
    });
});

document.getElementById('userDataForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Helper function to retrieve data from specific input fields or sections of the form
    function getSecurityQuestions() {
        return [
            {
                question_1: document.querySelector('#question-box-1').value,
                answer_1: document.querySelector('#answer-box-1').value
            },
            {
                question_2: document.querySelector('#question-box-2').value,
                answer_2: document.querySelector('#answer-box-2').value
            },
            {
                question_3: document.querySelector('#question-box-3').value,
                answer_3: document.querySelector('#answer-box-3').value
            }
        ];
    }

    // Gather data from form fields
    var formData = {
        // General options inputs
        originCountry: document.querySelector('#originCountry').value,
        
        // Appointment options inputs
        appointmentStartDate: document.querySelector('#appointment-start-date').value,
        appointmentEndDate: document.querySelector('#appointment-end-date').value,
        
        // Interview options inputs
        singleCity: document.querySelector('#singleSelect select').value,
        selectedCities: selectedCitiesOrder, // Use the globally accessible array
        
        // Auto login options inputs
        autoLoginEnabled: document.querySelector('#autoLoginToggle').checked,
        userName: document.querySelector('#userName').value,
        password: document.querySelector('#password').value,
        
        // Security questions inputs
        securityQuestions: getSecurityQuestions(),
        
        // // Accounts inputs
        // googleSignInEnabled: document.querySelector('#googleSignInToggle').checked,
        
        // // Advance options inputs
        // botSpeed: document.querySelector('#botSpeed').value,
        // allowNotification: document.querySelector('#notificationToggle').checked
    };

    console.log(formData);

    // Send data to Flask backend
    fetch('http://localhost:5000/submit_data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle response from backend
        console.log(data);
        // Display the success response in the alert popup
        alert(data.status);
    })
    .catch(error => {
        console.error('Error:', error);
        // Display the error message in the alert popup with warning style
        alert('Error: ' + error.status);
    });
});

document.getElementById('save-bot-config').addEventListener('click', function() {
    let selectedProfile = document.getElementById('profile-select-box').value;
    let botSpeed = document.getElementById('select-box botSpeed').value;
    let botruntime = document.getElementById('select-box botruntime').value;
    let botMode = document.getElementById('BotManual').querySelector('input[type="checkbox"]').checked;
    let autoCaptchaFillup = document.getElementById('AutoCaptchaFillup').querySelector('input[type="checkbox"]').checked;
    let botnotification = document.getElementById('BotNotifier').querySelector('input[type="checkbox"]').checked;
    
    // Retrieve the data for the selected profile
    let profileData = {
        botSpeed: botSpeed,
        botruntime: botruntime,
        botMode: botMode,
        autoCaptchaFillup: autoCaptchaFillup,
        botnotification: botnotification
    };

    console.log(profileData);

    // Save the data to chrome.storage
    let saveData = {};
    saveData[selectedProfile] = profileData;
    chrome.storage.local.set(saveData, function() {
        console.log('Profile data saved');
    });
});

document.getElementById('SetUserProfile').addEventListener('click', function() {
    var selectedProfile = document.getElementById('profiles_for_selections').value;
    chrome.storage.local.set({ selectedUserProfile: selectedProfile }, function() {
        console.log('Profile saved:', selectedProfile);
    });
  });