document.addEventListener('DOMContentLoaded', () => {
    const bookingTableBody = document.querySelector('#bookingTable tbody');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const scanResultDiv = document.getElementById('qr-scan-result');

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

            const bookings = await response.json();
            displayBookings(bookings);
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
            cell.colSpan = 6;
            cell.textContent = 'No confirmed bookings yet.';
            cell.style.textAlign = 'center';
            return;
        }

        bookings.forEach(booking => {
            const row = bookingTableBody.insertRow();
            const statusClass = booking.status === 'checked-in' ? 'status-checked-in' : 'status-confirmed';
            
            // Correctly display the attendee's name and age group
            const attendeesHTML = `<strong>${escapeHtml(booking.name)}</strong><br><span class="attendee-list">${escapeHtml(booking.age_group || '')}</span>`;

            // Correctly display student info
            const studentInfo = booking.is_student ? `Yes (${escapeHtml(booking.prn_number || 'N/A')})` : 'No';
            
            // Correctly display contact info
            const contactHTML = `${escapeHtml(booking.email)}<br><span class="contact-phone">${escapeHtml(booking.whatsapp_number)}</span>`;

            row.innerHTML = `
                <td><span class="status-pill ${statusClass}">${escapeHtml(booking.status)}</span></td>
                <td>${attendeesHTML}</td>
                <td>${escapeHtml(booking.event)}</td>
                <td>${contactHTML}</td>
                <td>${studentInfo}</td>
                <td class="ticket-id">${escapeHtml(booking._id)}</td>
            `;
        });
    };

    // --- QR Code Scanner Logic ---
    const onScanSuccess = async (decodedText, decodedResult) => {
        try {
            html5QrcodeScanner.pause();
        } catch (e) {
            console.warn("Could not pause scanner", e)
        }
        
        scanResultDiv.className = 'processing';
        scanResultDiv.innerHTML = `Processing Ticket ID: <strong>${decodedText}</strong>...`;

        try {
            const response = await fetch(`/api/validate-ticket/${decodedText}`, { method: 'POST' });
            const result = await response.json();

            scanResultDiv.className = result.success ? 'success' : 'error';
            let resultHTML = `<strong>${result.message}</strong>`;
            if(result.ticket) {
                // Correctly display name from the ticket object in the scanner result
                resultHTML += `<br><span>Name: ${result.ticket.name} | Event: ${result.ticket.event}</span>`;
            }
            scanResultDiv.innerHTML = resultHTML;
            
            fetchBookings();

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

    // --- Initial Load ---
    fetchBookings();
});