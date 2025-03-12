// Department-specific options
const departmentOptions = {
    civil: ["Project Presentation", "Paper Presentstion", "CAD Master", "Fun Series", "Watery Rocketry", "Mr.Mechanic"],
    cse: ["Paper Presentstion", "Project Presentation", "Google Hunt", "Crash Your Codes", "Web Master", "Gaming"],
    aids: ["Paper Presentstion", "Project Presentation", "Google Hunt", "Crash Your Codes", "Web Master", "Gaming"],
    ece: ["Paper Presentstion", "Project Presentation", "Tech Connection", "Circuit Debugging", "Technical Quiz", "Treasure Hunt"],
    eee: ["Paper Presentstion", "Project Presentation", "Tech Connection", "Circuit Debugging", "Technical Quiz", "Treasure Hunt"],
    it: ["Paper Presentstion", "Project Presentation", "Google Hunt", "Crash Your Codes", "Web Master", "Gaming"],
    mech: ["Project Presentation", "Paper Presentstion", "CAD Master", "Fun Series", "Watery Rocketry", "Mr.Mechanic"],
    sh: ["Paper Presentstion", "Fun Quiz", "Technical Debate", "Pencil Sketch & Painting", "Math Puzzles", "Karaoke Singing", "Drama & Mime"],
    mba: ["Paper Presentstion", "Best Manager", "Business Quiz", "ADZAP", "Corporate Walk", "Corporate Stall", "Treasure Hunt"],
};

// Apply entrance animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    anime({
        targets: '.container',
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutExpo',
        duration: 1000,
        delay: 300
    });
    
    anime({
        targets: '.form-group',
        opacity: [0, 1],
        translateY: [20, 0],
        easing: 'easeOutExpo',
        duration: 800,
        delay: anime.stagger(100, {start: 600})
    });
});

// Load department-specific options as checkboxes
document.getElementById('department').addEventListener('change', function() {
    const deptValue = this.value;
    const deptOptionsContainer = document.getElementById('dept-options-container');
    const deptOptionsDiv = document.getElementById('dept-specific-options');
   
    if (deptValue && departmentOptions[deptValue]) {
        // Clear previous options
        deptOptionsContainer.innerHTML = '';
       
        // Add new options as checkboxes
        departmentOptions[deptValue].forEach(option => {
            const optionId = option.toLowerCase().replace(/\s+/g, '-');
           
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
           
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = optionId;
            checkbox.value = option;
            checkbox.name = 'dept-options';
            checkbox.addEventListener('change', updateSelectedOptions);
           
            const label = document.createElement('label');
            label.htmlFor = optionId;
            label.textContent = option;
           
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);
           
            deptOptionsContainer.appendChild(checkboxItem);
        });
       
        deptOptionsDiv.classList.remove('hidden');
    } else {
        deptOptionsDiv.classList.add('hidden');
    }
});

// Update selected options
function updateSelectedOptions() {
    const checkboxes = document.querySelectorAll('input[name="dept-options"]:checked');
    const selectedOptions = Array.from(checkboxes).map(cb => cb.value);
   
    // Limit to maximum 3 selections
    if (checkboxes.length > 3) {
        alert('You can select a maximum of 3 options');
        this.checked = false;
        return;
    }
   
    // Store selected options in hidden input
    document.getElementById('selected-dept-options').value = JSON.stringify(selectedOptions);
}

// Handle payment mode selection
function selectPaymentMode(element) {
    // Remove selected class from all options
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
   
    // Add selected class to clicked option
    element.classList.add('selected');
   
    // Set the hidden input value
    document.getElementById('payment-mode').value = element.dataset.mode;
}

// Generate a unique registration number
function generateRegistrationNumber() {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `EVT-${dateStr}-${randomStr}`;
}

