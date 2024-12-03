document.addEventListener('DOMContentLoaded', () => {
    const fieldRegisterForm = document.getElementById('field-register-form');
    const addFieldButton = document.getElementById('add-field');
    const closeFieldButton = document.getElementById('field-register-close');
    const fieldForm = document.getElementById('field-form');
    const tableBody = document.querySelector('.field-table tbody');
    const formTitle = document.querySelector('.field-register-title');
    let currentFieldId = null; // To store the ID of the field being updated

    // Function to open the field registration form
    const openForm = () => {
        fieldRegisterForm.classList.add('active');
    };

    // Function to close the field registration form
    const closeForm = () => {
        fieldRegisterForm.classList.remove('active');
    };

    // Event listener for the Add Field button
    if (addFieldButton) {
        addFieldButton.addEventListener('click', () => {
            openForm(); // Open the form
            formTitle.textContent = 'Register Field'; // Set the form title
            clearForm(); // Clear any existing data in the form
            fetchStaff(); // Fetch staff data for dropdown
        });
    }

    // Function to clear the form
    const clearForm = () => {
        fieldForm.reset();
        currentFieldId = null; // Reset the current field ID
    };

    // Event listener for closing the form
    if (closeFieldButton) {
        closeFieldButton.addEventListener('click', closeForm);
    }

    // Close form when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === fieldRegisterForm) {
            closeForm();
        }
    });

    const isAuthenticated = () => {
        const token = localStorage.getItem('jwtToken');
        return token && token !== null;
    };

    const fetchFields = async () => {
        if (!isAuthenticated()) {
            alert('You must be logged in to view fields.');
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('http://localhost:8080/api/v1/field', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const fields = await response.json();
                tableBody.innerHTML = '';
                fields.forEach(addFieldToTable);
            } else {
                alert('Failed to fetch fields. Please try again later.');
            }
        } catch (error) {
            console.error('Error fetching fields:', error);
            alert('An error occurred while fetching fields.');
        }
    };

    const fetchStaff = async () => {
        if (!isAuthenticated()) {
            alert('You must be logged in to view staff.');
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('http://localhost:8080/api/v1/staff', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const staff = await response.json();
                populateStaffDropdown(staff);
            } else {
                alert('Failed to fetch staff. Please try again later.');
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            alert('An error occurred while fetching staff.');
        }
    };

    const populateStaffDropdown = (staff) => {
        const staffDropdown = document.getElementById('crop-field-code');
        staffDropdown.innerHTML = '<option value="">Select Staff ID</option>';
        staff.forEach(staffMember => {
            const option = document.createElement('option');
            option.value = staffMember.staffId;
            option.textContent = staffMember.staffId;
            staffDropdown.appendChild(option);
        });
    };

    fieldForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isAuthenticated()) {
            alert('You must be logged in to save or update a field.');
            return;
        }

        const fieldName = document.getElementById('field-name').value;
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        const extendSize = document.getElementById('field-extent-size').value;
        const fieldImage1 = document.getElementById('field-image1');
        const fieldImage2 = document.getElementById('field-image2');
        const staffIds = document.getElementById('crop-field-code').value;

        const formData = new FormData();
        formData.append("fieldName", fieldName);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
        formData.append("extentSize", extendSize);
        formData.append("fieldImage1", fieldImage1.files[0], fieldImage1.files[0].name);
        formData.append("fieldImage2", fieldImage2.files[0], fieldImage2.files[0].name);
        formData.append("staffIds", staffIds);

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`http://localhost:8080/api/v1/field${currentFieldId ? `/${currentFieldId}` : ''}`, {
                method: currentFieldId ? 'PATCH' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                fetchFields();
                clearForm();
                closeForm();
                currentFieldId = null;
            } else {
                alert('Failed to save field. Please try again.');
            }
        } catch (error) {
            console.error('Error saving field:', error);
            alert('An error occurred while saving the field.');
        }
    });

    const addFieldToTable = (field) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${field.fieldCode || 'N/A'}</td>
            <td>${field.fieldName || 'N/A'}</td>
            <td>${field.extendSize || 'N/A'}</td>
            <td><img src="data:image/png;base64,${field.fieldImage1 || ''}" alt="Image 1" class="field-image-table" /></td>
            <td><img src="data:image/png;base64,${field.fieldImage2 || ''}" alt="Image 2" class="field-image-table" /></td>
            <td>${field.fieldLocation.x !== undefined && field.fieldLocation.y !== undefined ? `(${field.fieldLocation.x}, ${field.fieldLocation.y})` : 'N/A'}</td>
            <td><span class="update-button"><i class="fas fa-edit"></i></span></td>
            <td><span class="delete-button"><i class="fas fa-trash"></i></span></td>
        `;
        row.querySelector('.update-button').addEventListener('click', () => openUpdateForm(field));
        row.querySelector('.delete-button').addEventListener('click', () => deleteField(field.fieldCode));

        tableBody.appendChild(row);
    };

    const openUpdateForm = (field) => {
        openForm();
        formTitle.textContent = 'Update Field';
        populateFieldForm(field);
        currentFieldId = field.fieldCode;
    };

    const populateFieldForm = (field) => {
        document.getElementById('field-name').value = field.fieldName;
        document.getElementById('latitude').value = field.fieldLocation.x;
        document.getElementById('longitude').value = field.fieldLocation.y;
        document.getElementById('field-extent-size').value = field.extendSize;

        const staffDropdown = document.getElementById('crop-field-code');
        if (field.staffIds && Array.isArray(field.staffIds)) {
            field.staffIds.forEach(staffId => {
                const option = staffDropdown.querySelector(`option[value="${staffId}"]`);
                if (option) {
                    option.selected = true;
                }
            });
        }
    };

    const deleteField = async (fieldCode) => {
        if (!isAuthenticated()) {
            alert('You must be logged in to delete a field.');
            return;
        }

        const confirmDelete = confirm('Are you sure you want to delete this field?');
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`http://localhost:8080/api/v1/field/${fieldCode}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchFields();
            } else {
                alert('Failed to delete field. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting field:', error);
            alert('An error occurred while deleting the field.');
        }
    };

    fetchFields();
});
