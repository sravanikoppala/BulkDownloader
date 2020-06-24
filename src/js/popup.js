let progress;
let datasetName = 'Sample name';

$(document).ready(function() {

    let updatePopupInterval;

    function updatePopup() {

        chrome.runtime.sendMessage({
            message: "update-popup"
        });

        if (progress >= 100) {
            progress = 0;
            clearInterval(updatePopupInterval);
        }

    }

    setInterval(updatePopup, 2000);

});

function updateProgressBar(progress) {
    if (progress > 99) {
        progress = 100;
    }
    let element = document.getElementById('progress_bar');
    element.style.width = parseInt(progress) + '%';
    element.innerHTML = parseInt(progress) + '%';
}

$(cancel).click(function() {
    progress = 0;
    updateProgressBar(progress);
    chrome.runtime.sendMessage({ message: "cancel-download" });
});
$(pause).click(function() {
    chrome.runtime.sendMessage({ message: "pause-download" });
});
$(resume).click(function() {
    chrome.runtime.sendMessage({ message: "resume-download" });
});

$(destination).click(function() {
    chrome.downloads.showDefaultFolder()
});
$(editFolderName).click(function() {
    $(datasetName).replaceWith(datasetName);
});

//displaying the datasetname in the popup window
chrome.storage.sync.get(['datasetName'], function(items) {
    datasetName = items.datasetName;
    if (datasetName.length > 45) {
        datasetName = datasetName.slice(0, 40) + '...';
    }
    document.getElementById("datasetName").innerHTML = datasetName;

});


chrome.runtime.onMessage.addListener(
    function(message, sender, sendMessage) {
        if (
            typeof(message) === "object" &&
            message.message == "update-popup-progress"
        ) {

            progress = message.progress;
            updateProgressBar(progress);
        }
    }
);