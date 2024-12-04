document.addEventListener('DOMContentLoaded', () => {
    const cropDetailsRegisterForm = document.getElementById('crop-details-register-form');
    const addCropDetailsButton = document.getElementById('add-crop');
    const closeButton = document.getElementById('crop-details-register-close');
    const cropDetailsForm = document.getElementById('crop-details-form');
    const tableBody = document.querySelector('.crop-table tbody');
    let currentLogId = null; // To store the ID of the log being updated

    // Image input and preview mapping
    const imageHandler = {
        input: document.getElementById('crop-observed-image'),
        previewContainer: document.getElementById('crop-observed-image-preview-container'),
        preview: document.getElementById('crop-observed-image-preview'),
        removeButton: document.getElementById('crop-remove-observed-image'),
    };

    // Dropdown Elements
    const fieldCodesDropdown = document.getElementById('crop-field-codes');
    const cropCodesDropdown = document.getElementById('crop-codes');
    const staffIdsDropdown = document.getElementById('crop-staff-ids');

    // Open the registration form
    const openForm = () => {
        cropDetailsRegisterForm.style.display = 'flex';
        fetchData('http://localhost:8080/api/v1/field', fieldCodesDropdown, 'Select Field Codes');
        fetchData('http://localhost:8080/api/v1/crop', cropCodesDropdown, 'Select Crop Codes');
        fetchData('http://localhost:8080/api/v1/staff', staffIdsDropdown, 'Select Staff IDs');
    };

    // Close the registration form
    const closeForm = () => {
        cropDetailsRegisterForm.style.display = 'none';
        clearForm();
    };

    // Clear the form
    const clearForm = () => {
        cropDetailsForm.reset();
        currentLogId = null;
        imageHandler.previewContainer.style.display = 'none';
    };

    // Initialize image preview and removal functionality
    const initializeImageHandler = ({ input, previewContainer, preview, removeButton }) => {
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    previewContainer.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        });

        removeButton.addEventListener('click', () => {
            input.value = '';
            preview.src = '';
            previewContainer.style.display = 'none';
        });
    };

    initializeImageHandler(imageHandler);

    // Fetch data for dropdowns
    const fetchData = async (endpoint, dropdownElement, placeholderText) => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                populateDropdown(dropdownElement, data, placeholderText);
            } else {
                alert('Failed to fetch data.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const populateDropdown = (dropdownElement, data, placeholderText) => {
        dropdownElement.innerHTML = `<option value="">${placeholderText}</option>`;
        data.forEach((item) => {
            const option = document.createElement('option');
            option.value = item.code || item.staffId;
            option.textContent = item.code || item.staffId;
            dropdownElement.appendChild(option);
        });
    };

    // Fetch crop logs and display in the table
    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('http://localhost:8080/api/v1/cropDetails', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const logs = await response.json();
                tableBody.innerHTML = '';
                logs.forEach(addLogToTable);
            } else {
                alert('Failed to fetch logs.');
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    // Add a log entry to the table
    const addLogToTable = (log) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.cropId || 'N/A'}</td>
            <td>${log.cropName || 'N/A'}</td>
            <td>${log.type || 'N/A'}</td>
            <td>${log.area || 'N/A'}</td>
            <td>${log.yield || 'N/A'}</td>
            <td>${log.season || 'N/A'}</td>
            <td><button class="update-button">Update</button></td>
            <td><button class="delete-button">Delete</button></td>
        `;

        row.querySelector('.update-button').addEventListener('click', () => openUpdateForm(log));
        row.querySelector('.delete-button').addEventListener('click', () => deleteLog(log.cropId));
        tableBody.appendChild(row);
    };

    // Save or update a crop log
    cropDetailsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(cropDetailsForm);
        const method = currentLogId ? 'PATCH' : 'POST';
        const url = `http://localhost:8080/api/v1/cropDetails${currentLogId ? `/${currentLogId}` : ''}`;

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                fetchLogs();
                closeForm();
            } else {
                alert('Failed to save log.');
            }
        } catch (error) {
            console.error('Error saving log:', error);
        }
    });

    // Delete a log
    const deleteLog = async (cropId) => {
        if (!confirm('Are you sure you want to delete this log?')) return;

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`http://localhost:8080/api/v1/cropDetails/${cropId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                fetchLogs();
            } else {
                alert('Failed to delete log.');
            }
        } catch (error) {
            console.error('Error deleting log:', error);
        }
    };

    // Open the form for updating a log
    const openUpdateForm = (log) => {
        openForm();
        populateForm(log);
        currentLogId = log.cropId;
    };

    const populateForm = (log) => {
        document.getElementById('crop-log-date').value = log.logDate || '';
        document.getElementById('crop-log-details').value = log.logDetails || '';
        fieldCodesDropdown.value = log.fieldCodes || '';
        cropCodesDropdown.value = log.cropCodes || '';
        staffIdsDropdown.value = log.staffIds || '';
    };

    addCropDetailsButton.addEventListener('click', openForm);
    closeButton.addEventListener('click', closeForm);

    fetchLogs(); // Initial fetch
});
