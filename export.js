const sqlite = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Connect to the database
const db = new sqlite(path.resolve(__dirname, 'sambhav.db'));

console.log('✅ Connected to database.');

try {
    // 1. Fetch all tickets from the database
    const tickets = db.prepare('SELECT * FROM tickets').all();
    console.log(`🔎 Found ${tickets.length} tickets to export.`);

    if (tickets.length === 0) {
        console.log('No tickets to export. Exiting.');
        return;
    }

    // 2. Define CSV headers from the keys of the first ticket object
    const headers = Object.keys(tickets[0]);
    
    // 3. Convert ticket data to CSV format
    const csvRows = [
        headers.join(','), // Header row
        ...tickets.map(row => 
            headers.map(fieldName => {
                let fieldValue = row[fieldName];
                // Handle null values and fields containing commas
                if (fieldValue === null || fieldValue === undefined) {
                    return '';
                }
                let stringValue = String(fieldValue);
                // Escape quotes and wrap in quotes if it contains a comma or quote
                if (stringValue.includes(',') || stringValue.includes('"')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')
        )
    ];

    const csvContent = csvRows.join('\n');
    
    // 4. Write the CSV content to a file
    fs.writeFileSync('tickets.csv', csvContent);
    console.log('✅ Export successful! Data saved to tickets.csv');

} catch (error) {
    console.error('❌ An error occurred during the export:', error);
} finally {
    db.close();
    console.log('Disconnected from database.');
}