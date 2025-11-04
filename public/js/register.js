document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const form = document.getElementById('bookingForm');
    const eventSelect = document.getElementById('event');
    const quantitySelect = document.getElementById('quantity');
    const attendeesContainer = document.getElementById('attendees-container');
    const studentRadios = document.querySelectorAll('input[name="is_student"]');
    const prnContainer = document.getElementById('prn-container');
    const prnInput = document.getElementById('prn_number');
    const submitBtn = document.getElementById('submitBtn');
    const priceSummaryDiv = document.getElementById('price-summary');

    // --- Price Data ---
    // UPDATED: Set base price to the "Solo" offer
    const EVENT_PRICES = {
        "InspireX": 149
    };

    // --- Fee Configuration ---
    const RAZORPAY_FEE_PERCENT = 0.0236; // This is 2.36% (2% + 18% GST)

    /**
     * Generates input fields for each attendee.
     */
    const generateAttendeeInputs = () => {
        const quantity = parseInt(quantitySelect.value, 10);
        attendeesContainer.innerHTML = ''; // Clear previous inputs

        for (let i = 1; i <= quantity; i++) {
            const attendeeDiv = document.createElement('div');
            attendeeDiv.className = 'attendee-card';
            attendeeDiv.innerHTML = `
                <h4>Attendee #${i} ${i === 1 ? '(Primary)' : ''}</h4>
                <div class="input-group">
                    <input type="text" name="attendee_name" placeholder="Full Name" required>
                </div>
                <div class="input-group">
                    <input type="email" name="attendee_email" placeholder="Email Address (for ticket)" required>
                </div>
                <div class="input-group">
                    <input type="tel" name="attendee_whatsapp" placeholder="WhatsApp Number" required>
                </div>
                <div class="input-group">
                    <select name="attendee_age_group" required>
                        <option value="">-- Select Age Group --</option>
                        <option value="10-16">10-16 years</option>
                        <option value="16-21">16-21 years</option>
                        <option value="21-28">21-28 years</option>
                        <option value="28-35">28-35 years</option>
                        <option value="35+">35+ years</option>
                    </select>
                </div>
            `;
            attendeesContainer.appendChild(attendeeDiv);
        }
    };

    /**
     * Calculates total price and updates the UI.
     */
    const updatePrice = () => {
        const selectedEvent = eventSelect.value;
        const quantity = parseInt(quantitySelect.value, 10);
        const price = EVENT_PRICES[selectedEvent];

        if (!selectedEvent || price === undefined || price === 0) {
            priceSummaryDiv.style.display = 'none';
            submitBtn.textContent = 'Register for Free';
            return;
        }

        // --- UPDATED PRICE LOGIC ---
        let subtotal = price * quantity;
        let discount = 0;
        let discountText = '';

        if (quantity === 5) {
            const finalTicketPrice = 999;
            discount = subtotal - finalTicketPrice; // (249 * 5) - 999 = 246
            discountText = `Group of 5 Offer`;
        } else if (quantity === 2) {
            const finalTicketPrice = 449;
            discount = subtotal - finalTicketPrice; // (249 * 2) - 449 = 49
            discountText = `Duo Offer`;
        }
        // For quantity = 1 (Solo), discount remains 0 and subtotal is 249.

        const ticketTotal = subtotal - discount;
        // --- END OF UPDATED LOGIC ---


        // --- MODIFIED BLOCK 1: Calculate and display the fee ---
        let processingFee = 0;
        let finalTotal = ticketTotal;

        if (ticketTotal > 0) {
            // Calculate the final price so you get the full ticketTotal after fees
            finalTotal = ticketTotal / (1 - RAZORPAY_FEE_PERCENT);
            processingFee = finalTotal - ticketTotal;
        }

        priceSummaryDiv.innerHTML = `
            ${discount > 0 ? `Original Price: ₹${subtotal.toFixed(2)}<br>` : ''}
            ${discount > 0 ? `${discountText}: -₹${discount.toFixed(2)}<br>` : ''}
            ${processingFee > 0 ? `Processing Fee: +₹${processingFee.toFixed(2)}<br>` : ''}
            <strong>Total: ₹${finalTotal.toFixed(2)}</strong>
        `;
        priceSummaryDiv.style.display = 'block';
        submitBtn.textContent = (finalTotal === 0) ? 'Register for Free' : `Pay ₹${finalTotal.toFixed(2)} Now`;
        // --- END OF MODIFIED BLOCK 1 ---
    };

    const togglePrnInput = () => {
        const isStudent = document.querySelector('input[name="is_student"]:checked').value === 'yes';
        prnContainer.style.display = isStudent ? 'block' : 'none';
        prnInput.required = isStudent;
    };

    /**
     * Main handler for form submission.
     */
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        const attendeeCards = document.querySelectorAll('.attendee-card');
        const attendees = Array.from(attendeeCards).map(card => ({
            name: card.querySelector('[name="attendee_name"]').value,
            email: card.querySelector('[name="attendee_email"]').value,
            whatsapp_number: card.querySelector('[name="attendee_whatsapp"]').value,
            age_group: card.querySelector('[name="attendee_age_group"]').value,
        }));

        const isStudent = document.querySelector('input[name="is_student"]:checked').value === 'yes';
        const price = EVENT_PRICES[eventSelect.value];
        const quantity = parseInt(quantitySelect.value, 10);
        
        // --- MODIFIED BLOCK 2: Calculate finalAmount including the fee ---
        // This logic MUST match the updatePrice function
        let finalAmount = 0;
        if (price > 0) {
            const subtotal = price * quantity;
            let discount = 0;
            
            if (quantity === 5) {
                const finalTicketPrice = 999;
                discount = subtotal - finalTicketPrice; // (249 * 5) - 999 = 246
            } else if (quantity === 2) {
                const finalTicketPrice = 449;
                discount = subtotal - finalTicketPrice; // (249 * 2) - 449 = 49
            }

            const ticketTotal = subtotal - discount;

            if (ticketTotal > 0) {
                // This logic MUST match the updatePrice function
                finalAmount = ticketTotal / (1 - RAZORPAY_FEE_PERCENT);
            } else {
                finalAmount = 0;
            }
        }
        // --- END OF MODIFIED BLOCK 2 ---

        const bookingDetails = {
            purchaser_email: document.getElementById('purchaser_email').value,
            purchaser_phone: document.getElementById('purchaser_phone').value,
            event: eventSelect.value,
            quantity: quantity,
            is_student: isStudent,
            prn_number: isStudent ? prnInput.value : null,
            attendees: attendees,
            total_amount: finalAmount // This now includes the processing fee
        };

        const isFreeEvent = finalAmount === 0;

        try {
            if (isFreeEvent) {
                // Handle free event
                const response = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ razorpay_payment_id: 'N/A_free_event', bookingDetails })
                });
                const result = await response.json();
                if (!result.success) throw new Error(result.message);
                alert('Registration successful! Individual tickets have been sent to all attendees.');
                form.reset();
                window.location.reload();
            } else {
                // Handle paid event
                const orderResponse = await fetch('/api/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // Send the finalAmount (which includes the fee) to the server
                    body: JSON.stringify({ amount: finalAmount }) 
                });

                if (!orderResponse.ok) {
                    const errorText = await orderResponse.text();
                    throw new Error(`Server error: ${errorText}`);
                }

                const orderResult = await orderResponse.json();
                if (!orderResult.success) throw new Error(orderResult.message);

                const rzp = new Razorpay({
                    key: 'rzp_live_RJ7y0j6O5Aa9vj', // This should ideally be fetched from the server
                    amount: orderResult.order.amount, // This is the final amount in paise
                    currency: 'INR',
                    name: 'Sambhav Club',
                    description: `Registration for ${bookingDetails.event}`,
                    order_id: orderResult.order.id,
                    handler: async function (response) {
                        const verifyResponse = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...response, bookingDetails })
                        });
                        const verifyResult = await verifyResponse.json();
                        if (verifyResult.success) {
                            alert('Payment successful! Individual tickets have been sent to all attendees.');
                            form.reset();
                            window.location.reload();
                        } else {
                            alert(`Payment verification failed: ${verifyResult.message}`);
                        }
                    },
                    prefill: {
                        name: attendees[0].name,
                        email: bookingDetails.purchaser_email,
                        contact: bookingDetails.purchaser_phone
                    },
                    theme: { color: '#5e5ce6' }
                });
                rzp.on('payment.failed', (response) => alert(`Payment failed: ${response.error.description}`));
                rzp.open();
            }
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            updatePrice();
        }
    };

    // --- Event Listeners ---
    quantitySelect.addEventListener('change', () => {
        generateAttendeeInputs();
        updatePrice();
    });
    eventSelect.addEventListener('change', updatePrice);
    studentRadios.forEach(radio => radio.addEventListener('change', togglePrnInput));
    form.addEventListener('submit', handleFormSubmit);

    // --- Initial Load ---
    generateAttendeeInputs();
    updatePrice();
    togglePrnInput();
});
