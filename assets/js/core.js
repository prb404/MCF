const appState = {
    originalData: [],
    taxonomyLevels: [],
    levelMap: {},
    isTreeExpanded: false,
    currentPieChart: null
};

function resetTreeAndDetails() {
    $('#tree').jstree("destroy").empty();
    $('#details').empty();
    $('#selected-title').text('Selected Competency Framework');
    $('#tree-loading').show();
    $('#details-loading').show();
    $('#statistics').hide();
    if (appState.currentPieChart) {
        appState.currentPieChart.destroy();
        appState.currentPieChart = null;
    }
}

function initializeTree() {
    $('#tree').on('select_node.jstree', function (e, data) {
        var node = data.node.original;
        showLoadingInDetails();
        setTimeout(() => {
            showDetails(node);
        }, 500); // Simulate loading delay
    });
}

function createTree(data) {
    var treeData = formatDataToTree(data);
    $('#tree').jstree({
        'core': {
            'data': treeData
        },
        "search": {
            "case_insensitive": true,
            "show_only_matches": true
        },
        "plugins": ["search"]
    });
    initializeTree();
    $('#tree-loading').hide(); // Hide loading effect after tree is created
    $('#tree').show(); // Show tree if it has content
}

function formatDataToTree(data) {
    var tree = [];
    var idMap = {};
    var rootNode;

    data.forEach(function (item, index) {
        var id = item['ID number'] || item['ID'];
        var parent = item['Parent ID number'] || item['ParentID'] || '#';
        var text = item['Short name'] || item['Name'] || item['Competency'];

        if (id && text) {
            var placeholders = item;
            id = replacePlaceholders(id, placeholders);
            parent = replacePlaceholders(parent, placeholders);
            text = replacePlaceholders(text, placeholders);

            var node = {
                id: id,
                parent: parent === '' ? '#' : parent,
                text: text,
                original: item
            };

            // Treat the first line as the root node
            if (index === 0) {
                rootNode = node;
                appState.levelMap[id] = 0; // Root node level
            } else {
                appState.levelMap[id] = (appState.levelMap[parent] || 0) + 1; // Correct level assignment
                tree.push(node);
            }

            idMap[id] = node;
        }
    });

    if (rootNode) {
        tree.unshift(rootNode); // Ensure the root node is at the beginning
    }

    return tree;
}

function getTaxonomyLevel(node, taxonomy) {
    var level = appState.levelMap[node.id]; // Get the level from the levelMap
    return level === 0 ? 'Competency Framework' : (taxonomy[level - 1] || 'Competency');
}

function replacePlaceholders(item, placeholders) {
    let replacedItem = item;
    for (const [placeholder, value] of Object.entries(placeholders)) {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        replacedItem = replacedItem.replace(regex, value);
    }
    return replacedItem;
}

function showDetails(node) {
    if (!node) {
        $('#details').hide();
        return;
    }

    var placeholders = node.original;
    var name = replacePlaceholders(node.original['Short name'] || node.original['Name'] || node.original['Competency'] || '', placeholders);
    var id = replacePlaceholders(node.original['ID number'] || node.original['ID'] || '', placeholders);
    var description = replacePlaceholders(node.original['Description'] || '', placeholders);
    var taxonomy = appState.originalData[0]['Taxonomy'] ? appState.originalData[0]['Taxonomy'].split(',') : appState.taxonomyLevels;
    var taxonomyLevel = getTaxonomyLevel(node, taxonomy);

    var crossReferencedIDs = node.original['Cross-referenced competency ID numbers'] || '';
    var crossReferencedNames = crossReferencedIDs.split(',').filter(refId => refId.trim() !== '').map(refId => {
        var referencedNode = $('#tree').jstree(true).get_node(refId.trim());
        if (referencedNode) {
            return `<button class="btn btn-outline-secondary cross-ref-btn" data-id="${refId.trim()}">${referencedNode.text} <kbd>${refId.trim()}</kbd></button>`;
        } else {
            return `<kbd>${refId.trim()}</kbd>`;
        }
    }).join('<br>');

    $('#selected-title').text(`Selected ${taxonomyLevel}`);
    $('#details').html(`
        <h5>${name} <kbd>${id}</kbd></h5>
        <div>${description}</div>
        <h6>Cross-referenced competencies:</h6>
        <p>${crossReferencedNames}</p>
    `);
    $('#details-loading').hide(); // Hide loading effect after details are loaded
    $('#details').show(); // Show details if they have content

    // Add click event listener for cross-reference buttons
    $('.cross-ref-btn').on('click', function () {
        var refId = $(this).data('id');
        $('#tree').jstree('deselect_all');
        $('#tree').jstree('select_node', refId);
    });

    // Hide statistics if any node other than the framework is selected
    $('#statistics').hide();
}

function showLoadingInDetails() {
    $('#details').html(`
        <div id="details-loading" class="placeholder-glow">
            <p class="placeholder col-12"></p>
            <p class="placeholder col-12"></p>
            <p class="placeholder col-12"></p>
        </div>
    `);
}

function resetSearch() {
    $('#search').val('');
    $('#tree').jstree('clear_search');
    $('#tree').jstree('destroy').empty();
    createTree(appState.originalData);
}

