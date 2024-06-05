const sampleFiles = [
    { name: '2011-385_Referentiel_C2i2e_Version_2011_C2i2e_2011_comma_separated', path: 'framework_samples/2011-385_Referentiel_C2i2e_Version_2011_C2i2e_2011_comma_separated.csv' },
    { name: '2016-206_CEFR_for_STEM_2016_20211102_1352_comma_separated', path: 'framework_samples/2016-206_CEFR_for_STEM_2016_20211102_1352_comma_separated.csv' },
    { name: '2018-429_ISTE_Standards_for_Educators_ISTE_Educators_2018_20180906_1342_comma_separated', path: 'framework_samples/2018-429_ISTE_Standards_for_Educators_ISTE_Educators_2018_20180906_1342_comma_separated.csv' },
    { name: '2021-Master MEEF - PIF - NEO - INSPÉ-NEO-PIF-20240531_1846-comma_separated', path: 'framework_samples/2021-Master MEEF - PIF - NEO - INSPÉ-NEO-PIF-20240531_1846-comma_separated.csv' },
    { name: '2023-774_DigCompLMSAdmin_1979_20230214_0934_comma_separated', path: 'framework_samples/2023-774_DigCompLMSAdmin_1979_20230214_0934_comma_separated.csv' }
];

function showAlert(message) {
    const alertId = 'alert-' + Date.now();
    const alertHtml = `
        <div id="${alertId}" class="alert alert-info alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    $('#alert-container').append(alertHtml);
    setTimeout(() => {
        $(`#${alertId}`).alert('close');
    }, 5000);
}

