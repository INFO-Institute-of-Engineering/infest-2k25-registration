document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();


    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        whatsapp: document.getElementById('whatsapp').value,
        college: document.getElementById('college').value,
        year: document.getElementById('year').value,
        department: document.getElementById('department').value,
        projectLink: document.getElementById('projectLink').value,
        paymentMode: document.getElementById('paymentMode').value
    };


    if (formData.paymentMode === 'online') {
        initiateRazorpayPayment(formData);
    } else if (formData.paymentMode === 'offline') {
        completeOfflineRegistration(formData);
    } else {
        // Just save to MongoDB and send email without ticket
        await saveToMongoDB(formData);
        alert('Registration successful! Check your email for confirmation.');
    }
});


function filterOptions() {
    const department = document.getElementById('department').value;
    console.log(`Selected Department: ${department}`);
    // Add logic here if you want to dynamically filter options based on department
}


function handlePaymentMode() {
    const paymentMode = document.getElementById('paymentMode').value;
    console.log(`Payment Mode: ${paymentMode}`);
}


async function initiateRazorpayPayment(formData) {
    const response = await fetch('http://localhost:3000/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50000 }) // Amount in paise (e.g., 500 INR)
    });
    const order = await response.json();


    const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
        amount: order.amount,
        currency: 'INR',
        name: 'Event Registration',
        description: 'Registration Fee',
        order_id: order.id,
        handler: async function (response) {
            const paymentData = {
                ...formData,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
            };
            await saveToMongoDB(paymentData);
            alert('Payment successful! Check your email for confirmation.');
        },
        prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
        },
        theme: { color: '#007bff' }
    };


    const rzp = new Razorpay(options);
    rzp.open();
}


async function completeOfflineRegistration(formData) {
    const ticketNumber = `TICKET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const dataWithTicket = { ...formData, ticketNumber };
    await saveToMongoDB(dataWithTicket);


    document.getElementById('ticketValue').textContent = ticketNumber;
    document.getElementById('ticketNumber').style.display = 'block';
    alert('Offline registration successful! Check your email for confirmation.');
}


async function saveToMongoDB(data) {
    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}