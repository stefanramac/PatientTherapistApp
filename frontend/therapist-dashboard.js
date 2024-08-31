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