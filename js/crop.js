document.addEventListener('DOMContentLoaded', () => {
    // Elements for the Crop Details Registration Form
    const cropDetailsRegisterForm = document.getElementById('crop-details-register-form');
    const addCropDetailsButton = document.getElementById('add-crop');
    const closeButton = document.getElementById('crop-details-register-close');
    const cropForm = document.getElementById('crop-form');
    const fieldCodesDropdown = document.getElementById('crop-field-codes');

    // Fetch data for field codes
    const fetchData = async (endpoint, dropdownElement, placeholderText) => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
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
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.code; // Adjust based on the object
            option.textContent = item.code; // Adjust based on the object
            dropdownElement.appendChild(option);
        });
    };

    // Event listeners
    addCropDetailsButton.addEventListener('click', () => {
        cropDetailsRegisterForm.classList.add('active'); // Show the form
        fetchData('http://localhost:8080/api/v1/field', fieldCodesDropdown, 'Select Field Codes');
    });

    closeButton.addEventListener('click', () => {
        cropDetailsRegisterForm.classList.remove('active'); // Hide the form
    });

    cropForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const cropCode = document.getElementById('crop-code').value;
        const commonName = document.getElementById('common-name').value;
        const scientificName = document.getElementById('scientific-name').value;
        const category = document.getElementById('category').value;
        const season = document.getElementById('season').value;
        const fieldCode = fieldCodesDropdown.value;
        const cropImage = document.getElementById('crop-observed-image').files[0];

        const formData = new FormData();
        formData.append("cropCode", cropCode);
        formData.append("commonName", commonName);
        formData.append("scientificName", scientificName);
        formData.append("category", category);
        formData.append("season", season);
        formData.append("fieldCode", fieldCode);
        if (cropImage) {
            formData.append("cropImage", cropImage, cropImage.name);
        }

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('http://localhost:8080/api/v1/crop', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                alert('Crop details added successfully!');
                cropForm.reset();
                cropDetailsRegisterForm.classList.remove('active'); // Hide the form after submission
                // Optionally, fetch and refresh the crop table here
            } else {
                alert('Failed to add crop details. Please try again.');
            }
        } catch (error) {
            console.error('Error adding crop details:', error);
            alert('An error occurred while adding crop details.');
        }
    });
});
