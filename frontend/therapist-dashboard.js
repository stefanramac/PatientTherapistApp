// Helper function to convert date from YYYY-MM-DD to DD-MM-YYYY
function convertDateFormat(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
}

// Helper function to format time in HH:MM format
function formatTime(time) {
    return time.slice(0, 5); // Assumes time is in HH:MM:SS format and returns HH:MM
}

// Handle "Get Therapist Details"
document.getElementById('getTherapist').addEventListener('click', function() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Get Therapist Details</h2>
        <form id="therapistSearchForm">
            <label for="searchType">Search by:</label>
            <select id="searchType" name="searchType">
                <option value="therapistId">Therapist ID</option>
                <option value="email">Email</option>
            </select><br><br>

            <label for="searchValue">Enter Value:</label>
            <input type="text" id="searchValue" name="searchValue" required><br><br>

            <button type="submit">Search</button>
        </form>
        <div id="responseMessage"></div>
        <table id="therapistTable" style="display:none; margin-top:20px; width:100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px;">First Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Last Name</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Email</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Phone</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Specialization</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Experience (Years)</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Place</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Age</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Gender</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Address</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    document.getElementById('therapistSearchForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const searchType = document.getElementById('searchType').value;
        const searchValue = document.getElementById('searchValue').value;
        const data = {};
        data[searchType] = searchValue;

        try {
            const response = await fetch('http://localhost:3009/getTherapist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                const table = document.getElementById('therapistTable');
                table.style.display = 'table';

                const tbody = table.querySelector('tbody');
                tbody.innerHTML = `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${result.firstName}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${result.lastName}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${result.email}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${result.contactInfo.phone}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${result.profile.specialization}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${result.profile.experience}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${result.contactInfo.place}, ${result.contactInfo.country}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${result.profile.age}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${result.profile.gender}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${result.contactInfo.address}</td>
                    </tr>
                `;
            } else {
                document.getElementById('responseMessage').innerHTML = `<p style="color:red;">${result.message}</p>`;
            }
        } catch (error) {
            document.getElementById('responseMessage').innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        }
    });
});

