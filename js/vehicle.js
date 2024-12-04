document.addEventListener('DOMContentLoaded', () => {
    const vehicleRegisterForm = document.getElementById('vehicle-register-form');
    const addVehicleButton = document.getElementById('add-vehicle');
    const closeButton = document.getElementById('vehicle-register-close');
    const vehicleForm = document.getElementById('vehicle-form');
    const tableBody = document.querySelector('.vehicle-table tbody');
    const staffIdDropdown = document.getElementById('staff-id');
    const formTitle = document.querySelector('.vehicle-register-title');
    let currentVehicleId = null;

    // Function to open the registration form
    const openForm = () => {
        vehicleRegisterForm.classList.add('active');
    };

    // Function to close the registration form
    const closeForm = () => {
        vehicleRegisterForm.classList.remove('active');
        clearForm(); // Clear the form when closed
    };

    // Add event listeners for opening and closing the form
    addVehicleButton.addEventListener('click', () => {
        openForm();
        formTitle.textContent = 'Register Vehicle'; // Reset title to "Register"
        clearForm(); // Clear the form for new registration
    });

    closeButton.addEventListener('click', closeForm);

    // Close the form when clicking outside it
    window.addEventListener('click', (event) => {
        if (event.target === vehicleRegisterForm) {
            closeForm();
        }
    });

    // Fetch and display vehicles from the backend
    const fetchVehicles = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/v1/vehicles');
            if (response.ok) {
                const vehicles = await response.json();
                tableBody.innerHTML = ''; // Clear the table
                vehicles.forEach(addVehicleToTable); // Add each vehicle to the table
            } else {
                console.error('Failed to fetch vehicles:', await response.text());
                alert('Failed to fetch vehicles. Please try again later.');
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            alert('An error occurred while fetching vehicles.');
        }
    };

    // Save vehicle data (both for registration and updating)
    vehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const vehicleData = {
            licensePlateNumber: document.getElementById('license-plate-number').value.trim(),
            fuelType: document.getElementById('fuel-type').value.trim(),
            status: document.getElementById('status').value.trim(),
            vehicleCategory: document.getElementById('vehicle-category').value.trim(),
            staffId: document.getElementById('staff-id').value.trim(),
            remarks: document.getElementById('remarks').value.trim(),
        };

        try {
            let response;

            if (currentVehicleId) {
                // Update vehicle if an ID is present
                response = await fetch(`http://localhost:8080/api/v1/vehicles/${currentVehicleId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(vehicleData),
                });
            } else {
                // Register a new vehicle
                response = await fetch('http://localhost:8080/api/v1/vehicles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(vehicleData),
                });
            }

            if (response.ok) {
                await fetchVehicles(); // Reload the vehicles table
                closeForm();
            } else {
                console.error('Failed to save vehicle:', await response.text());
                alert('Failed to save vehicle. Please try again.');
            }
        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('An error occurred while saving the vehicle.');
        }
    });

    // Function to dynamically add vehicle to the table
    const addVehicleToTable = (vehicle) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vehicle.vehicleId || 'N/A'}</td>
            <td>${vehicle.vehicleCategory || 'N/A'}</td>
            <td>${vehicle.fuelType || 'N/A'}</td>
            <td>${vehicle.status || 'N/A'}</td>
            <td>${vehicle.licensePlateNumber || 'N/A'}</td>
            <td><button class="update-button">Update</button></td>
            <td><button class="delete-button">Delete</button></td>
        `;
        row.querySelector('.update-button').addEventListener('click', () => {
            openForm();
            formTitle.textContent = 'Update Vehicle'; // Change title to "Update"
            populateUpdateForm(vehicle);
        });
        row.querySelector('.delete-button').addEventListener('click', () => {
            deleteVehicle(vehicle.vehicleId);
        });

        tableBody.appendChild(row);
    };

    // Populate the form with vehicle data for update
    const populateUpdateForm = (vehicle) => {
        currentVehicleId = vehicle.vehicleId; // Store vehicle ID for updating
        document.getElementById('license-plate-number').value = vehicle.licensePlateNumber || '';
        document.getElementById('fuel-type').value = vehicle.fuelType || '';
        document.getElementById('status').value = vehicle.status || '';
        document.getElementById('vehicle-category').value = vehicle.vehicleCategory || '';
        document.getElementById('staff-id').value = vehicle.staffId || '';
        document.getElementById('remarks').value = vehicle.remarks || '';
    };

    // Function to delete a vehicle
    const deleteVehicle = async (vehicleId) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/v1/vehicles/${vehicleId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchVehicles(); // Reload the vehicles table
            } else {
                console.error('Failed to delete vehicle:', await response.text());
                alert('Failed to delete vehicle. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('An error occurred while deleting the vehicle.');
        }
    };

    // Clear form fields
    const clearForm = () => {
        vehicleForm.reset();
        currentVehicleId = null; // Reset vehicle ID
    };

    // Initial fetch of vehicles data
    fetchVehicles();
});
