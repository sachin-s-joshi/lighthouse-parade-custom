import csvParse from 'csv-parse/lib/sync.js';
export const reportToRowHeaders = (csvFileContents) => {
    const singleReportRows = csvParse(csvFileContents, {
        columns: true,
        skip_empty_lines: true,
        ltrim: true,
        relax: true, // https://csv.js.org/parse/options/
    });
    if (!singleReportRows || singleReportRows.length === 0)
        throw new Error('Unable to find report headers');
    const headers = [
        'Requested URL',
        'Final URL',
        ...singleReportRows.map((row) => `${row.category}: ${row.title} (${row.type})`),
    ];
    return headers;
};
export const reportToRow = (csvFileContents) => {
    const reportRows = csvParse(csvFileContents, {
        // https://csv.js.org/parse/options/
        columns: true,
        skip_empty_lines: true,
        ltrim: true,
    });
    // Sometimes reports come out half-baked...
    if (!reportRows || reportRows.length === 0) {
        return false;
    }
    const csvRow = [
        reportRows[0].requestedUrl,
        reportRows[0].finalUrl,
        ...reportRows.map((reportRow) => reportRow.score),
    ];
    return csvRow;
};