// Handle "Insert Work Time"
document.getElementById('insertTherapistWorkTime').addEventListener('click', function() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Insert Work Time</h2>
        <form id="workTimeForm">
            <label for="therapistId">Therapist ID:</label>
            <input type="text" id="therapistId" name="therapistId" placeholder="Enter Therapist ID" required><br><br>

            <label for="date">Date:</label>
            <input type="date" id="date" name="date" required><br><br>

            <div id="timeSlotsContainer">
                <label for="timeSlot1">Time Slot 1:</label>
                <input type="time" id="start1" name="start1" required>
                <input type="time" id="end1" name="end1" required>
            </div>
            <button type="button" id="addTimeSlot">Add Another Time Slot</button><br><br>

            <button type="submit">Submit Work Time</button>
        </form>
        <div id="responseMessage"></div>
    `;

    let timeSlotCount = 1;

    document.getElementById('addTimeSlot').addEventListener('click', function() {
        timeSlotCount++;
        const timeSlotContainer = document.createElement('div');
        timeSlotContainer.innerHTML = `
            <label for="timeSlot${timeSlotCount}">Time Slot ${timeSlotCount}:</label>
            <input type="time" id="start${timeSlotCount}" name="start${timeSlotCount}" required>
            <input type="time" id="end${timeSlotCount}" name="end${timeSlotCount}" required><br><br>
        `;
        document.getElementById('timeSlotsContainer').appendChild(timeSlotContainer);
    });

    document.getElementById('workTimeForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const therapistId = document.getElementById('therapistId').value;
        const date = convertDateFormat(document.getElementById('date').value);
        const timeSlots = [];

        for (let i = 1; i <= timeSlotCount; i++) {
            const start = document.getElementById(`start${i}`).value;
            const end = document.getElementById(`end${i}`).value;
            if (start && end) {
                timeSlots.push({ start, end });
            }
        }

        if (timeSlots.length === 0) {
            document.getElementById('responseMessage').innerHTML = `<p style="color:red;">Please add at least one time slot.</p>`;
            return;
        }

        const data = { therapistId, date, time_slots: timeSlots };

        try {
            const response = await fetch('http://localhost:3007/insertTherapistWorkTime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                document.getElementById('responseMessage').innerHTML = `<p style="color:green;">${result.message}</p>`;
            } else {
                document.getElementById('responseMessage').innerHTML = `<p style="color:red;">${result.message}</p>`;
            }

        } catch (error) {
            document.getElementById('responseMessage').innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        }
    });
});

// Handle "Delete Work Time"
document.getElementById('deleteTherapistWorkTime').addEventListener('click', function() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Delete Work Time</h2>
        <form id="deleteWorkTimeForm">
            <label for="therapistId">Therapist ID:</label>
            <input type="text" id="therapistId" name="therapistId" placeholder="Enter Therapist ID" required><br><br>

            <label for="date">Date:</label>
            <input type="date" id="date" name="date" required><br><br>

            <div id="deleteTimeSlotsContainer">
                <label for="timeSlot1">Time Slot 1 (optional):</label>
                <input type="time" id="start1" name="start1">
                <input type="time" id="end1" name="end1">
            </div>
            <button type="button" id="addDeleteTimeSlot">Add Another Time Slot</button><br><br>

            <button type="submit">Delete Work Time</button>
        </form>
        <div id="responseMessage"></div>
    `;

    let deleteTimeSlotCount = 1;

    document.getElementById('addDeleteTimeSlot').addEventListener('click', function() {
        deleteTimeSlotCount++;
        const deleteTimeSlotContainer = document.createElement('div');
        deleteTimeSlotContainer.innerHTML = `
            <label for="timeSlot${deleteTimeSlotCount}">Time Slot ${deleteTimeSlotCount}:</label>
            <input type="time" id="start${deleteTimeSlotCount}" name="start${deleteTimeSlotCount}">
            <input type="time" id="end${deleteTimeSlotCount}" name="end${deleteTimeSlotCount}"><br><br>
        `;
        document.getElementById('deleteTimeSlotsContainer').appendChild(deleteTimeSlotContainer);
    });

    document.getElementById('deleteWorkTimeForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const therapistId = document.getElementById('therapistId').value;
        const date = convertDateFormat(document.getElementById('date').value);
        const timeSlots = [];

        for (let i = 1; i <= deleteTimeSlotCount; i++) {
            const start = document.getElementById(`start${i}`).value;
            const end = document.getElementById(`end${i}`).value;
            if (start && end) {
                timeSlots.push({ start, end });
            }
        }

        const data = timeSlots.length > 0 ? { therapistId, date, time_slots: timeSlots } : { therapistId, date };

        try {
            const response = await fetch('http://localhost:3008/deleteTherapistWorkTime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                document.getElementById('responseMessage').innerHTML = `<p style="color:green;">${result.message}</p>`;
            } else {
                document.getElementById('responseMessage').innerHTML = `<p style="color:red;">${result.message}</p>`;
            }

        } catch (error) {
            document.getElementById('responseMessage').innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        }
    });
});

// Handle "Check Availability"
document.getElementById('checkAvailability').addEventListener('click', function() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Check Availability</h2>
        <form id="availabilityForm">
            <label for="therapistId">Therapist ID:</label>
            <input type="text" id="therapistId" name="therapistId" placeholder="Enter Therapist ID" required><br><br>
            <button type="submit">Check</button>
        </form>
        <div id="availabilityResponse"></div>
    `;

    document.getElementById('availabilityForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const therapistId = document.getElementById('therapistId').value;
        const data = { therapistId };

        try {
            const response = await fetch('http://localhost:3000/checkAvailability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                const availabilityDiv = document.getElementById('availabilityResponse');
                availabilityDiv.innerHTML = `<h3>Availability for ${therapistId}</h3>`;

                result.unavailability.forEach(day => {
                    const date = day.date;
                    let dayHtml = `<h4>Date: ${date}</h4><table style="width: 100%; border-collapse: collapse;"><thead><tr><th style="border: 1px solid #ddd; padding: 8px;">From</th><th style="border: 1px solid #ddd; padding: 8px;">To</th><th style="border: 1px solid #ddd; padding: 8px;">Break</th></tr></thead><tbody>`;

                    day.time_slots.forEach((slot, index, slots) => {
                        const start = formatTime(slot.start);
                        const end = formatTime(slot.end);
                        const breakTime = index < slots.length - 1 ? `${formatTime(slots[index + 1].start)}` : 'End of Day';

                        dayHtml += `<tr><td style="border: 1px solid #ddd; padding: 8px;">${start}</td><td style="border: 1px solid #ddd; padding: 8px;">${end}</td><td style="border: 1px solid #ddd; padding: 8px;">${breakTime}</td></tr>`;
                    });

                    dayHtml += `</tbody></table>`;
                    availabilityDiv.innerHTML += dayHtml;
                });

            } else {
                document.getElementById('availabilityResponse').innerHTML = `<p style="color:red;">${result.message}</p>`;
            }
        } catch (error) {
            document.getElementById('availabilityResponse').innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        }
    });
});