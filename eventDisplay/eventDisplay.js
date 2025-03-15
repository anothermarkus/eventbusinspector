class EventDisplay {
    constructor() {
        this.eventList = document.getElementById('eventList');
        this.eventTable = document.getElementById('eventTable');
        this.exportButton = document.getElementById('exportButton');
        
        this.initialize();
    }

    // Initialize event listeners
    initialize() {
        // Listen for messages from background or content scripts
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'updateEventList') {
                this.updateEventList(message.event);
            }
        });

        // Export to CSV when the export button is clicked
        this.exportButton.addEventListener('click', () => {
            this.exportToCSV();
        });
    }

    // Update the event list when receiving an event from the background script
    updateEventList(event) {
        // Create a new row for the event
        const row = document.createElement('tr');

        // Event Type column
        const eventTypeCell = document.createElement('td');
        eventTypeCell.textContent = this.capitalizeFirstLetter(event.type);
        row.appendChild(eventTypeCell);

        // Event Details column
        const eventDetailsCell = document.createElement('td');
        eventDetailsCell.textContent = this.buildEventDetails(event);
        row.appendChild(eventDetailsCell);

        // Timestamp column
        const timestampCell = document.createElement('td');
        timestampCell.textContent = new Date().toLocaleString();
        row.appendChild(timestampCell);

        // Append the row to the table body
        this.eventList.appendChild(row);
    }

    // Capitalize the first letter of the event type
    capitalizeFirstLetter(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    // Build the event details string
    buildEventDetails(event) {
        let eventDetails = `EventBus: ${event.eventBusName}, Event: ${JSON.stringify(event.eventKey.data.event)}, Channel: ${JSON.stringify(event.eventKey.data.channel)}`;

        // Conditionally add the topic after Channel if it exists
        if (event.eventKey.data.topic) {
            eventDetails += `, Topic: ${JSON.stringify(event.eventKey.data.topic)}`;
        }

        eventDetails += `, Data: ${JSON.stringify(event.eventKey.data)}`;
        return eventDetails;
    }

    // Export event data from the table to CSV
    exportToCSV() {
        let csvContent = "Event Type,Event Details,Timestamp\n";

        // Loop through each row in the table (skipping the header)
        const rows = this.eventTable.querySelectorAll('tr');
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
    }
}

// Initialize the EventDisplay class when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EventDisplay();
});
