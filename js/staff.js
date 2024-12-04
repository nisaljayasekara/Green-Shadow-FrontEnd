document.addEventListener('DOMContentLoaded', () => {
    // Elements for Staff Management
    const addStaffButton = document.getElementById('add-staff');
    const staffRegisterForm = document.getElementById('staffRegisterForm');
    const closeButton = document.getElementById('staffRegisterForm-close');
    const staffForm = document.getElementById('staff-form');
    const tableBody = document.querySelector('.staff-table tbody');
    const formTitle = document.getElementById('registerTitle');

    // Function to open the registration form
    const openForm = () => {
        staffRegisterForm.classList.add('active');
    };

    // Function to close the registration form
    const closeForm = () => {
        staffRegisterForm.classList.remove('active');
    };

    // Add event listeners for opening and closing the form
    addStaffButton.addEventListener('click', () => {
        openForm();
        formTitle.textContent = 'Register Staff Member';  // Reset title to "Register"
        clearForm(); // Clear the form for new registration
    });

    closeButton.addEventListener('click', closeForm);

    // Close the form when clicking outside it
    window.addEventListener('click', (event) => {
        if (event.target === staffRegisterForm) {
            closeForm();
        }
    });

    // Check if the user is authenticated
    const isAuthenticated = () => {
        const token = localStorage.getItem('jwtToken');
        return token && token !== null;
    };

    // Fetch and display staff data from the backend
    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('http://localhost:8080/api/v1/staff', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const staff = await response.json();
                tableBody.innerHTML = ''; // Clear the table
                staff.forEach(addStaffToTable); // Add each staff to the table
            } else if (response.status === 401) {
                alert('Authentication failed. Please log in again.');
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch staff:', errorText);
                alert('Failed to fetch staff. Please try again later.');
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            alert('An error occurred while fetching staff.');
        }
    };

    // Save staff data (both for registration and updating)
    staffForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isAuthenticated()) {
            alert('You must be logged in to register or update staff');
            return;
        }

        // Get form data
        const staffId = staffForm.dataset.staffId || null; // Retrieve staffId if updating
        const staffData = {
            firstName: document.getElementById('first_name').value.trim(),
            lastName: document.getElementById('last_name').value.trim(),
            email: document.getElementById('email').value.trim(),
            contactNo: document.getElementById('contact_no').value.trim(),
            dob: document.getElementById('dob').value.trim(),
            joinedDate: document.getElementById('joined_date').value.trim(),
            addressLine1: document.getElementById('address_line1').value.trim(),
            addressLine2: document.getElementById('address_line2').value.trim(),
            addressLine3: document.getElementById('address_line3').value.trim(),
            addressLine4: document.getElementById('address_line4').value.trim(),
            addressLine5: document.getElementById('address_line5').value.trim(),
            designation: document.getElementById('designation').value.trim(),
            gender: document.getElementById('gender').value.trim(),
            role: document.getElementById('role').value.trim(),
        };

        try {
            const token = localStorage.getItem('jwtToken');
            let response;

            if (staffId) {
                // Update staff if an ID is present
                response = await fetch(`http://localhost:8080/api/v1/staff/${staffId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(staffData),
                });
            } else {
                // Register a new staff member
                response = await fetch('http://localhost:8080/api/v1/staff', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(staffData),
                });
            }

            if (response.ok || response.status === 201) {
                await fetchStaff(); // Reload the staff table
                clearForm();
                closeForm();
            } else {
                const errorText = await response.text();
                console.error('Failed to save staff. Response text:', errorText);
                alert(`Failed to save staff: ${errorText}`);
            }
        } catch (error) {
            console.error('Error saving staff:', error);
            alert(`An error occurred: ${error.message}`);
        }
    });

    // Function to dynamically add staff to the table
    const addStaffToTable = (staff) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${staff.staffId || 'N/A'}</td>
            <td>${staff.firstName || 'N/A'}</td>
            <td>${staff.lastName || 'N/A'}</td>
            <td>${staff.email || 'N/A'}</td>
            <td>${staff.contactNo || 'N/A'}</td>
            <td>${staff.dob || 'N/A'}</td>
            <td>${staff.joinedDate || 'N/A'}</td>
            <td>${staff.addressLine1 || 'N/A'}</td>
            <td>${staff.addressLine2 || 'N/A'}</td>
            <td>${staff.addressLine3 || 'N/A'}</td>
            <td>${staff.addressLine4 || 'N/A'}</td>
            <td>${staff.addressLine5 || 'N/A'}</td>
            <td>${staff.designation || 'N/A'}</td>
            <td>${staff.gender || 'N/A'}</td>
            <td>${staff.role || 'N/A'}</td>
            <td><span class="update-button"><i class="fas fa-edit"></i></span></td>
            <td><span class="delete-button"><i class="fas fa-trash"></i></span></td>
        `;
        row.querySelector('.update-button').addEventListener('click', () => {
            openForm();
            formTitle.textContent = 'Update Staff Member'; // Change title to "Update"
            populateUpdateForm(staff);
        });
        row.querySelector('.delete-button').addEventListener('click', () => {
            deleteStaff(staff.staffId);
        });

        tableBody.appendChild(row);
    };

    // Populate the form with staff data for update
    const populateUpdateForm = (staff) => {
        staffForm.dataset.staffId = staff.staffId; // Store staff ID for updating
        document.getElementById('first_name').value = staff.firstName || '';
        document.getElementById('last_name').value = staff.lastName || '';
        document.getElementById('email').value = staff.email || '';
        document.getElementById('contact_no').value = staff.contactNo || '';
        document.getElementById('dob').value = staff.dob || '';
        document.getElementById('joined_date').value = staff.joinedDate || '';
        document.getElementById('address_line1').value = staff.addressLine1 || '';
        document.getElementById('address_line2').value = staff.addressLine2 || '';
        document.getElementById('address_line3').value = staff.addressLine3 || '';
        document.getElementById('address_line4').value = staff.addressLine4 || '';
        document.getElementById('address_line5').value = staff.addressLine5 || '';
        document.getElementById('designation').value = staff.designation || '';
        document.getElementById('gender').value = staff.gender || '';
        document.getElementById('role').value = staff.role || '';
    };

    // Function to delete a staff member
    const deleteStaff = async (staffId) => {
        if (!confirm('Are you sure you want to delete this staff member?')) return;

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`http://localhost:8080/api/v1/staff/${staffId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await fetchStaff(); // Reload the staff table
            } else {
                const errorText = await response.text();
                console.error('Failed to delete staff. Response text:', errorText);
                alert(`Failed to delete staff: ${errorText}`);
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert(`An error occurred: ${error.message}`);
        }
    };

    // Clear form fields
    const clearForm = () => {
        staffForm.reset();
        delete staffForm.dataset.staffId; // Remove staff ID
    };

    // Initial fetch of staff data
    fetchStaff();
});
