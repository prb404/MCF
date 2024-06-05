// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

$(document).ready(function () {
    function handleFileParsingComplete(results) {
        appState.originalData = results.data;
        appState.taxonomyLevels = (appState.originalData[0]['Taxonomy'] || '').split(',').map(level => level.trim());
        createTree(appState.originalData);
        displayStatistics(); // Load general statistics
        hideLoadingEffects();
    }

    function parseCSV(file, isText = false) {
        return new Promise((resolve, reject) => {
            const config = {
                header: true,
                complete: function (results) {
                    if (results.data.length === 0) {
                        showAlert('No data found in the CSV file.');
                        hideLoadingEffects();
                        return;
                    }
                    handleFileParsingComplete(results);
                    resolve();
                },
                error: function (error) {
                    reject(error);
                }
            };

            if (isText) {
                Papa.parse(file, config);
            } else {
                Papa.parse(file, {
                    ...config,
                    complete: function (results) {
                        handleFileParsingComplete(results);
                        resolve();
                    },
                });
            }
        });
    }

    function fetchAndParseCSV(path) {
        return fetch(path)
            .then(response => response.text())
            .then(csvText => parseCSV(csvText, true));
    }

    function showLoadingEffects() {
        $('#tree-loading').show();
        $('#details-loading').show();
        $('#stats-loading').show();
        $('#tree').hide();
        $('#details').hide();
    }

    function hideLoadingEffects() {
        $('#tree-loading').hide();
        $('#details-loading').hide();
        $('#stats-loading').hide();
    }

    $('#csvFileInput').on('change', function (e) {
        var file = e.target.files[0];
        if (file) {
            resetTreeAndDetails();
            showLoadingEffects();
            $('#csvFileName').hide();
            parseCSV(file)
                .catch(error => console.error('Error parsing file:', error));
        }
    });

    $('#search').on('input', function () {
        var query = $(this).val();
        $('#tree').jstree(true).search(query);
    });

    $('#search-clear').on('click', function () {
        resetSearch();
    });

    $('#toggle-expand-collapse').on('click', function () {
        if (appState.isTreeExpanded) {
            $('#tree').jstree('close_all');
            $('#expand-collapse-icon').removeClass('bi-arrows-collapse').addClass('bi-arrows-expand');
            appState.isTreeExpanded = false;
        } else {
            $('#tree').jstree('open_all');
            $('#expand-collapse-icon').removeClass('bi-arrows-expand').addClass('bi-arrows-collapse');
            appState.isTreeExpanded = true;
        }
    });

    $('#show-stats').on('click', function () {
        showStatisticsPanel();
    });

    function populateSampleFilesDropdown() {
        const dropdown = $('#sampleFilesDropdown');
        sampleFiles.forEach(file => {
            const listItem = $('<li><a class="dropdown-item" href="#">' + file.name + '</a></li>');
            listItem.on('click', function () {
                resetTreeAndDetails();
                showLoadingEffects();
                fetchAndParseCSV(file.path)
                    .then(() => {
                        showAlert(`Sample loaded: ${file.name}`);
                        $('#csvFileName').val(file.name).show();
                        $('#csvFileInput').val('');
                    })
                    .catch(error => console.error('Error fetching and parsing file:', error));
            });
            dropdown.append(listItem);
        });
    }

    function showStatisticsPanel() {
        // Clear details and show statistics
        $('#details').empty();
        $('#details').hide();
        $('#selected-title').text('Selected Competency Framework');
        displayStatistics();
    }

    populateSampleFilesDropdown();
});
