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

document.getElementById('insertTherapistWorkTime').addEventListener('click', function() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Insert Work Time</h2>
        <form id="workTimeForm">
            <label for="therapistId">Therapist ID:</label>
            <input type="text" id="therapistId" name="therapistId" value="katarinamilosevic" readonly><br><br>

            <label for="date">Date:</label>
            <input type="date" id="date" name="date"><br><br>

            <div id="timeSlotsContainer">
                <label for="timeSlot1">Time Slot 1:</label>
                <input type="time" id="start1" name="start1">
                <input type="time" id="end1" name="end1">
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
            <input type="time" id="start${timeSlotCount}" name="start${timeSlotCount}">
            <input type="time" id="end${timeSlotCount}" name="end${timeSlotCount}"><br><br>
        `;
        document.getElementById('timeSlotsContainer').appendChild(timeSlotContainer);
    });

    document.getElementById('workTimeForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const therapistId = document.getElementById('therapistId').value;
        const date = document.getElementById('date').value;
        const timeSlots = [];

        for (let i = 1; i <= timeSlotCount; i++) {
            const start = document.getElementById(`start${i}`).value;
            const end = document.getElementById(`end${i}`).value;
            if (start && end) {
                timeSlots.push({ start, end });
            }
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