let currentDoughnutChart;

function createLoadingPlaceholder() {
    return `
        <div class="placeholder-glow">
            <p class="placeholder col-12"></p>
            <p class="placeholder col-12"></p>
            <p class="placeholder col-12"></p>
        </div>
    `;
}

function extractWords(data) {
    const wordMap = {};
    data.forEach(item => {
        const words = (item['Description'] || '').split(/\s+/);
        words.forEach(word => {
            word = word.toLowerCase();
            if (wordMap[word]) {
                wordMap[word]++;
            } else {
                wordMap[word] = 1;
            }
        });
    });
    return Object.keys(wordMap).map(word => ({ text: word, size: 10 + wordMap[word] * 2 }));
}

function displayStatistics() {
    const statisticsDiv = $('#statistics');
    statisticsDiv.empty(); // Clear existing statistics

    // Create table card with loading placeholder
    const tableCard = $(`
        <div class="col-md-6">
            <div class="card mb-3">
                <div class="card-header">Framework components
                    <button type="button" class="btn btn-sm btn-outline-light" data-bs-toggle="tooltip" data-bs-html="true" data-bs-title="Taxonomy refers to the naming for each level in the framework. Up to 4 levels are supported, and the name for each level can be set from the following list:<br>
                    <em>domain, competency, behaviour, indicator, outcome, level, concept, value, practice, skill, proficiency</em>">
                      <i class="fa-regular fa-circle-question"></i>
                    </button>
                </div>    
                <div class="card-body">
                    ${createLoadingPlaceholder()}
                </div>
            </div>
        </div>
    `);
    statisticsDiv.append(tableCard);

    // Create doughnut chart card with loading placeholder
    const chartCard = $(`
        <div class="col-md-6">
            <div class="card mb-3">
                <div class="card-header">Component distribution</div>
                <div class="card-body">
                    ${createLoadingPlaceholder()}
                </div>
            </div>
        </div>
    `);
    statisticsDiv.append(chartCard);

    // Create word cloud card with loading placeholder
    const wordCloudCard = $(`
        <div class="col-md-12">
            <div class="card mb-3">
                <div class="card-header">Word Cloud</div>
                <div class="card-body">
                    ${createLoadingPlaceholder()}
                </div>
            </div>
        </div>
    `);
    statisticsDiv.append(wordCloudCard);

    setTimeout(() => {
        if (!appState.originalData || appState.originalData.length === 0) {
            console.error('No original data available');
            return;
        }

        const taxonomy = appState.originalData[0]['Taxonomy'] ? appState.originalData[0]['Taxonomy'].split(',') : appState.taxonomyLevels;
        const stats = {};

        taxonomy.forEach(level => {
            stats[level] = 0;
        });

        appState.originalData.forEach((item, index) => {
            if (index === 0) return; // Skip the root node

            const level = getTaxonomyLevel({ id: item['ID number'] || item['ID'] }, taxonomy);
            if (stats[level] !== undefined) {
                stats[level]++;
            }
        });

        const filteredStats = Object.keys(stats).reduce((filtered, key) => {
            if (stats[key] > 0) {
                filtered[key] = stats[key];
            }
            return filtered;
        }, {});

        const totalItems = Object.values(filteredStats).reduce((a, b) => a + b, 0);

        // Replace loading placeholder in table card with actual content
        tableCard.find('.card-body').html(`
            <table class="table table-hover">
                <thead>
                    <tr><th>Component</th><th>Count</th><th>Percentage</th></tr>
                </thead>
                <tbody class="table-group-divider">
                    ${Object.keys(filteredStats).map(key => {
                        const count = filteredStats[key];
                        const percentage = ((count / totalItems) * 100).toFixed(2) + '%';
                        return `<tr><td class="lead">${key}</td><td class="h4">${count}</td><td><mark>${percentage}</mark></td></tr>`;
                    }).join('')}
                </tbody>
            </table>
        `);

        // Replace loading placeholder in chart card with the canvas for the chart
        chartCard.find('.card-body').html(`<canvas id="stats-chart"></canvas>`);

        // Initialize the doughnut chart
        const ctx = document.getElementById('stats-chart').getContext('2d');
        const chartData = {
            labels: Object.keys(filteredStats),
            datasets: [{
                data: Object.values(filteredStats),
                backgroundColor: ['#ea4335', '#9510ac', '#34a853', '#fbbc04', '#4285f4'],
            }]
        };

        if (currentDoughnutChart) {
            currentDoughnutChart.destroy();
        }

        currentDoughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });

        // Generate word cloud
        const words = extractWords(appState.originalData);
        wordCloudCard.find('.card-body').html(`<div id="wordcloud"></div>`);
        generateWordCloud(words);

        $('#statistics').show();
    }, 1000); // Simulate loading delay
}
