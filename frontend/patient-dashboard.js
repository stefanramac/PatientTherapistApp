document.getElementById('createPatient').addEventListener('click', function() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Create Patient</h2>
        <!-- Form and content related to createPatient.js -->
    `;
});

document.getElementById('getPatients').addEventListener('click', function() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Get Patients</h2>
        <!-- Form and content related to getPatients.js -->
    `;
});

document.getElementById('insertTimeSlot').addEventListener('click', function() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Insert Time Slot</h2>
        <!-- Form and content related to insertTimeSlot.js -->
    `;
});

document.getElementById('deleteTimeSlot').addEventListener('click', function() {
    document.getElementById('mainContent').innerHTML = `
        <h2>Delete Time Slot</h2>
        <!-- Form and content related to deleteTimeSlot.js -->
    `;
});