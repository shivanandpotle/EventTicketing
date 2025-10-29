document.addEventListener('DOMContentLoaded', () => {
    const bookingTableBody = document.querySelector('#bookingTable tbody');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const scanResultDiv = document.getElementById('qr-scan-result');
    const searchBox = document.getElementById('search-box');
    let allBookings = []; // Store the full list of bookings

    // --- Fetch and Display Bookings ---
    const fetchBookings = async () => {
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';

        try {
            const response = await fetch('/api/bookings');
            if (response.status === 401 || response.status === 403) {
                window.location.href = '/login';
                return;
            }
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            allBookings = await response.json();
            displayBookings(allBookings); // Display all bookings initially
        } catch (error) {
            console.error('Error fetching bookings:', error);
            errorDiv.textContent = 'Failed to load bookings. Please try again later.';
            errorDiv.style.display = 'block';
        } finally {
            loadingDiv.style.display = 'none';
        }
    };

    const displayBookings = (bookings) => {
        bookingTableBody.innerHTML = '';
        if (bookings.length === 0) {
            const row = bookingTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7; // UPDATED: from 6 to 7
            cell.textContent = 'No confirmed bookings found.';
            cell.style.textAlign = 'center';
            return;
        }

        bookings.forEach(booking => {
            const row = bookingTableBody.insertRow();
            
            // NEW: Helper function to create status pills
            const createStatusPill = (status) => {
                const statusText = escapeHtml(status) || 'pending';
                // Use 'status-confirmed' (blue) for 'pending' as a default
                let statusClass = (statusText === 'checked-in') ? 'status-checked-in' : 'status-confirmed';
                
                return `<span class="status-pill ${statusClass}">${statusText}</span>`;
            };

            const statusDay1 = createStatusPill(booking.status_day_1);
            const statusDay2 = createStatusPill(booking.status_day_2);
            // End of New Code
            
            // Correctly display the attendee's name and age group
            const attendeesHTML = `<strong>${escapeHtml(booking.name)}</strong><br><span class="attendee-list">${escapeHtml(booking.age_group || '')}</span>`;

            // Correctly display student info
            const studentInfo = booking.is_student ? `Yes (${escapeHtml(booking.prn_number || 'N/A')})` : 'No';
            
            // Correctly display contact info
            const contactHTML = `${escapeHtml(booking.email)}<br><span class="contact-phone">${escapeHtml(booking.whatsapp_number)}</span>`;

            // UPDATED: row.innerHTML to use new status columns
            row.innerHTML = `
                <td>${statusDay1}</td>
                <td>${statusDay2}</td>
                <td>${attendeesHTML}</td>
                <td>${escapeHtml(booking.event)}</td>
                <td>${contactHTML}</td>
                <td>${studentInfo}</td>
                <td class="ticket-id">${escapeHtml(booking._id)}</td>
            `;
            // End of Update
        });
    };
    
    // --- Filter Bookings ---
    const filterBookings = () => {
        const query = searchBox.value.toLowerCase();
        const filtered = allBookings.filter(booking => 
            booking._id.toLowerCase().includes(query)
        );
        displayBookings(filtered);
    };

    // --- QR Code Scanner Logic ---
    const onScanSuccess = async (decodedText, decodedResult) => {
        try {
            html5QrcodeScanner.pause();
        } catch (e) {
            console.warn("Could not pause scanner", e)
        }
        
        // NEW: Read the selected day from the radio buttons
        const selectedDay = document.querySelector('input[name="scan_day"]:checked').value;
        
        scanResultDiv.className = 'processing';
        // UPDATED: Show which day is being processed
        scanResultDiv.innerHTML = `Processing Ticket ID: <strong>${decodedText}</strong> for <strong>Day ${selectedDay}</strong>...`;

        try {
            // UPDATED: Add the selectedDay as a query parameter in the fetch URL
            const response = await fetch(`/api/validate-ticket/${decodedText}?day=${selectedDay}`, { method: 'POST' });
            const result = await response.json();

            scanResultDiv.className = result.success ? 'success' : 'error';
            let resultHTML = `<strong>${result.message}</strong>`;
            if(result.ticket) {
                // Correctly display name from the ticket object in the scanner result
                resultHTML += `<br><span>Name: ${result.ticket.name} | Event: ${result.ticket.event}</span>`;
            }
            scanResultDiv.innerHTML = resultHTML;
            
            fetchBookings(); // Refresh the table to show the new status

        } catch (error) {
            scanResultDiv.className = 'error';
            scanResultDiv.innerHTML = `<strong>Error:</strong> Could not validate ticket.`;
            console.error('Validation error:', error);
        }
        
        setTimeout(() => {
             try {
                html5QrcodeScanner.resume();
             } catch(e) {
                console.warn("Could not resume scanner", e);
             }
             scanResultDiv.className = '';
             scanResultDiv.textContent = "Scan a ticket's QR code to validate.";
        }, 4000);
    };

    let html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
    );
    html5QrcodeScanner.render(onScanSuccess, (error) => {});


    // --- Helper Function ---
    const escapeHtml = (unsafe) => {
        if (typeof unsafe !== 'string') return unsafe === null || unsafe === undefined ? '' : unsafe;
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };

    // --- Event Listener for Search ---
    searchBox.addEventListener('input', filterBookings);

    // --- Initial Load ---
    fetchBookings();
});
