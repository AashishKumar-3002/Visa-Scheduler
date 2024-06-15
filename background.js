let timerInterval;
let startTime;
let timerStarted = false; 
let botMode = false;
let botSpeed = 30;
let autoCaptchaFillup = false;
let botNotification = false;

// Get the chrome storage local
chrome.storage.local.get(['selectedUserProfile'], function(result) {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        alert('Error: ' + chrome.runtime.lastError.message);
        return;
    }

    var selectedUserProfile = result.selectedUserProfile;
    
    chrome.storage.local.get(selectedUserProfile, function(profileData) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            alert('Error: ' + chrome.runtime.lastError.message);
            return;
        }

        console.log('Profile data:', profileData);
        if (profileData && profileData[selectedUserProfile]) {
            botMode = profileData[selectedUserProfile]['botMode'];
            botSpeed = profileData[selectedUserProfile]['botSpeed'];
            autoCaptchaFillup = profileData[selectedUserProfile]['autoCaptchaFillup'];
            botNotification = profileData[selectedUserProfile]['botnotification'];
        } else {
            console.error('No profile data found for the selected user profile');
            alert('Error: No profile data found for the selected user profile');
        }
    });
});

chrome.runtime.onInstalled.addListener(() => {
    // Create an alarm to check for slots every 10 minutes
    chrome.alarms.create("checkSlotsAlarm", { delayInMinutes: botSpeed, periodInMinutes: botSpeed });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (!botMode) {
        if (!timerStarted) return;
    }

    if (alarm.name === "checkSlotsAlarm") {
        fetch("http://localhost:5000/start_process", {
            method: "GET"
        })
        .then(response => {
            if (response.ok) {
                console.log("Process started successfully");
            } else {
                console.error("Error starting process:", response.statusText);
            }
        })
        .catch(error => console.error("Error starting process:", error));
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startTimer") {
        timerStarted = true;
        startTime = new Date().getTime();
        timerInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - startTime;
            const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
            const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
            
            const timeString = `Session: ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
            chrome.storage.local.set({ timer: timeString });
            chrome.runtime.sendMessage({ action: "updateTimer", timeString: timeString });
        }, 1000);

        fetch("http://localhost:5000/start_process", {
            method: "GET"
        })
        .then(response => {
            if (response.ok) {
                console.log("Process started successfully");
            } else {
                console.error("Error starting process:", response.statusText);
            }
        })
        .catch(error => console.error("Error starting process:", error));

        sendResponse({ status: "started" });
    } else if (request.action === "stopTimer") {
        timerStarted = false;
        clearInterval(timerInterval);
        chrome.storage.local.remove("timer");
        sendResponse({ status: "stopped" });
    }
    return true;
});

function pad(num) {
    return num < 10 ? '0' + num : num;
}