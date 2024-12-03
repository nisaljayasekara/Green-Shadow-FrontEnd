document.addEventListener('DOMContentLoaded', () => {
    const equipmentRegisterForm = document.getElementById('equipment-register-form');
    const addEquipmentButton = document.getElementById('add-equipment');
    const closeButton = document.getElementById('equipment-register-close');
    const equipmentForm = document.getElementById('equipment-form');
    const tableBody = document.querySelector('.equipment-table tbody');
    const formTitle = document.querySelector('.equipment-register-title');
    let currentEquipmentId = null; // To store the ID of the equipment being updated

    // Function to open the registration form
    const openForm = () => {
        equipmentRegisterForm.classList.add('active');
    };

    // Function to close the registration form
    const closeForm = () => {
        equipmentRegisterForm.classList.remove('active');
        clearForm(); // Clear form on close
    };

    // Add event listeners for opening and closing the form
    if (addEquipmentButton) {
        addEquipmentButton.addEventListener('click', () => {
            openForm();
            formTitle.textContent = 'Register Equipment'; // Reset title to "Register"
            clearForm(); // Clear the form for new registration
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeForm);
    }

    // Close the form when clicking outside it
    window.addEventListener('click', (event) => {
        if (event.target === equipmentRegisterForm) {
            closeForm();
        }
    });

    // Fetch and display equipment data from the backend
    const fetchEquipments = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/equipments');
            if (response.ok) {
                const equipments = await response.json();
                tableBody.innerHTML = '';
                equipments.forEach(addEquipmentToTable);
            } else {
                console.error('Failed to fetch equipments:', await response.text());
                alert('Failed to fetch equipments. Please try again later.');
            }
        } catch (error) {
            console.error('Error fetching equipments:', error);
            alert('An error occurred while fetching equipments.');
        }
    };

    // Save equipment data
    equipmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const equipmentName = document.getElementById('equipment-name').value.trim();
        const equipmentType = document.getElementById('equipment-type').value.trim();
        const equipmentStatus = document.getElementById('equipment-status').value.trim();
        const equipmentFieldCode = document.getElementById('equipment-field-code').value.trim();
        const equipmentStaffId = document.getElementById('equipment-staff-id').value.trim();

        const equipmentData = {
            name: equipmentName,
            type: equipmentType,
            status: equipmentStatus,
            fieldCode: equipmentFieldCode,
            staffId: equipmentStaffId,
        };

        try {
            let response;
            if (currentEquipmentId) {
                // Update equipment if an ID is present
                response = await fetch(`http://localhost:8080/api/v1/equipments/${currentEquipmentId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(equipmentData),
                });
            } else {
                // Register a new equipment
                response = await fetch('http://localhost:8080/api/v1/equipments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(equipmentData),
                });
            }

            if (response.ok || response.status === 201) {
                await fetchEquipments();
                closeForm();
                currentEquipmentId = null; // Reset the equipment ID after submission
            } else {
                const errorText = await response.text();
                console.error('Failed to save equipment:', errorText);
                alert(`Failed to save equipment: ${errorText}`);
            }
        } catch (error) {
            console.error('Error saving equipment:', error);
            alert(`An error occurred: ${error.message}`);
        }
    });

    // Function to dynamically add equipment to the table
    const addEquipmentToTable = (equipment) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${equipment.id || 'N/A'}</td>
            <td>${equipment.fieldCode || 'N/A'}</td>
            <td>${equipment.name || 'N/A'}</td>
            <td>${equipment.staffId || 'N/A'}</td>
            <td>${equipment.status || 'N/A'}</td>
            <td>${equipment.type || 'N/A'}</td>
            <td><button class="update-button">Update</button></td>
            <td><button class="delete-button">Delete</button></td>
        `;
        row.querySelector('.update-button').addEventListener('click', () => {
            openForm();
            formTitle.textContent = 'Update Equipment'; // Change title to "Update"
            populateUpdateForm(equipment);
        });
        row.querySelector('.delete-button').addEventListener('click', () => {
            deleteEquipment(equipment.id);
        });

        tableBody.appendChild(row);
    };

    // Populate the form with equipment data for update
    const populateUpdateForm = (equipment) => {
        document.getElementById('equipment-name').value = equipment.name || '';
        document.getElementById('equipment-type').value = equipment.type || '';
        document.getElementById('equipment-status').value = equipment.status || '';
        document.getElementById('equipment-field-code').value = equipment.fieldCode || '';
        document.getElementById('equipment-staff-id').value = equipment.staffId || '';

        currentEquipmentId = equipment.id; // Set the ID of the equipment being updated
    };

    // Function to clear the form fields
    const clearForm = () => {
        equipmentForm.reset();
        currentEquipmentId = null; // Reset the equipment ID after submission
    };

    // Function to delete equipment with confirmation
    const deleteEquipment = async (equipmentId) => {
        const isConfirmed = confirm('Are you sure you want to delete this equipment?');

        if (isConfirmed) {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/equipments/${equipmentId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    alert('Equipment deleted successfully');
                    await fetchEquipments(); // Re-fetch the equipments after deletion
                } else {
                    const errorText = await response.text();
                    console.error('Failed to delete equipment:', errorText);
                    alert(`Failed to delete equipment: ${errorText}`);
                }
            } catch (error) {
                console.error('Error deleting equipment:', error);
                alert(`An error occurred: ${error.message}`);
            }
        } else {
            console.log('Equipment deletion canceled');
        }
    };

    // Fetch equipments on page load
    fetchEquipments();
});
