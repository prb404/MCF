// 🔴 assets/JS/Controller/endPanelController.js

var App = App || {};

App.statisticsLoader = (function() {
    function displayStatistics() {
        $('#statistics').show();

        $('#table-card').show();
        App.statistics.generateTableContent(App.state.appState.data);

        $('#chart-card').show();
        App.chart.generateDoughnutChartContent(App.state.appState.data);

        $('#tagcloud-card').show();
        App.tagcloud.generateTagCloudContent();
    }

    return {
        displayStatistics: displayStatistics
    };
})();

$(document).ready(function() {
    $('#statistics-container').hide();
    // $.getJSON('framework_samples/samples.json', function(data) {
    //     App.fileHandling.populateSampleFilesDropdown(data);
    // });

    $('#csvFileInput').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            App.fileHandling.parseCSV(file).then(data => {
                App.statisticsLoader.displayStatistics();
            });
        }
    });
});

App.details = (function() {
    function showDetails(nodes) {
        if (!nodes || nodes.length === 0) {
            $('#details').hide();
            return;
        }

        const detailsHtml = nodes.map(node => {
            const sanitizedId = App.state.sanitizeID(node.id);
            const placeholders = node.original;
            const name = App.tree.replacePlaceholders(_.get(node.original, 'Short name', _.get(node.original, 'Competency', '')), placeholders);
            const id = App.tree.replacePlaceholders(_.get(node.original, 'ID number', _.get(node.original, 'ID', '')), placeholders);
            const description = App.tree.replacePlaceholders(_.get(node.original, 'Description', ''), placeholders);
            const crossReferencedIDs = createCrossReferencedHTML(node);

            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${name} <kbd>${id}</kbd></h5>
                        <p class="card-text">${description}</p>
                        ${crossReferencedIDs}
                    </div>
                </div>
            `;
        }).join('');

        $('#details').html(detailsHtml).show();
        $('#statistics').hide();
    }

    function createCrossReferencedHTML(node) {
        const crossReferencedIDs = _.get(node.original, 'Cross-referenced competency ID numbers', '').split(',').filter(id => id.trim() !== '');
        return crossReferencedIDs.length > 0 ? `
            <h6>Cross-referenced competencies:</h6>
            <p>${crossReferencedIDs.map(refId => `<button class="btn btn-link p-0" onclick="App.details.selectNode('${refId.trim()}')"><kbd>${refId.trim()}</kbd></button>`).join('<br>')}</p>
        ` : '';
    }

    function selectNode(nodeId) {
        $('#tree').jstree('deselect_all');
        $('#tree').jstree('select_node', nodeId);
    }

    return {
        showDetails: showDetails,
        selectNode: selectNode
    };
})();
