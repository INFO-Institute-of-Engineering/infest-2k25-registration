// Handle department selection to show specific options
document.getElementById('department').addEventListener('change', function() {
    const departments = ['civil', 'cse', 'ece', 'eee', 'it', 'mech', 'sh'];
    const selectedDepartment = this.value;
    
    // Hide all department option divs
    departments.forEach(dept => {
        document.getElementById(`${dept}-options`).classList.add('hidden');
        
        // Clear required attribute from all department-specific selects
        const selectElement = document.getElementById(`${dept}-category`);
        if (selectElement) {
            selectElement.required = false;
        }
    });
    
    // Show selected department options if any
    if (selectedDepartment && selectedDepartment !== '') {
        const optionsDiv = document.getElementById(`${selectedDepartment}-options`);
        if (optionsDiv) {
            optionsDiv.classList.remove('hidden');
            
            // Make the specific department select required
            const selectElement = document.getElementById(`${selectedDepartment}-category`);
            if (selectElement) {
                selectElement.required = true;
            }
        }
    }
});

// Handle form submission
document.getElementById('submit-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Basic form validation
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const college = document.getElementById('college').value;
    const year = document.getElementById('year').value;
    const department = document.getElementById('department').value;
    const projectLink = document.getElementById('project-link').value;
    const paymentMode = document.getElementById('payment-mode').value;
    
    if (!name || !email || !phone || !whatsapp || !college || !year || !department || !projectLink || !paymentMode) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Validate Google Drive link
    if (!projectLink.includes('drive.google.com')) {
        alert('Please provide a valid Google Drive link for your project/paper.');
        return;
    }
    
    // Handle payment mode
    if (paymentMode === 'online') {
        // Simulate Razorpay integration
        const options = {
            key: 'rzp_test_YOUR_KEY_HERE', // Replace with your actual Razorpay key in production
            amount: 250, // Amount in paise (250 INR)
            currency: 'INR',
            name: 'Event Registration',
            description: 'Registration Fee',
            handler: function(response) {
                // On successful payment
                completeRegistration(response.razorpay_payment_id);
            },
            prefill: {
                name: name,
                email: email,
                contact: phone
            },
            theme: {
                color: '#6e8efb'
            }
        };
        
        // In a real implementation, you would load Razorpay here
        alert('In a real implementation, Razorpay payment window would open here.');
        // Simulating successful payment for demo
        setTimeout(() => {
            completeRegistration('sim_pay_' + Math.random().toString(36).substr(2, 9));
        }, 1000);
    } else {
        // For offline payment
        completeRegistration(null, true);
    }
});

function completeRegistration(paymentId, isOffline = false) {
    // Generate a unique registration ID
    const registrationId = 'REG' + Date.now().toString().slice(-6);
    
    // Get form values for QR code and ticket
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const department = document.getElementById('department').value;
    const departmentText = document.getElementById('department').options[document.getElementById('department').selectedIndex].text;
    
    // Registration data to be sent to backend (in a real implementation)
    const registrationData = {
        registrationId: registrationId,
        name: name,
        email: email,
        phone: document.getElementById('phone').value,
        whatsapp: document.getElementById('whatsapp').value,
        college: document.getElementById('college').value,
        year: document.getElementById('year').value,
        department: department,
        departmentCategory: document.getElementById(department + '-category')?.value || '',
        projectLink: document.getElementById('project-link').value,
        paymentMode: document.getElementById('payment-mode').value,
        paymentId: paymentId,
        timestamp: new Date().toISOString()
    };
    
    // In a real implementation, you would send this data to your backend
    console.log('Registration data:', registrationData);
    
    // Show success message and QR code
    document.getElementById('registration-form').classList.add('hidden');
    document.getElementById('success-container').classList.remove('hidden');
    document.getElementById('registration-id').textContent = registrationId;
    
    // Show offline payment message if applicable
    if (isOffline) {
        document.getElementById('offline-message').classList.remove('hidden');
    }
    
    // Set ticket information
    document.getElementById('ticket-name').textContent = name;
    document.getElementById('ticket-email').textContent = email;
    document.getElementById('ticket-department').textContent = departmentText;
    
    // Generate QR code
    const qrData = JSON.stringify({
        registrationId: registrationId,
        name: name,
        email: email,
        department: departmentText,
        paymentStatus: isOffline ? 'PENDING' : 'PAID'
    });
    
    new QRCode(document.getElementById('qrcode'), {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // In a real implementation, you would trigger email sending here
    sendConfirmationEmail(registrationData, isOffline);
}

function sendConfirmationEmail(data, isOffline) {
    // In a real implementation, this would be handled by your backend
    console.log('Sending confirmation email to:', data.email);
    
    // Example of data to be sent to your email service
    const emailData = {
        to: data.email,
        subject: 'Event Registration Confirmation',
        registrationId: data.registrationId,
        name: data.name,
        isOffline: isOffline,
        // Include other necessary data
    };
    
    console.log('Email data:', emailData);
    // In a real implementation, you would make an API call to your backend
}

// Event data for each department
const departmentEvents = {
    cse: ["AI Workshop", "Web Development Hackathon", "Cybersecurity Challenge", "Data Science Seminar"],
    ece: ["IoT Workshop", "Embedded Systems Contest", "VLSI Design Challenge", "Signal Processing Seminar"],
    mech: ["Robotics Workshop", "Thermal Engineering Seminar", "Automobile Design Contest", "Manufacturing Expo"]
};

// Handle department selection to show event list
document.getElementById('department').addEventListener('change', function() {
    const selectedDepartment = this.value;
    const eventSelectionSection = document.getElementById('event-selection');
    const eventList = document.getElementById('event-list');

    // Clear previous event list
    eventList.innerHTML = '';

    // Show event selection section if a department is selected
    if (selectedDepartment && selectedDepartment !== '') {
        eventSelectionSection.classList.remove('hidden');

        // Populate event list
        departmentEvents[selectedDepartment].forEach(event => {
            const eventOption = document.createElement('div');
            eventOption.className = 'event-option';
            eventOption.innerHTML = `
                <input type="checkbox" id="event-${event}" name="events" value="${event}">
                <label for="event-${event}">${event}</label>
            `;
            eventList.appendChild(eventOption);
        });
    } else {
        eventSelectionSection.classList.add('hidden');
    }
});

// Handle form submission
document.getElementById('submit-btn').addEventListener('click', function(e) {
    e.preventDefault();

    // Validate event selection
    const selectedEvents = Array.from(document.querySelectorAll('input[name="events"]:checked')).map(el => el.value);
    if (selectedEvents.length < 2 || selectedEvents.length > 3) {
        alert('Please select 2-3 events.');
        return;
    }

    // Rest of the form validation and submission logic...
    // (Keep the existing code for form validation and submission)
});