// Submit form function
function submitForm() {
    // Validate form
    const form = document.getElementById('registration-form');
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        whatsapp: document.getElementById('whatsapp').value,
        college: document.getElementById('college').value,
        year: document.getElementById('year').value,
        department: document.getElementById('department').value,
        deptOptions: JSON.parse(document.getElementById('selected-dept-options').value || '[]'),
        projectLink: document.getElementById('project-link').value,
        paymentMode: document.getElementById('payment-mode').value,
    };
   
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.whatsapp ||
        !formData.college || !formData.year || !formData.department ||
        (formData.deptOptions.length < 1) || !formData.projectLink || !formData.paymentMode) {
        alert('Please fill all required fields');
        return;
    }
   
    // Check if at least 1 and at most 3 department options are selected
    if (formData.deptOptions.length < 1 || formData.deptOptions.length > 3) {
        alert('Please select between 1 and 3 department options');
        return;
    }
   
    // Validate Google Drive link
    if (!formData.projectLink.includes('drive.google.com')) {
        alert('Please enter a valid Google Drive link');
        return;
    }
   
    // Show loader
    document.getElementById('loader').style.display = 'block';
    document.getElementById('registration-form').style.opacity = '0.5';
    document.getElementById('submit-btn').disabled = true;
   
    // Add registration number for data to be sent to server
    formData.registrationNumber = generateRegistrationNumber();
   
    // Simulate sending data to server (MongoDB)
    setTimeout(() => {
        // In a real app, you would use fetch or axios to send data to your server
        console.log('Sending data to MongoDB:', formData);
       
        // Handle different payment modes
        if (formData.paymentMode === 'online') {
            // Process online payment with Razorpay
            processRazorpayPayment(formData);
        } else {
            // Complete offline registration
            completeRegistration(formData, true);
        }
    }, 1500);
}

// Process Razorpay payment
function processRazorpayPayment(formData) {
    // In a real app, you would make an API call to your server to create an order
    // and get the order ID. Here we're simulating that.
   
    const paymentAmount = 250; // Amount in paise (₹500)
   
    // Razorpay configuration
    const options = {
        key: "rzp_test_YOUR_RAZORPAY_KEY", // Replace with your actual Razorpay key
        amount: paymentAmount,
        currency: "INR",
        name: "Event Registration",
        description: "Registration Fee",
        image: "/api/placeholder/150/80", // Replace with your actual logo URL
        handler: function(response) {
            // This function runs after successful payment
            console.log("Payment successful:", response);
           
            // In a real app, you would verify the payment on the server
            // Here we're simulating that process
           
            // Add payment details to formData
            formData.paymentId = response.razorpay_payment_id;
            formData.paymentStatus = "paid";
           
            // Complete registration
            completeRegistration(formData, false);
        },
        prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
        },
        theme: {
            color: "#667eea"
        },
        modal: {
            ondismiss: function() {
                // Handle case where user closes the Razorpay modal
                document.getElementById('loader').style.display = 'none';
                document.getElementById('registration-form').style.opacity = '1';
                document.getElementById('submit-btn').disabled = false;
            }
        }
    };
   
    // Initialize Razorpay
    const razorpay = new window.Razorpay(options);
    razorpay.open();
}

// Complete registration process
function completeRegistration(formData, showRegNumber) {
    // In a real app, this would be done on your server
    console.log("Registration completed:", formData);
   
    // Hide loader
    document.getElementById('loader').style.display = 'none';
   
    // Show success message
    document.getElementById('registration-form').classList.add('hidden');
    document.getElementById('success-message').classList.remove('hidden');
   
    if (showRegNumber) {
        // Show registration number for offline payment
        document.getElementById('offline-success').classList.remove('hidden');
        document.getElementById('registration-number').textContent = formData.registrationNumber;
       
        // In a real app, you would trigger email sending from your server
        console.log("Sending email for offline payment with registration number:", formData.registrationNumber);
    } else {
        // Online payment success message
        document.getElementById('online-success').classList.remove('hidden');
       
        // In a real app, you would trigger email sending from your server
        console.log("Sending email for online payment");
    }
   
    // In a real application, you would make an API call to your server to:
    // 1. Save registration data to MongoDB
    // 2. Send confirmation email
    // Something like:
    /*
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    */
}