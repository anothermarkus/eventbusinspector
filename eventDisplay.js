// eventDisplay.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateEventList') {
        const event = message.event;

        // Get the event list container (table body)
        const eventList = document.getElementById('eventList');

        // Create a new row for the event
        const row = document.createElement('tr');

        // Create the Event Type column
        const eventTypeCell = document.createElement('td');
        eventTypeCell.textContent = event.type.charAt(0).toUpperCase() + event.type.slice(1); // Capitalize the type
        row.appendChild(eventTypeCell);

        // Create the Event Details column
        const eventDetailsCell = document.createElement('td');

        // Build the event details string
        let eventDetails = `EventBus: ${event.eventBusName}, Event: ${JSON.stringify(event.eventKey.data.event)}, Channel: ${JSON.stringify(event.eventKey.data.channel)}`;

        // Conditionally add the topic after Channel if it exists
        if (event.eventKey.data.topic) {
            eventDetails += `, Topic: ${JSON.stringify(event.eventKey.data.topic)}`;
        }

        // Add Data after Topic
        eventDetails += `, Data: ${JSON.stringify(event.eventKey.data)}`;

        // Add the event details to the table cell
        eventDetailsCell.textContent = eventDetails;
        row.appendChild(eventDetailsCell);

        // Create the Timestamp column
        const timestampCell = document.createElement('td');
        const timestamp = new Date().toLocaleString(); // Get current timestamp
        timestampCell.textContent = timestamp;
        row.appendChild(timestampCell);

        // Append the row to the table body
        eventList.appendChild(row);
    }
});

// Export to CSV function
document.getElementById('exportButton').addEventListener('click', function () {
    const table = document.getElementById('eventTable');
    const rows = table.querySelectorAll('tr');
    let csvContent = "Event Type,Event Details,Timestamp\n";

    // Loop through each row in the table (skipping the header)
    rows.forEach((row, index) => {
        if (index > 0) {  // Skip the header row
            const columns = row.querySelectorAll('td');
            const rowData = Array.from(columns).map(col => `"${col.textContent.replace(/"/g, '""')}"`).join(',');
            csvContent += rowData + "\n";
        }
    });

    // Create a hidden anchor element to download the CSV file
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    downloadLink.setAttribute('download', 'events.csv');
    document.body.appendChild(downloadLink);

    // Trigger a click on the hidden link to start the download
    downloadLink.click();

    // Remove the link after downloading
    document.body.removeChild(downloadLink);
});
