// 🔵 assets/JS/Controller/startPanelController.js

var App = App || {};

$(document).ready(function () {
        // console.log('Document ready event triggered');

function handleFileLoad(fileName) {
    // console.log('handleFileLoad:', fileName);  // Debug log
    App.state.appState.fileName = fileName; // Ensure fileName is set in the appState
    App.statistics.displayStatistics();
    App.utilities.updateURL('preview', fileName, App.state.appState.selectedIDs); // Update the URL with the file name and selected IDs
    App.utilities.updatePageTitle(fileName); // Update the page title with the file name
}

function handleFileSelect(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
        App.fileHandling.parseCSV(file)
            .then(() => {
                handleFileLoad(file.name);

                // Wait for the tree to be fully loaded before selecting the first node
                const waitForTreeLoad = new Promise((resolve) => {
                    $('#tree').one('loaded.jstree', function () {
                        resolve();
                    });
                    $('#tree').jstree(true).refresh(); // Force a refresh to trigger the loaded event
                });

                waitForTreeLoad.then(() => {
                    setTimeout(() => {
                        const firstNodeId = $('#tree').jstree(true).get_node('#').children[0];
                        $('#tree').jstree('select_node', firstNodeId);
                        App.state.setSelectedIDs([firstNodeId]);
                    }, 100); // Small delay to ensure the tree is rendered
                });
            })
            .catch(error => console.error('Error parsing file:', error));
        App.alerts.showAlert(`✅ Uploaded file parsed`);
    }
}



function handleSampleFileSelect(path, fileName) {
    App.fileHandling.fetchAndParseCSV(path, fileName)
        .then(() => {
            handleFileLoad(fileName);
            // Automatically select the first node after sample file is loaded
            $('#tree').one('loaded.jstree', function () {
                const firstNodeId = $('#tree').jstree(true).get_node('#').children[0];
                $('#tree').jstree('select_node', firstNodeId);
                App.state.setSelectedIDs([firstNodeId]);
            });
        })
        .catch(error => {
            console.error('Error parsing file:', error);
            App.alerts.showAlert(`❌ Error parsing file: ${fileName}`, 'danger');
        });
}


function handleURLFile() {
    const { mode, fileName, selectedIDs } = App.utilities.getURLParams();
    if (fileName) {
        const filePath = fileName.startsWith('http') ? fileName : `framework_samples/${fileName}`;
        App.state.appState.fileName = fileName; // Ensure fileName is set in the appState
        App.utilities.updatePageTitle(fileName); // Update the page title with the file name
        if (filePath.startsWith('http')) {
            App.fileHandling.fetchAndParseCSV(filePath, fileName)
                .then(() => {
                    handleFileLoad(fileName);
                    if (mode === 'stats') {
                        const offcanvasElement = document.getElementById('offcanvasStats');
                        if (offcanvasElement) {
                            const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
                            bsOffcanvas.show();
                            App.utilities.updateURL('stats', fileName, selectedIDs);
                        }
                    }
                    if (selectedIDs && selectedIDs.length > 0) {
                        $('#tree').one('loaded.jstree', function () {
                            $('#tree').jstree('deselect_all');
                            $('#tree').jstree('select_node', selectedIDs);
                            App.state.setSelectedIDs(selectedIDs);
                        });
                    } else {
                        // Automatically select the first node if no IDs are in the URL
                        $('#tree').one('loaded.jstree', function () {
                            const firstNodeId = $('#tree').jstree(true).get_node('#').children[0];
                            $('#tree').jstree('select_node', firstNodeId);
                            App.state.setSelectedIDs([firstNodeId]);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error fetching and parsing file from URL:', error);
                    App.alerts.showAlert(`❌ Error fetching file from URL: ${fileName}`, 'danger');
                });
        } else {
            $.getJSON('framework_samples/samples.json', function(sampleFiles) {
                const sampleFile = sampleFiles.find(file => file.path === filePath);
                if (sampleFile) {
                    App.fileHandling.fetchAndParseCSV(sampleFile.path, fileName)
                        .then(() => {
                            handleFileLoad(fileName);
                            App.alerts.showAlert(`✅ Sample loaded: ${fileName}`);
                            if (mode === 'stats') {
                                const offcanvasElement = document.getElementById('offcanvasStats');
                                if (offcanvasElement) {
                                    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
                                    bsOffcanvas.show();
                                    App.utilities.updateURL('stats', fileName, selectedIDs);
                                }
                            }
                            if (selectedIDs && selectedIDs.length > 0) {
                                $('#tree').one('loaded.jstree', function () {
                                    $('#tree').jstree('deselect_all');
                                    $('#tree').jstree('select_node', selectedIDs);
                                    App.state.setSelectedIDs(selectedIDs);
                                });
                            } else {
                                // Automatically select the first node if no IDs are in the URL
                                $('#tree').one('loaded.jstree', function () {
                                    const firstNodeId = $('#tree').jstree(true).get_node('#').children[0];
                                    $('#tree').jstree('select_node', firstNodeId);
                                    App.state.setSelectedIDs([firstNodeId]);
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching and parsing file from URL:', error);
                            App.alerts.showAlert(`❌ Error fetching file from samples: ${fileName}`, 'danger');
                        });
                } else {
                    App.alerts.showAlert(`❌ File not found in samples: ${fileName}`, 'danger');
                    window.history.replaceState({}, '', window.location.pathname + "#");
                }
            });
        }
    }
}


    $('#csvFileInput').on('change', handleFileSelect);

    $('#search').on('input', function () {
        const query = $(this).val();
        $('#tree').jstree(true).search(query);
    });

    $('#search-clear').on('click', function () {
        $('#search').val('');
        $('#tree').jstree('clear_search');
    });

    $('#toggle-expand-collapse').on('click', function () {
        const tree = $('#tree').jstree(true);
        if (App.state.appState.isTreeExpanded) {
            tree.close_all();
            $('#expand-collapse-icon').removeClass('bi-arrows-collapse').addClass('bi-arrows-expand');
            App.state.appState.isTreeExpanded = false;
        } else {
            tree.open_all();
            $('#expand-collapse-icon').removeClass('bi-arrows-expand').addClass('bi-arrows-collapse');
            App.state.appState.isTreeExpanded = true;
        }
    });

    $('#show-stats').on('click', function () {
        const offcanvasElement = document.getElementById('offcanvasStats');
        if (offcanvasElement) {
            const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
            bsOffcanvas.show();
            App.state.appState.isStatisticsActive = true;
            App.utilities.updateURL('stats', App.state.appState.fileName, App.state.appState.selectedIDs);
        }
    });

    $('#offcanvasStats').on('hidden.bs.offcanvas', function () {
        const fileName = App.state.appState.fileName;
        const mode = App.state.appState.isEditMode ? 'edit' : 'preview';
        App.state.appState.isStatisticsActive = false;
        App.utilities.updateURL(mode, fileName, App.state.appState.selectedIDs);
    });

    const updateSelectedIDsInURLDebounced = App.utils.debounce(function() {
        App.utilities.updateSelectedIDsInURL();
    }, 300);

$('#tree').on('select_node.jstree', function (e, data) {
    const nodes = data.selected.map(id => {
        const node = data.instance.get_node(id);
        console.log("Node selected: ", node); // Log the selected node
        if (!node.original) {
            console.error("Selected node has no original data:", node);
        }
        return node.original || null;
    }).filter(node => node);
    App.state.appState.currentNode = nodes;
    const fileName = App.state.appState.fileName;
    if (!fileName) {
        console.error('File name is missing');
        return;
    }
    nodes.forEach(node => {
        console.log("Calling selectNode for ID: ", node['ID number']); // Log the ID being selected
        App.state.selectNode(node['ID number']);
    });
        App.details.showDetails(nodes);
    updateSelectedIDsInURLDebounced(); // Update URL with selected IDs
});

    $('#tree').on('deselect_node.jstree', function (e, data) {
        const nodes = data.instance.get_selected(true).map(node => node.original).filter(node => node !== null);
        App.state.appState.currentNode = nodes;
        const fileName = App.state.appState.fileName;
        if (!fileName) {
            console.error('File name is missing');
            return;
        }
        console.log("Calling deselectNode for ID: ", data.node.original['ID number']); // Log the ID being deselected
        data.node.original && App.state.deselectNode(data.node.original['ID number']);
        App.details.showDetails(nodes);

        updateSelectedIDsInURLDebounced(); // Update URL with selected IDs
    });

    App.alerts.initializeTooltips();
    $.getJSON('framework_samples/samples.json', function(data) {
        App.fileHandling.populateSampleFilesDropdown(data);
    });

    // $('#sampleFilesDropdown').on('changed.bs.select', function(e, clickedIndex, isSelected, previousValue) {
    //     const selectedOption = $(this).find('option').eq(clickedIndex);
    //     const filePath = selectedOption.data('path');
    //     const fileName = selectedOption.text();
    //     if (filePath && fileName) {
    //         handleSampleFileSelect(filePath, fileName);
    //     } else {
    //         console.error("No filePath or fileName found in dropdown selection");
    //     }
    // });

    //     // Initialize bootstrap-select
    // $('#sampleFilesDropdown').selectpicker();

    handleURLFile(); // Call this function when the document is ready to handle file from URL

    // Call handleURLFile on document ready if no framework is already loaded
    if (App.state.appState.data.length === 0) {
        handleURLFile();
    }
});

