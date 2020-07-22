let data = {
    totalNoofFiles: 0,
    completed: 0,
    in_progress: 0,
    interrupted: 0,
    progress: 0,
    failed: []
};

let datasetName = 'Sample name';
let clearDatasetName = 'No Downloads in Progress';

updatePopup();

$(document).ready(function() {
    updatePopup();
    $("#searchBar").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#datasetName").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});

function updateProgressBar(progress) {
    let element = document.getElementById('progress_bar');
    element.style.width = parseInt(progress) + '%';
    element.innerHTML = parseInt(progress) + '%';
}

chrome.runtime.onMessage.addListener(function(message, sender, sendMessage) {
    if (
        typeof(message) === "object" &&
        message.message == "update-popup-progress"
    ) {
        data = message.data;
        console.log(data);
        updateProgressBar(data.progress);
    }
});

function updatePopup() {
    if (data.progress >= 100) {
        data.progress = 0;
    } else {
        chrome.runtime.sendMessage({
            message: "update-popup"
        });
    }

}

$(cancel).click(function() {
    chrome.runtime.sendMessage({ message: "pause-download" });
    cancelConfirmation();
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
    swal({
            buttons: {
                red: {
                    text: "Default folder",
                    value: "Earthdata-BulkDownloads"
                },
                confirm: {
                    text: "Edit folder",
                    value: true
                }

            },
            content: {
                element: "input",
                attributes: {
                    placeholder: "Enter folder-name",
                    type: "text",
                },
            }
        })
        .then((value) => {
            let mainFolderName = value;
            swal(`Downloads will be saved in the folder: ${value}`);
            chrome.storage.sync.set({ 'mainFolderName': mainFolderName });
            console.log(value);
        });
});
$(clearPopup).click(function() {
    chrome.storage.sync.set({ 'datasetName': clearDatasetName });
    document.getElementById("datasetName").innerHTML = clearDatasetName;
    document.getElementById("pendingCount").innerHTML = '0';
    document.getElementById("finishedCount").innerHTML = '0';
    updateProgressBar(0);
});

//displaying the datasetname in the popup window
chrome.storage.sync.get(['datasetName'], function(items) {
    datasetName = items.datasetName;
    if (datasetName) {
        if (datasetName.length > 45) {
            datasetName = datasetName.slice(0, 40) + '...';
            document.getElementById("datasetName").innerHTML = datasetName;
        }
    }
});

function cancelConfirmation() {

    swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            buttons: {
                red: {
                    text: "OK, Cancel",
                    value: "cancel"
                },
                green: {
                    text: "Resume Downloads",
                    value: "resume"
                }
            },
        })
        .then((value) => {
            if (value == "resume") {
                chrome.runtime.sendMessage({ message: "resume-download" });
                swal({
                    title: "Resumed!",
                    text: "Downloads are now resumed!",
                    icon: "success",
                })
            }
            if (value == "cancel") {
                data.progress = 0;
                updateProgressBar(data.progress);
                chrome.runtime.sendMessage({ message: "cancel-download" });
                swal({
                    title: "Cancelled!",
                    text: "Your downloads have been cancelled!",
                    icon: "error"
                })
            }
        });

}